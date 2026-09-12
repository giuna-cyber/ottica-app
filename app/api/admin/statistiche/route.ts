import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ADMIN_COOKIE_NAME,
  verifyAdminSessionToken,
} from "@/lib/admin-session";

const API_ARUBA =
  "https://www.agentiplusdb.net/ottica-api/admin_statistiche.php";

async function autorizzato() {
  const store = await cookies();
  return verifyAdminSessionToken(store.get(ADMIN_COOKIE_NAME)?.value);
}

export async function GET(request: NextRequest) {
  if (!(await autorizzato())) {
    return NextResponse.json(
      { ok: false, errore: "Non autorizzato." },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const dal = searchParams.get("dal") || "";
  const al = searchParams.get("al") || "";

  try {
    const url = new URL(API_ARUBA);
    if (dal) url.searchParams.set("dal", dal);
    if (al) url.searchParams.set("al", al);
    url.searchParams.set("t", String(Date.now()));

    const risposta = await fetch(url.toString(), {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    const testo = await risposta.text();

    let dati: unknown;

    try {
      dati = JSON.parse(testo);
    } catch {
      return NextResponse.json(
        {
          ok: false,
          errore: "Il server statistiche non ha restituito JSON valido.",
          dettaglio: testo.slice(0, 250),
        },
        { status: 502 }
      );
    }

    return NextResponse.json(dati, {
      status: risposta.status,
    });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        errore: "Impossibile caricare le statistiche.",
        dettaglio: e instanceof Error ? e.message : String(e),
      },
      { status: 500 }
    );
  }
}
