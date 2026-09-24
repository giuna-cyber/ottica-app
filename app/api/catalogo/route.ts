const API_ARUBA =
  "https://www.agentiplusdb.net/ottica-api/catalogo.php";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const risposta = await fetch(`${API_ARUBA}?t=${Date.now()}`, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    const testo = await risposta.text();

    return new Response(testo, {
      status: risposta.status,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    });
  } catch (errore) {
    return Response.json(
      {
        ok: false,
        articoli: [],
        errore:
          errore instanceof Error
            ? errore.message
            : "Errore di collegamento al server del catalogo.",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  }
}
