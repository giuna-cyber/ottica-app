import { NextRequest, NextResponse } from "next/server";

const API_ARUBA =
  "https://www.agentiplusdb.net/ottica-api/cliente_ordini.php";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clienteId = searchParams.get("cliente_id");

    if (!clienteId) {
      return NextResponse.json(
        {
          ok: false,
          errore: "Cliente non valido.",
        },
        { status: 400 }
      );
    }

    const risposta = await fetch(
      `${API_ARUBA}?cliente_id=${encodeURIComponent(clienteId)}&t=${Date.now()}`,
      {
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      }
    );

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
            : "Impossibile caricare gli ordini cliente.",
      },
      { status: 500 }
    );
  }
}
