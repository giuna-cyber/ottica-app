import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ADMIN_COOKIE_NAME,
  verifyAdminSessionToken,
} from "@/lib/admin-session";

const API_ARUBA =
  "https://www.agentiplusdb.net/ottica-api/admin_appuntamenti.php";

async function autorizzato() {
  const store = await cookies();
  return verifyAdminSessionToken(
    store.get(ADMIN_COOKIE_NAME)?.value
  );
}

export async function GET() {
  if (!(await autorizzato())) {
    return NextResponse.json(
      { ok: false, errore: "Non autorizzato." },
      { status: 401 }
    );
  }

  try {
    const risposta = await fetch(
      `${API_ARUBA}?t=${Date.now()}`,
      {
        cache: "no-store",
        headers: { Accept: "application/json" },
      }
    );

    const dati = await risposta.json();

    return NextResponse.json(dati, {
      status: risposta.ok ? 200 : risposta.status,
    });
  } catch {
    return NextResponse.json(
      { ok: false, errore: "Errore caricamento appuntamenti." },
      { status: 500 }
    );
  }
}
