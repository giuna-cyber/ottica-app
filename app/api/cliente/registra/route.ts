import { NextRequest, NextResponse } from "next/server";

const API_ARUBA =
  "https://www.agentiplusdb.net/ottica-api/cliente_registra.php";

export async function POST(request: NextRequest) {
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
  } catch (errore) {
    return NextResponse.json(
      {
        ok: false,
        errore:
          errore instanceof Error
            ? errore.message
            : "Errore durante la registrazione.",
      },
      { status: 500 }
    );
  }
}
