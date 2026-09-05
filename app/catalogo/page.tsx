import CatalogoClient from "./catalogo-client";
import type { Articolo } from "./types";

const API_ARUBA =
  "https://www.agentiplusdb.net/ottica-api/catalogo.php";

type RispostaCatalogo = {
  ok: boolean;
  articoli?: Articolo[];
  errore?: string;
};

async function caricaCatalogo(): Promise<{
  articoli: Articolo[];
}> {
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

    if (!risposta.ok) {
      return {
        articoli: [],
      };
    }

    const dati =
      (await risposta.json()) as RispostaCatalogo;

    if (!dati.ok) {
      return {
        articoli: [],
      };
    }

    return {
      articoli: dati.articoli ?? [],
    };
  } catch {
    return {
      articoli: [],
    };
  }
}

export default async function CatalogoPage() {
  const { articoli } = await caricaCatalogo();

  return <CatalogoClient articoli={articoli} />;
}
