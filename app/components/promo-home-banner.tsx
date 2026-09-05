"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ArticoloPromo = {
  id: number;
  nome: string;
  prezzo: number;
  immagine_url: string | null;
  marca: string | null;
  in_promozione: boolean;
  sconto_percentuale: number | null;
  prezzo_promozionale: number | null;
};

function euro(valore: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(valore);
}

export default function PromoHomeBanner() {
  const [articolo, setArticolo] =
    useState<ArticoloPromo | null>(null);
  const [caricamento, setCaricamento] = useState(true);

  useEffect(() => {
    caricaPromo();
  }, []);

  async function caricaPromo() {
    try {
      const risposta = await fetch("/api/catalogo", {
        cache: "no-store",
      });

      const dati = await risposta.json();

      if (!risposta.ok || !dati.ok) {
        return;
      }

      const promo = (dati.articoli ?? []).find(
        (a: ArticoloPromo) =>
          a.in_promozione &&
          a.sconto_percentuale !== null &&
          a.prezzo_promozionale !== null
      );

      setArticolo(promo ?? null);
    } catch {
      setArticolo(null);
    } finally {
      setCaricamento(false);
    }
  }

  if (caricamento || !articolo) {
    return null;
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
      <Link
        href="/promozioni"
        className="group block overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#8F1D2C,#D9364B)] text-white shadow-xl"
      >
        <div className="grid items-center gap-4 p-5 sm:grid-cols-[150px_1fr_auto] sm:p-6">
          <div className="mx-auto aspect-square w-28 overflow-hidden rounded-2xl bg-white/95 p-2 sm:w-36">
            {articolo.immagine_url ? (
              <img
                src={articolo.immagine_url}
                alt={articolo.nome}
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-5xl">
                👓
              </div>
            )}
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/75">
              🔥 Promo del momento
            </p>

            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              {articolo.nome}
            </h2>

            {articolo.marca && (
              <p className="mt-1 text-sm font-bold text-white/80">
                {articolo.marca}
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-end gap-3">
              <span className="rounded-full bg-white px-3 py-1 text-sm font-black text-[#B51F34]">
                -{Number(articolo.sconto_percentuale)}%
              </span>

              <span className="text-sm font-bold text-white/70 line-through">
                {euro(Number(articolo.prezzo))}
              </span>

              <span className="text-2xl font-black">
                {euro(
                  Number(articolo.prezzo_promozionale)
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-end">
            <span className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-[#B51F34] transition-transform group-hover:translate-x-1">
              Scopri la promo →
            </span>
          </div>
        </div>
      </Link>
    </section>
  );
}
