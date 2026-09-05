import { NextResponse } from "next/server";

const API_ARUBA =
  "https://www.agentiplusdb.net/ottica-api/promozioni.php";

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
            : "Impossibile caricare le promozioni.",
      },
      { status: 500 }
    );
  }
}
