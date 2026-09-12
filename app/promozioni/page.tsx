const IconaOcchiali = IconaCatalogoOttica;
const IconaPromo = IconaPromoOttica;
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import BottomNav from "@/app/components/bottom-nav";
import { IconaCatalogoOttica, IconaPromoOttica } from "@/app/icone-ottica";

type Promozione = {
  id: number;
  titolo: string;
  descrizione: string | null;
  immagine_url: string | null;
  sconto_percentuale: number | null;
  articolo_id: number | null;
  data_inizio: string | null;
  data_fine: string | null;
  attiva: number;
  articolo_nome: string | null;
  articolo_immagine: string | null;
  articolo_prezzo: number | null;
};

function euro(valore: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(valore);
}

function IconaCuore() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.8 4.6a5.4 5.4 0 0 0-7.6 0L12 5.8l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 21l8.8-8.8a5.4 5.4 0 0 0 0-7.6Z" />
    </svg>
  );
}

function OcchialiDecorativi({
  style,
  opacity = 0.24,
}: {
  style?: React.CSSProperties;
  opacity?: number;
}) {
  return (
    <svg
      viewBox="0 0 150 76"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.15"
      aria-hidden="true"
      style={{
        position: "absolute",
        width: 165,
        height: 84,
        color: "#FFFFFF",
        opacity,
        ...style,
      }}
    >
      <path d="M8 33c4-12 16-20 29-20 16 0 29 12 29 27 0 14-11 25-26 25-16 0-29-10-32-25-1-3-1-5 0-7Z" />
      <path d="M142 33c-4-12-16-20-29-20-16 0-29 12-29 27 0 14 11 25 26 25 16 0 29-10 32-25 1-3 1-5 0-7Z" />
      <path d="M66 34c4-5 14-5 18 0" />
      <path d="M8 33 1 25M142 33l7-8" />
      <path d="M17 24c8-7 18-11 29-8M133 24c-8-7-18-11-29-8" />
    </svg>
  );
}

