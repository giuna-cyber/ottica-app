import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PayPalLink = {
  href?: string;
  rel?: string;
  method?: string;
};

type PayPalReferralResponse = {
  links?: PayPalLink[];
  name?: string;
  message?: string;
  debug_id?: string;
  details?: unknown;
};

function paypalBaseUrl() {
  return process.env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

function getConfig() {
  const clientId = process.env.PAYPAL_CLIENT_ID?.trim();
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET?.trim();
  const partnerId = process.env.PAYPAL_PARTNER_ID?.trim();
  const attributionId =
    process.env.PAYPAL_PARTNER_ATTRIBUTION_ID?.trim();

  if (!clientId) {
    throw new Error("PAYPAL_CLIENT_ID non configurato.");
  }

  if (!clientSecret) {
    throw new Error("PAYPAL_CLIENT_SECRET non configurato.");
  }

  if (!partnerId) {
    throw new Error("PAYPAL_PARTNER_ID non configurato.");
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
  const { clientId, clientSecret } = getConfig();

  const credenziali = Buffer.from(
    `${clientId}:${clientSecret}`
  ).toString("base64");

  const risposta = await fetch(
    `${paypalBaseUrl()}/v1/oauth2/token`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${credenziali}`,
        "Content-Type": "application/x-www-form-urlencoded",
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
  } = {};

  try {
    payload = JSON.parse(testo);
  } catch {
    throw new Error(
      `PayPal ha restituito una risposta non valida durante l'autenticazione. HTTP ${risposta.status}`
    );
  }

  if (!risposta.ok || !payload.access_token) {
    throw new Error(
      payload.error_description ||
        payload.error ||
        `Autenticazione PayPal non riuscita. HTTP ${risposta.status}`
    );
  }

  return payload.access_token;
}

function creaAuthAssertion(clientId: string, partnerId: string) {
  const header = {
    alg: "none",
  };

  const payload = {
    iss: clientId,
    payer_id: partnerId,
  };

  const encode = (valore: object) =>
    Buffer.from(JSON.stringify(valore))
      .toString("base64url");

  return `${encode(header)}.${encode(payload)}.`;
}

function getOrigin(request: NextRequest) {
  const forwardedProto =
    request.headers.get("x-forwarded-proto");

  const forwardedHost =
    request.headers.get("x-forwarded-host");

  if (forwardedProto && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  return request.nextUrl.origin;
}

export async function POST(request: NextRequest) {
  try {
    const {
      clientId,
      partnerId,
      attributionId,
    } = getConfig();

    const accessToken = await getAccessToken();

    /*
     * tracking_id identifica questa specifica procedura
     * di collegamento dell'ottico.
     *
     * Più avanti lo sostituiremo/assoceremo all'ID
     * effettivo del negozio nel database.
     */
    const trackingId = `ottica-${crypto.randomUUID()}`;

    const origin = getOrigin(request);

    const returnUrl =
      `${origin}/admin/negozio/paypal-callback`;

    const authAssertion = creaAuthAssertion(
      clientId,
      partnerId
    );

    const corpo = {
      tracking_id: trackingId,

      operations: [
        {
          operation: "API_INTEGRATION",
          api_integration_preference: {
            rest_api_integration: {
              integration_method: "PAYPAL",
              integration_type: "THIRD_PARTY",
              third_party_details: {
                features: [
                  "PAYMENT",
                  "REFUND",
                ],
              },
            },
          },
        },
      ],

      products: [
        "EXPRESS_CHECKOUT",
      ],

      legal_consents: [
        {
          type: "SHARE_DATA_CONSENT",
          granted: true,
        },
      ],

      partner_config_override: {
        return_url: returnUrl,
        return_url_description:
          "Torna alla configurazione PayPal di Ottica App",
      },
    };

    const risposta = await fetch(
      `${paypalBaseUrl()}/v2/customer/partner-referrals`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
          "PayPal-Partner-Attribution-Id":
            attributionId,
          "PayPal-Auth-Assertion":
            authAssertion,
        },
        body: JSON.stringify(corpo),
        cache: "no-store",
      }
    );

    const testo = await risposta.text();

    let payload: PayPalReferralResponse;

    try {
      payload = JSON.parse(testo);
    } catch {
      return NextResponse.json(
        {
          ok: false,
          errore:
            "PayPal ha restituito una risposta non JSON.",
          status: risposta.status,
        },
        {
          status: 502,
        }
      );
    }

    if (!risposta.ok) {
      console.error(
        "Errore PayPal Partner Referrals:",
        payload
      );

      return NextResponse.json(
        {
          ok: false,
          errore:
            payload.message ||
            payload.name ||
            "Impossibile avviare il collegamento PayPal.",
          debug_id: payload.debug_id || null,
          details: payload.details || null,
          status: risposta.status,
        },
        {
          status: 502,
        }
      );
    }

    const actionUrl = payload.links?.find(
      (link) => link.rel === "action_url"
    )?.href;

    const selfUrl = payload.links?.find(
      (link) => link.rel === "self"
    )?.href;

    if (!actionUrl) {
      return NextResponse.json(
        {
          ok: false,
          errore:
            "PayPal non ha restituito il link di onboarding.",
        },
        {
          status: 502,
        }
      );
    }

    return NextResponse.json({
      ok: true,
      tracking_id: trackingId,
      onboarding_url: actionUrl,
      referral_url: selfUrl || null,
    });
  } catch (errore) {
    console.error(
      "Errore onboarding PayPal:",
      errore
    );

    return NextResponse.json(
      {
        ok: false,
        errore:
          errore instanceof Error
            ? errore.message
            : "Errore durante l'avvio del collegamento PayPal.",
      },
      {
        status: 500,
      }
    );
  }
}