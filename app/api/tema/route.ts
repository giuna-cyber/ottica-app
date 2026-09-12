const API_ARUBA =
  "https://www.agentiplusdb.net/ottica-api/admin_tema.php";

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
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch {
    return Response.json(
      {
        ok: false,
        errore: "Impossibile caricare il tema dell'app.",
      },
      { status: 500 }
    );
  }
}
