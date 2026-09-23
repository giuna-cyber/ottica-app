export const dynamic = "force-dynamic";

const API_ARUBA =
  "https://www.agentiplusdb.net/ottica-api/slider_upload.php";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const file = formData.get("file");
    const slide = String(formData.get("slide") ?? "");

    if (!(file instanceof File)) {
      return Response.json(
        {
          ok: false,
          errore: "File immagine mancante.",
        },
        { status: 400 }
      );
    }

    if (!["1", "2", "3"].includes(slide)) {
      return Response.json(
        {
          ok: false,
          errore: "Numero slide non valido.",
        },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return Response.json(
        {
          ok: false,
          errore: "Il file selezionato non è un'immagine.",
        },
        { status: 400 }
      );
    }

    if (file.size > 8 * 1024 * 1024) {
      return Response.json(
        {
          ok: false,
          errore: "L'immagine non può superare 8 MB.",
        },
        { status: 400 }
      );
    }

    const arubaForm = new FormData();
    arubaForm.append("file", file, file.name || `slide-${slide}`);
    arubaForm.append("slide", slide);

    const risposta = await fetch(API_ARUBA, {
      method: "POST",
      cache: "no-store",
      body: arubaForm,
    });

    const testo = await risposta.text();

    let dati: unknown;

    try {
      dati = JSON.parse(testo);
    } catch {
      return Response.json(
        {
          ok: false,
          errore: "La risposta del server immagini non è valida.",
          dettaglio: testo,
        },
        { status: 502 }
      );
    }

    return Response.json(dati, {
      status: risposta.status,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    });
  } catch (errore) {
    return Response.json(
      {
        ok: false,
        errore:
          errore instanceof Error
            ? errore.message
            : "Errore durante il caricamento dell'immagine.",
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