export default function PromozioniPage() {
  const [promozioni, setPromozioni] = useState<Promozione[]>([]);
  const [errore, setErrore] = useState("");
  const [caricamento, setCaricamento] = useState(true);

  useEffect(() => {
    async function carica() {
      try {
        const risposta = await fetch("/api/promozioni", {
          cache: "no-store",
        });

        const dati = await risposta.json();

        if (!risposta.ok || !dati.ok) {
          throw new Error(
            dati.errore || "Impossibile caricare le promozioni."
          );
        }

        setPromozioni(dati.promozioni ?? []);
      } catch (e) {
        setErrore(
          e instanceof Error
            ? e.message
            : "Impossibile caricare le promozioni."
        );
      } finally {
        setCaricamento(false);
      }
    }

    carica();
  }, []);

  return (
    <main className="min-h-screen bg-[#F6F4EF] pb-24 text-[#20383B]">
      <header className="sticky top-0 z-50 border-b border-[#D9E2DF] bg-[#FBFAF7]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#D4DFDB] bg-white text-[#6F918B] shadow-sm">
              <IconaOcchiali />
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#9AABA6]">
                Centro ottico
              </p>
              <h1 className="text-lg font-semibold tracking-tight text-[#20383B]">
                OTTICA APP
              </h1>
            </div>
          </Link>

          <Link
            href="/login"
            className="rounded-full border border-[#D4DFDB] bg-white px-3 py-2 text-xs font-semibold text-[#738682]"
          >
            Admin
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-[#D9E2DF] bg-[linear-gradient(135deg,#EEF3F0_0%,#FBFAF7_52%,#F5F2EC_100%)]">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full border border-[#D9E2DF] bg-white/30" />
        <div className="pointer-events-none absolute -left-24 bottom-[-120px] h-64 w-64 rounded-full bg-[#DDE8E3]/45 blur-2xl" />

        <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-10 sm:px-6 sm:pb-14 sm:pt-14">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full border border-[#D4DFDB] bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#7FA39A]">
              Promozioni
            </span>

            <h2 className="mt-4 max-w-3xl font-serif text-4xl font-medium leading-[0.98] tracking-[-0.045em] text-[#20383B] sm:text-6xl">
              Offerte pensate
              <span className="block text-[#7FA39A]">
                per il tuo stile.
              </span>
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-[#748783] sm:text-lg sm:leading-8">
              Occhiali di qualità, design e convenienza. Scopri le offerte attive
              del nostro centro ottico.
            </p>

            <a
              href="#offerte"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#8FB8B2] bg-white px-5 py-3 text-sm font-semibold text-[#6F918B] transition hover:bg-[#EDF3F0]"
            >
              Scopri le promozioni <span>→</span>
            </a>
          </div>
        </div>
      </section>

      <section id="offerte" className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#89A39D]">
            Le nostre promozioni
          </p>
          <h2 className="mt-1 font-serif text-3xl font-medium tracking-[-0.03em] text-[#20383B]">
            Offerte in evidenza
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7E8F8B]">
            Brand selezionati e prezzi speciali per il tuo prossimo occhiale.
          </p>
        </div>

        {errore && (
          <div className="mb-5 rounded-2xl border border-[#E9D1CD] bg-[#F8ECE9] px-4 py-4 text-sm font-semibold text-[#9A615A]">
            {errore}
          </div>
        )}

        {caricamento ? (
          <div className="rounded-[22px] border border-[#D9E2DF] bg-[#FBFAF7] p-8 text-center text-sm font-medium text-[#7E8F8B]">
            Caricamento promozioni...
          </div>
        ) : promozioni.length === 0 ? (
          <div className="rounded-[22px] border border-[#D9E2DF] bg-[#FBFAF7] p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F6ECE8] text-[#A87972]">
              <IconaPromo />
            </div>
            <h3 className="mt-3 font-serif text-xl font-medium">
              Nessuna promozione attiva
            </h3>
            <p className="mt-2 text-sm text-[#7E8F8B]">
              Torna presto per scoprire le prossime offerte.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {promozioni.map((promo) => {
              const immagine =
                promo.immagine_url ||
                promo.articolo_immagine ||
                null;

              const prezzoScontato =
                promo.articolo_prezzo !== null &&
                promo.sconto_percentuale !== null
                  ? promo.articolo_prezzo *
                    (1 - promo.sconto_percentuale / 100)
                  : null;

              return (
                <article
                  key={promo.id}
                  className="flex h-full flex-col overflow-hidden rounded-[22px] border border-[#D9E2DF] bg-[#FBFAF7] shadow-[0_12px_30px_rgba(80,108,105,.06)]"
                >
                  <div className="relative h-52 border-b border-[#E1E7E4] bg-white">
                    {promo.sconto_percentuale !== null && (
                      <div className="absolute left-3 top-3 z-10 rounded-xl border border-[#E7C9C5] bg-[#F6E7E4] px-3 py-2 text-center text-[#9A615A] shadow-sm">
                        <div className="text-[9px] font-semibold uppercase tracking-[0.14em]">
                          Promo
                        </div>
                        <div className="mt-0.5 text-lg font-semibold leading-none">
                          -{promo.sconto_percentuale}%
                        </div>
                      </div>
                    )}

                    <div className="absolute right-3 top-4 z-10 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#8B9C98]">
                      Offerta speciale
                    </div>

                    {immagine ? (
                      <img
                        src={immagine}
                        alt={promo.titolo}
                        className="h-full w-full object-contain px-5 pb-4 pt-12"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[#8FB8B2]">
                        <IconaOcchiali />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-serif text-2xl font-medium leading-tight tracking-[-0.025em]">
                      {promo.titolo}
                    </h3>

                    {promo.articolo_nome && (
                      <p className="mt-1 text-sm font-semibold text-[#6F918B]">
                        {promo.articolo_nome}
                      </p>
                    )}

                    {promo.descrizione && (
                      <p className="mt-3 text-sm leading-6 text-[#7E8F8B]">
                        {promo.descrizione}
                      </p>
                    )}

                    {promo.articolo_prezzo !== null && (
                      <div className="mt-auto flex items-end justify-between gap-3 pt-5">
                        <div>
                          {prezzoScontato !== null && (
                            <p className="text-xs font-medium text-[#A85D55] line-through">
                              {euro(promo.articolo_prezzo)}
                            </p>
                          )}

                          <p className="mt-1 text-2xl font-semibold text-[#506C69]">
                            {euro(
                              prezzoScontato !== null
                                ? prezzoScontato
                                : promo.articolo_prezzo
                            )}
                          </p>
                        </div>

                        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D9E2DF] bg-white text-[#7FA39A]">
                          <IconaCuore />
                        </span>
                      </div>
                    )}

                    {promo.articolo_id && (
                      <Link
                        href={`/catalogo/${promo.articolo_id}`}
                        className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#7FA39A] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#6F918B]"
                      >
                        Approfitta ora <span>→</span>
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="mt-8 grid overflow-hidden rounded-[20px] border border-[#D9E2DF] bg-[#FBFAF7] shadow-[0_8px_22px_rgba(80,108,105,.04)] sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Spedizione gratuita", "Per ordini superiori a € 50"],
            ["Garanzia ufficiale", "Su tutti i prodotti"],
            ["Reso facile", "Entro 30 giorni"],
            ["Consulenza personalizzata", "Nel nostro centro ottico"],
          ].map(([titolo, testo], indice) => (
            <div
              key={titolo}
              className={`flex min-h-24 items-center gap-3 px-4 py-4 ${
                indice > 0 ? "border-t border-[#E1E7E4] sm:border-t-0 sm:border-l" : ""
              }`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EDF3F0] text-[#6F918B]">
                <span className="text-sm font-semibold">{indice + 1}</span>
              </div>

              <div>
                <p className="text-sm font-semibold text-[#20383B]">
                  {titolo}
                </p>
                <p className="mt-1 text-xs text-[#7E8F8B]">
                  {testo}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <BottomNav active="promo" />
    </main>
  );
}
