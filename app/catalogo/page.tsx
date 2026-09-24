import CatalogoClient from "./catalogo-client";
import type { Articolo } from "./types";

const API_CATALOGO =
  "https://www.agentiplusdb.net/ottica-api/catalogo.php";

async function caricaCatalogo(): Promise<Articolo[]> {
  try {
    const risposta = await fetch(API_CATALOGO, {
      cache: "no-store",
    });

    if (!risposta.ok) {
      throw new Error(
        `Errore caricamento catalogo: ${risposta.status}`
      );
    }

    const dati = await risposta.json();

    if (Array.isArray(dati)) {
      return dati;
    }

    if (dati?.ok && Array.isArray(dati.articoli)) {
      return dati.articoli;
    }

    if (Array.isArray(dati?.articoli)) {
      return dati.articoli;
    }

    return [];
  } catch (errore) {
    console.error("Errore catalogo:", errore);
    return [];
  }
}

export const dynamic = "force-dynamic";

export default async function CatalogoPage() {
  const articoli = await caricaCatalogo();

  return <CatalogoClient articoli={articoli} />;
}
