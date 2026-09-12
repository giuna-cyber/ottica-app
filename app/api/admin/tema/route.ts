import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ADMIN_COOKIE_NAME,
  verifyAdminSessionToken,
} from "@/lib/admin-session";

const API_ARUBA =
  "https://www.agentiplusdb.net/ottica-api/admin_tema.php";

async function autorizzato() {
  const store = await cookies();

  return verifyAdminSessionToken(
    store.get(ADMIN_COOKIE_NAME)?.value
  );
}

export async function GET() {
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
    const risposta = await fetch(`${API_ARUBA}?t=${Date.now()}`, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    const testo = await risposta.text();

    let dati;

    try {
      dati = JSON.parse(testo);
    } catch {
      return NextResponse.json(
        {
          ok: false,
          errore: "La risposta del server non è JSON valido.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(dati, {
      status: risposta.status,
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        errore: "Impossibile caricare i colori.",
      },
      { status: 500 }
    );
  }
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
    const corpo = await request.json();

    const risposta = await fetch(API_ARUBA, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(corpo),
    });

    const testo = await risposta.text();

    let dati;

    try {
      dati = JSON.parse(testo);
    } catch {
      return NextResponse.json(
        {
          ok: false,
          errore: "La risposta del server non è JSON valido.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(dati, {
      status: risposta.status,
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        errore: "Impossibile salvare i colori.",
      },
      { status: 500 }
    );
  }
}
