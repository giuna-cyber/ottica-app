const API_ARUBA =
  "https://www.agentiplusdb.net/ottica-api/cliente_recupera_password.php";

export async function POST(request: Request) {
  try {
    const corpo = await request.json();

    const risposta = await fetch(API_ARUBA, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(corpo),
      cache: "no-store",
    });

    const testo = await risposta.text();

    let dati: unknown;

    try {
      dati = JSON.parse(testo);
    } catch {
      return Response.json(
        {
          ok: false,
          errore: "Risposta non valida dal server.",
        },
        { status: 502 }
      );
    }

    return Response.json(dati, {
      status: risposta.status,
    });
  } catch {
    return Response.json(
      {
        ok: false,
        errore: "Errore di comunicazione con il server.",
      },
      { status: 500 }
    );
  }
}
