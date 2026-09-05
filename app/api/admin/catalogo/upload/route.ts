import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ADMIN_COOKIE_NAME,
  verifyAdminSessionToken,
} from "@/lib/admin-session";

const API_ARUBA =
  "https://www.agentiplusdb.net/ottica-api/upload_catalogo.php";

async function autorizzato() {
  const store = await cookies();

  return verifyAdminSessionToken(
    store.get(ADMIN_COOKIE_NAME)?.value
  );
}

export async function POST(request: NextRequest) {
  if (!(await autorizzato())) {
    return NextResponse.json(
      {
        ok: false,
        errore: "Non autorizzato.",
      },
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();

    const immagine = formData.get("immagine");

    if (!(immagine instanceof File)) {
      return NextResponse.json(
        {
          ok: false,
          errore: "Nessuna immagine ricevuta.",
        },
        { status: 400 }
      );
    }

    const inoltro = new FormData();
    inoltro.append("immagine", immagine);

    const risposta = await fetch(API_ARUBA, {
      method: "POST",
      cache: "no-store",
      body: inoltro,
    });

    const testo = await risposta.text();

    let dati;

    try {
      dati = JSON.parse(testo);
    } catch {
      return NextResponse.json(
        {
          ok: false,
          errore: "La risposta di Aruba non è JSON valido.",
          dettaglio: testo,
        },
        { status: 502 }
      );
    }

    return NextResponse.json(dati, {
      status: risposta.ok ? 200 : risposta.status,
    });
  } catch (errore) {
    return NextResponse.json(
      {
        ok: false,
        errore:
          errore instanceof Error
            ? errore.message
            : "Errore durante l'upload.",
      },
      { status: 500 }
    );
  }
}
