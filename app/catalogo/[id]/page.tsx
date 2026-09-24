import { notFound } from "next/navigation";
import ProdottoClient, {
  type ProdottoDettaglio,
} from "./prodotto-client";

const API_CATALOGO =
  "https://www.agentiplusdb.net/ottica-api/catalogo.php";

type PageProps = {
  params: Promise<{ id: string }>;
};

type RispostaCatalogo = {
  ok?: boolean;
  articoli?: ProdottoDettaglio[];
};

async function caricaProdotto(
  id: number
): Promise<ProdottoDettaglio | null> {
  try {
    const risposta = await fetch(
      `${API_CATALOGO}?t=${Date.now()}`,
      {
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!risposta.ok) {
      return null;
    }

    const dati = (await risposta.json()) as
      | RispostaCatalogo
      | ProdottoDettaglio[];

    const articoli = Array.isArray(dati)
      ? dati
      : Array.isArray(dati.articoli)
      ? dati.articoli
      : [];

    return (
      articoli.find(
        (articolo) => Number(articolo.id) === id
      ) ?? null
    );
  } catch (errore) {
    console.error(
      "Errore caricamento dettaglio prodotto:",
      errore
    );

    return null;
  }
}

export const dynamic = "force-dynamic";

export default async function DettaglioProdottoPage({
  params,
}: PageProps) {
  const { id } = await params;
  const prodottoId = Number(id);

  if (!Number.isFinite(prodottoId)) {
    notFound();
  }

  const prodotto = await caricaProdotto(prodottoId);

  if (!prodotto) {
    notFound();
  }

  return <ProdottoClient prodotto={prodotto} />;
}
