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
        className="group block overflow-hidden rounded-[22px] border border-[#D9E2DF] bg-[linear-gradient(135deg,#F8ECE9_0%,#FBFAF7_48%,#EDF3F0_100%)] text-[#20383B] shadow-[0_12px_30px_rgba(80,108,105,.06)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(80,108,105,.10)]"
      >
        <div className="grid items-center gap-4 p-5 sm:grid-cols-[150px_1fr_auto] sm:p-6">
          <div className="mx-auto aspect-square w-28 overflow-hidden rounded-2xl border border-[#E1E7E4] bg-white p-2 shadow-sm sm:w-36">
            {articolo.immagine_url ? (
              <img
                src={articolo.immagine_url}
                alt={articolo.nome}
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-[#8FB8B2]">
                <svg
                  viewBox="0 0 32 24"
                  className="h-12 w-14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <ellipse cx="9" cy="13" rx="6" ry="5.5" />
                  <ellipse cx="23" cy="13" rx="6" ry="5.5" />
                  <path d="M15 12c1-1.6 2-1.6 3 0M3 11 1.5 5M29 11 30.5 5" />
                </svg>
              </div>
            )}
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#A87972]">
              Promo del momento
            </p>

            <h2 className="mt-2 font-serif text-2xl font-medium tracking-[-0.025em] text-[#20383B] sm:text-3xl">
              {articolo.nome}
            </h2>

            {articolo.marca && (
              <p className="mt-1 text-sm font-medium text-[#738682]">
                {articolo.marca}
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-end gap-3">
              <span className="rounded-full border border-[#E7C9C5] bg-[#F6E7E4] px-3 py-1 text-sm font-semibold text-[#9A615A]">
                -{Number(articolo.sconto_percentuale)}%
              </span>

              <span className="text-sm font-medium text-[#A87972] line-through">
                {euro(Number(articolo.prezzo))}
              </span>

              <span className="font-serif text-2xl font-medium text-[#506C69]">
                {euro(
                  Number(articolo.prezzo_promozionale)
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-end">
            <span className="rounded-xl bg-[#7FA39A] px-5 py-3 text-sm font-semibold text-white shadow-[0_7px_16px_rgba(80,108,105,.10)] transition group-hover:translate-x-1 group-hover:bg-[#6F918B]">
              Scopri la promo →
            </span>
          </div>
        </div>
      </Link>
    </section>
  );
}
