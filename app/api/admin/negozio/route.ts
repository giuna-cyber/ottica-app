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

export async function POST(request: Request) {
  try {
    const corpo = await request.json();

    const form = new URLSearchParams();

    for (const [chiave, valore] of Object.entries(corpo ?? {})) {
      form.set(chiave, String(valore ?? ""));
    }

    const risposta = await fetch(API, {
      method: "POST",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body: form.toString(),
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
