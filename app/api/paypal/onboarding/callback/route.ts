import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const API_ARUBA =
  "https://www.agentiplusdb.net/ottica-api/paypal_collegamento.php";

type MerchantStatus = {
  merchant_id?: string;
  tracking_id?: string;
  primary_email_confirmed?: boolean;
  payments_receivable?: boolean;
  merchant_status?: string;
  products?: Array<{
    name?: string;
    vetting_status?: string;
  }>;
};

function paypalBaseUrl() {
  return process.env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

function getConfig() {
  const clientId =
    process.env.PAYPAL_CLIENT_ID?.trim();

  const clientSecret =
    process.env.PAYPAL_CLIENT_SECRET?.trim();

  const partnerId =
    process.env.PAYPAL_PARTNER_ID?.trim();

  const attributionId =
    process.env.PAYPAL_PARTNER_ATTRIBUTION_ID?.trim();

  if (!clientId) {
    throw new Error(
      "PAYPAL_CLIENT_ID non configurato."
    );
  }

  if (!clientSecret) {
    throw new Error(
      "PAYPAL_CLIENT_SECRET non configurato."
    );
  }

  if (!partnerId) {
    throw new Error(
      "PAYPAL_PARTNER_ID non configurato."
    );
  }

  if (!attributionId) {
    throw new Error(
      "PAYPAL_PARTNER_ATTRIBUTION_ID non configurato."
    );
  }

  return {
    clientId,
    clientSecret,
    partnerId,
    attributionId,
  };
}

async function getAccessToken() {
  const {
    clientId,
    clientSecret,
  } = getConfig();

  const basic = Buffer.from(
    `${clientId}:${clientSecret}`
  ).toString("base64");

  const risposta = await fetch(
    `${paypalBaseUrl()}/v1/oauth2/token`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type":
          "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: "grant_type=client_credentials",
      cache: "no-store",
    }
  );

  const testo = await risposta.text();

  let payload: {
    access_token?: string;
    error?: string;
    error_description?: string;
  };

  try {
    payload = JSON.parse(testo);
  } catch {
    throw new Error(
      "PayPal ha restituito una risposta non valida durante l'autenticazione."
    );
  }

  if (
    !risposta.ok ||
    !payload.access_token
  ) {
    throw new Error(
      payload.error_description ||
        payload.error ||
        `Autenticazione PayPal non riuscita. HTTP ${risposta.status}`
    );
  }

  return payload.access_token;
}

async function verificaMerchant(
  merchantId: string
) {
  const {
    partnerId,
    attributionId,
  } = getConfig();

  const accessToken =
    await getAccessToken();

  const url =
    `${paypalBaseUrl()}` +
    `/v1/customer/partners/` +
    `${encodeURIComponent(partnerId)}` +
    `/merchant-integrations/` +
    `${encodeURIComponent(merchantId)}`;

  const risposta = await fetch(url, {
    method: "GET",
    headers: {
      Authorization:
        `Bearer ${accessToken}`,
      Accept: "application/json",
      "PayPal-Partner-Attribution-Id":
        attributionId,
    },
    cache: "no-store",
  });

  const testo = await risposta.text();

  let payload: MerchantStatus & {
    name?: string;
    message?: string;
    debug_id?: string;
  };

  try {
    payload = JSON.parse(testo);
  } catch {
    throw new Error(
      `PayPal ha restituito una risposta non valida. HTTP ${risposta.status}`
    );
  }

  if (!risposta.ok) {
    console.error(
      "Errore verifica merchant PayPal:",
      payload
    );

    throw new Error(
      payload.message ||
        payload.name ||
        `Verifica merchant PayPal non riuscita. HTTP ${risposta.status}`
    );
  }

  return payload;
}

async function salvaSuAruba(
  merchant: MerchantStatus,
  merchantId: string
) {
  const risposta = await fetch(
    API_ARUBA,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        paypal_merchant_id:
          merchant.merchant_id ||
          merchantId,

        paypal_account_status:
          merchant.merchant_status ||
          "",

        paypal_email_confirmed:
          merchant.primary_email_confirmed
            ? 1
            : 0,

        paypal_payments_receivable:
          merchant.payments_receivable
            ? 1
            : 0,

        paypal_tracking_id:
          merchant.tracking_id ||
          "",
      }),
      cache: "no-store",
    }
  );

  const testo =
    await risposta.text();

  let payload: {
    ok?: boolean;
    errore?: string;
    paypal_collegato?: number;
  };

  try {
    payload = JSON.parse(testo);
  } catch {
    throw new Error(
      "Aruba ha restituito una risposta non valida durante il salvataggio PayPal."
    );
  }

  if (
    !risposta.ok ||
    !payload.ok
  ) {
    throw new Error(
      payload.errore ||
        "Impossibile salvare il collegamento PayPal."
    );
  }

  return payload;
}

export async function POST(
  request: NextRequest
) {
  try {
    const body =
      await request.json();

    const merchantId =
      String(
        body?.merchantIdInPayPal || ""
      ).trim();

    if (!merchantId) {
      return NextResponse.json(
        {
          ok: false,
          errore:
            "Merchant ID PayPal mancante.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Non ci fidiamo semplicemente
     * dei parametri ricevuti dal browser.
     *
     * Verifichiamo direttamente
     * il merchant sui server PayPal.
     */
    const merchant =
      await verificaMerchant(
        merchantId
      );

    const merchantIdVerificato =
      merchant.merchant_id ||
      merchantId;

    if (
      merchant.merchant_id &&
      merchant.merchant_id !==
        merchantId
    ) {
      throw new Error(
        "Il Merchant ID restituito da PayPal non corrisponde."
      );
    }

    const salvataggio =
      await salvaSuAruba(
        merchant,
        merchantIdVerificato
      );

    const pronto =
      merchant.primary_email_confirmed ===
        true &&
      merchant.payments_receivable ===
        true;

    return NextResponse.json({
      ok: true,

      paypal_collegato:
        salvataggio.paypal_collegato ??
        (pronto ? 1 : 0),

      merchant_id:
        merchantIdVerificato,

      account_status:
        merchant.merchant_status ||
        "",

      email_confirmed:
        merchant.primary_email_confirmed ===
        true,

      payments_receivable:
        merchant.payments_receivable ===
        true,

      messaggio: pronto
        ? "Account PayPal collegato correttamente e pronto a ricevere pagamenti."
        : "Account PayPal collegato, ma PayPal richiede ancora il completamento di alcune verifiche.",
    });
  } catch (errore) {
    console.error(
      "Errore callback PayPal:",
      errore
    );

    return NextResponse.json(
      {
        ok: false,
        errore:
          errore instanceof Error
            ? errore.message
            : "Errore durante la verifica dell'account PayPal.",
      },
      {
        status: 500,
      }
    );
  }
}