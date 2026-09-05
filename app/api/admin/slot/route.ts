import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ADMIN_COOKIE_NAME,
  verifyAdminSessionToken,
} from "@/lib/admin-session";

const API_ARUBA =
  "https://www.agentiplusdb.net/ottica-api/admin_slot.php";

async function autorizzato() {
  const store = await cookies();
  return verifyAdminSessionToken(
    store.get(ADMIN_COOKIE_NAME)?.value
  );
}

export async function GET(request: NextRequest) {
  if (!(await autorizzato())) {
    return NextResponse.json(
      { ok: false, errore: "Non autorizzato." },
      { status: 401 }
    );
  }

  const url = new URL(API_ARUBA);

  const tipoId = request.nextUrl.searchParams.get("tipo_id");
  const data = request.nextUrl.searchParams.get("data");

  if (tipoId) url.searchParams.set("tipo_id", tipoId);
  if (data) url.searchParams.set("data", data);

  url.searchParams.set("t", Date.now().toString());

  try {
    const risposta = await fetch(url.toString(), {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    const dati = await risposta.json();

    return NextResponse.json(dati, {
      status: risposta.ok ? 200 : risposta.status,
    });
  } catch {
    return NextResponse.json(
      { ok: false, errore: "Errore caricamento slot." },
      { status: 500 }
    );
  }
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
      { ok: false, errore: "Errore aggiornamento slot." },
      { status: 500 }
    );
  }
}
