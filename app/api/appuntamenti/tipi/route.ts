import { NextResponse } from "next/server";

const API_ARUBA =
  "https://agentiplusdb.net/ottica-api/tipi_appuntamento.php";

export async function GET() {
  try {
    const risposta = await fetch(
      `${API_ARUBA}?t=${Date.now()}`,
      {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      }
    );

    const testo = await risposta.text();

    if (!risposta.ok) {
      return NextResponse.json(
        {
          ok: false,
          errore: `Errore API Aruba: HTTP ${risposta.status}`,
        },
        { status: 502 }
      );
    }

    let dati;

    try {
      dati = JSON.parse(testo);
    } catch {
      return NextResponse.json(
        {
          ok: false,
          errore: "La risposta di Aruba non è JSON valido.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(dati, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (errore) {
    return NextResponse.json(
      {
        ok: false,
        errore:
          errore instanceof Error
            ? errore.message
            : "Impossibile contattare il server Aruba.",
      },
      { status: 500 }
    );
  }
}
