import { cookies } from "next/headers";
import {
  ADMIN_COOKIE_NAME,
  verifyAdminSessionToken,
} from "@/lib/admin-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const API_UPLOAD =
  "https://www.agentiplusdb.net/ottica-api/upload_logo.php";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    const sessione = verifyAdminSessionToken(token);

    if (!sessione) {
      return Response.json(
        {
          ok: false,
          errore: "Sessione amministratore non valida.",
        },
        { status: 401 }
      );
    }

    const formRicevuto = await request.formData();
    const valoreLogo = formRicevuto.get("logo");

    if (
      !valoreLogo ||
      typeof valoreLogo === "string" ||
      typeof valoreLogo.arrayBuffer !== "function"
    ) {
      return Response.json(
        {
          ok: false,
          errore: "Nessun file logo valido ricevuto.",
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await valoreLogo.arrayBuffer());

    if (buffer.length === 0) {
      return Response.json(
        {
          ok: false,
          errore: "Il file logo ricevuto è vuoto.",
        },
        { status: 400 }
      );
    }

    const formDaInviare = new FormData();
    const blob = new Blob([buffer], {
      type: valoreLogo.type || "image/webp",
    });

    formDaInviare.append(
      "logo",
      blob,
      valoreLogo.name || "logo.webp"
    );

    const risposta = await fetch(API_UPLOAD, {
      method: "POST",
      cache: "no-store",
      body: formDaInviare,
    });

    const testo = await risposta.text();

    let payload: unknown;

    try {
      payload = JSON.parse(testo);
    } catch {
      return Response.json(
        {
          ok: false,
          errore: "Il server di upload non ha restituito JSON valido.",
          dettaglio: testo.slice(0, 300),
        },
        { status: 502 }
      );
    }

    return Response.json(payload, {
      status: risposta.status,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (errore) {
    return Response.json(
      {
        ok: false,
        errore: "Errore durante il caricamento del logo.",
        dettaglio:
          errore instanceof Error ? errore.message : String(errore),
      },
      { status: 500 }
    );
  }
}
