import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ADMIN_COOKIE_NAME,
  verifyAdminSessionToken,
} from "@/lib/admin-session";

const API_ARUBA =
  "https://www.agentiplusdb.net/ottica-api/admin_stato_appuntamento.php";

async function autorizzato() {
  const store = await cookies();
  return verifyAdminSessionToken(
    store.get(ADMIN_COOKIE_NAME)?.value
  );
}

export async function POST(request: NextRequest) {
  if (!(await autorizzato())) {
    return NextResponse.json(
      { ok: false, errore: "Non autorizzato." },
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

    const dati = await risposta.json();

    return NextResponse.json(dati, {
      status: risposta.ok ? 200 : risposta.status,
    });
  } catch {
    return NextResponse.json(
      { ok: false, errore: "Errore aggiornamento appuntamento." },
      { status: 500 }
    );
  }
}
