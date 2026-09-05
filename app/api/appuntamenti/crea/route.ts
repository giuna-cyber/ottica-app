import { NextRequest, NextResponse } from "next/server";

const API_ARUBA =
  "https://www.agentiplusdb.net/ottica-api/crea_appuntamento.php";

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
            : "Impossibile creare l'appuntamento.",
      },
      { status: 500 }
    );
  }
}
