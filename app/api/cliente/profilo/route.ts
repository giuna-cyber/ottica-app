import { NextRequest, NextResponse } from "next/server";

const API_ARUBA =
  "https://www.agentiplusdb.net/ottica-api/cliente_profilo.php";

export async function GET(request: NextRequest) {
  try {
    const clienteId =
      request.nextUrl.searchParams.get("cliente_id");

    if (!clienteId) {
      return NextResponse.json(
        {
          ok: false,
          errore: "cliente_id mancante.",
        },
        { status: 400 }
      );
    }

    const risposta = await fetch(
      `${API_ARUBA}?cliente_id=${encodeURIComponent(
        clienteId
      )}&t=${Date.now()}`,
      {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      }
    );

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
            : "Errore durante il caricamento del profilo.",
      },
      { status: 500 }
    );
  }
}

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
            : "Errore durante l'aggiornamento del profilo.",
      },
      { status: 500 }
    );
  }
}
