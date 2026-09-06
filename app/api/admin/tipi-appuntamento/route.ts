const API =
  "https://www.agentiplusdb.net/ottica-api/admin_tipi_appuntamento.php";

export async function GET() {
  try {
    const r = await fetch(API, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    const testo = await r.text();

    return new Response(testo, {
      status: r.status,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  } catch {
    return Response.json(
      { ok: false, errore: "Errore di collegamento al server." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const corpo = await request.json();

    const r = await fetch(API, {
      method: "POST",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(corpo),
    });

    const testo = await r.text();

    return new Response(testo, {
      status: r.status,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  } catch {
    return Response.json(
      { ok: false, errore: "Errore di collegamento al server." },
      { status: 500 }
    );
  }
}
