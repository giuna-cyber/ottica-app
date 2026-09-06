const API =
  "https://www.agentiplusdb.net/ottica-api/admin_negozio.php";

export async function GET() {
  try {
    const risposta = await fetch(API, {
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
      },
    });
  } catch {
    return Response.json(
      {
        ok: false,
        errore: "Errore di collegamento al server.",
      },
      { status: 500 }
    );
  }
}
