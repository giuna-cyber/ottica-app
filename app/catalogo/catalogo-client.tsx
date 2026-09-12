"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Articolo } from "./types";
import BottomNav from "@/app/components/bottom-nav";

type Props = {
  articoli?: Articolo[];
  prodotti?: Articolo[];
};

function euro(valore: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(valore);
}

export default function CatalogoClient({
  articoli,
  prodotti,
}: Props) {
  const elenco = articoli ?? prodotti ?? [];

  const [ricerca, setRicerca] = useState("");
  const [categoria, setCategoria] = useState("Tutti");
  const [genere, setGenere] = useState("Tutti");

  const categorie = useMemo(() => {
    const valori = Array.from(
      new Set(
        elenco
          .map((a) => a.categoria)
          .filter((v): v is string => Boolean(v))
      )
    );

    return ["Tutti", ...valori];
  }, [elenco]);

  const generi = useMemo(() => {
    const valori = Array.from(
      new Set(
        elenco
          .map((a) => a.genere)
          .filter((v): v is string => Boolean(v))
      )
    );

    return ["Tutti", ...valori];
  }, [elenco]);

  const filtrati = useMemo(() => {
    const testo = ricerca.trim().toLowerCase();

    return elenco.filter((a) => {
      const matchRicerca =
        !testo ||
        [
          a.nome,
          a.marca,
          a.modello,
          a.codice_articolo,
          a.categoria,
          a.genere,
        ].some((v) =>
          (v ?? "").toLowerCase().includes(testo)
        );

      const matchCategoria =
        categoria === "Tutti" ||
        a.categoria === categoria;

      const matchGenere =
        genere === "Tutti" ||
        a.genere === genere;

      return matchRicerca && matchCategoria && matchGenere;
    });
  }, [elenco, ricerca, categoria, genere]);

  return (
    <main className="min-h-screen bg-[#F6F4EF] pb-28 text-[#20383B]">
      <header className="border-b border-[#D9E2DF] bg-[#FBFAF7]">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#89A39D]">
                Collezione
              </p>
              <h1 className="mt-2 font-serif text-4xl font-medium tracking-[-0.04em] text-[#20383B] sm:text-5xl">
                Catalogo
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[#7E8F8B] sm:text-base">
                Montature selezionate, colori e modelli disponibili nel centro ottico.
              </p>
            </div>

            <Link
              href="/"
              className="w-fit rounded-full border border-[#D2DEDA] bg-white px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6F918B]"
            >
              ← Home
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="rounded-[22px] border border-[#D9E2DF] bg-[#FBFAF7] p-4 shadow-[0_12px_30px_rgba(80,108,105,.06)] sm:p-5">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#89A39D]">
                Esplora la collezione
              </p>
              <p className="mt-1 text-sm font-medium text-[#738682]">
                {filtrati.length} {filtrati.length === 1 ? "prodotto" : "prodotti"} trovati
              </p>
            </div>

            <span className="rounded-full border border-[#D4DFDB] bg-[#EDF3F0] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#6F918B]">
              Catalogo aggiornato
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <input
              type="search"
              value={ricerca}
              onChange={(e) => setRicerca(e.target.value)}
              placeholder="Cerca prodotto..."
              className="w-full rounded-xl border border-[#D4DFDB] bg-white px-4 py-3 text-sm text-[#20383B] outline-none transition placeholder:text-[#9AA9A5] focus:border-[#8FB8B2]"
            />

            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full rounded-xl border border-[#D4DFDB] bg-white px-4 py-3 text-sm text-[#20383B] outline-none focus:border-[#8FB8B2]"
            >
              {categorie.map((c) => (
                <option key={c} value={c}>
                  {c === "Tutti" ? "Tutte le categorie" : c}
                </option>
              ))}
            </select>

            <select
              value={genere}
              onChange={(e) => setGenere(e.target.value)}
              className="w-full rounded-xl border border-[#D4DFDB] bg-white px-4 py-3 text-sm text-[#20383B] outline-none focus:border-[#8FB8B2]"
            >
              {generi.map((g) => (
                <option key={g} value={g}>
                  {g === "Tutti" ? "Tutti i generi" : g}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filtrati.length === 0 ? (
          <div className="mt-6 rounded-[20px] border border-[#D9E2DF] bg-[#FBFAF7] p-8 text-center text-sm font-medium text-[#7E8F8B]">
            Nessun prodotto trovato.
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-3 [grid-auto-rows:1fr] sm:gap-5 lg:grid-cols-3">
            {filtrati.map((articolo) => {
              const promo =
                articolo.in_promozione &&
                articolo.prezzo_promozionale !== null;

              return (
                <article
                  key={articolo.id}
                  className="group relative flex min-h-full w-full flex-col overflow-hidden rounded-[18px] border border-[#D4DFDB] bg-[#FBFAF7] shadow-[0_10px_24px_rgba(80,108,105,.06)] transition duration-300 hover:-translate-y-0.5 hover:border-[#BFCFCA] hover:shadow-[0_14px_30px_rgba(80,108,105,.10)] sm:rounded-[22px]"
                >

                  <Link
                    href={`/catalogo/${articolo.id}`}
                    className="relative block"
                  >
                    <div className="relative aspect-square overflow-hidden border-b border-[#DDE5E2] bg-[linear-gradient(180deg,#FFFFFF_0%,#F5F2EC_100%)]">
                      {articolo.in_promozione &&
                        articolo.sconto_percentuale !== null && (
                          <div
                            className="absolute left-2 top-2 z-20 rounded-full border border-[#E8C8C4] bg-[#F4DCD7] px-2 py-1 text-[8px] font-semibold tracking-[0.02em] text-[#8C554F] sm:left-3 sm:top-3 sm:px-2.5 sm:py-1.5 sm:text-[10px]"
                          >
                            PROMO -{Number(articolo.sconto_percentuale)}%
                          </div>
                        )}

                      <div
                        className="absolute right-2 top-2 z-10 max-w-[48%] truncate rounded-full border border-[#D9E2DF] bg-white/90 px-2 py-1 text-[7px] font-semibold uppercase tracking-[0.08em] text-[#728B85] backdrop-blur-sm sm:right-3 sm:top-3 sm:px-2.5 sm:text-[9px]"
                      >
                        {articolo.categoria || "Ottica App"}
                      </div>

                      {articolo.immagine_url ? (
                        <img
                          src={articolo.immagine_url}
                          alt={articolo.nome}
                          className="h-full w-full object-contain p-3 transition duration-300 group-hover:scale-[1.03] sm:p-5"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[#8FB8B2]">
                          <IconaOcchiali />
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="flex flex-1 flex-col bg-[#FBFAF7] p-3 sm:p-5">
                    <p className="truncate text-[8px] font-semibold uppercase tracking-[0.14em] text-[#7A918A] sm:text-[10px] sm:tracking-[0.18em]">
                      {articolo.marca || "OTTICA APP"}
                    </p>

                    <Link href={`/catalogo/${articolo.id}`}>
                      <h2 className="mt-1 line-clamp-2 h-[34px] font-serif text-[14px] font-medium leading-[1.2] tracking-[-0.015em] text-[#20383B] sm:h-[46px] sm:text-[1.2rem]">
                        {articolo.nome}
                      </h2>
                    </Link>

                    <p className="mt-1 h-[14px] truncate text-[10px] font-medium leading-[14px] text-[#879793] sm:h-[20px] sm:text-sm sm:leading-5">
                      {articolo.modello || " "}
                    </p>

                    <div className="mt-3 flex min-h-[42px] items-end sm:mt-4 sm:min-h-[48px]">
                      {promo ? (
                        <div className="flex flex-col gap-0.5 sm:flex-row sm:flex-wrap sm:items-end sm:gap-x-2">
                          <span
                            className="text-[9px] font-semibold line-through sm:text-xs"
                            style={{
                              color: "#A87972",
                              textDecorationColor: "#A87972",
                              textDecorationThickness: "1.5px",
                            }}
                          >
                            {euro(Number(articolo.prezzo))}
                          </span>

                          <span className="text-[18px] font-semibold leading-none text-[#A85D55] sm:text-2xl">
                            {euro(Number(articolo.prezzo_promozionale))}
                          </span>
                        </div>
                      ) : (
                        <p className="text-[18px] font-semibold leading-none text-[#506C69] sm:text-2xl">
                          {euro(Number(articolo.prezzo))}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 hidden grid-cols-2 gap-2 text-[10px] text-[#738682] sm:grid">
                      {articolo.forma && (
                        <div className="rounded-xl border border-[#DDE5E2] bg-[#F2F5F2] px-3 py-2">
                          <span className="block text-[8px] font-semibold uppercase tracking-[0.12em] text-[#8B9C98]">
                            Forma
                          </span>
                          <span className="mt-0.5 block truncate font-medium">
                            {articolo.forma}
                          </span>
                        </div>
                      )}

                      {articolo.materiale && (
                        <div className="rounded-xl border border-[#DDE5E2] bg-[#F2F5F2] px-3 py-2">
                          <span className="block text-[8px] font-semibold uppercase tracking-[0.12em] text-[#8B9C98]">
                            Materiale
                          </span>
                          <span className="mt-0.5 block truncate font-medium">
                            {articolo.materiale}
                          </span>
                        </div>
                      )}
                    </div>

                    <Link
                      href={`/catalogo/${articolo.id}`}
                      className="mt-auto flex h-[42px] w-full shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#7FA39A] px-2.5 text-[10px] font-semibold text-white shadow-[0_7px_16px_rgba(80,108,105,.10)] transition hover:bg-[#6F918B] sm:h-[48px] sm:rounded-xl sm:px-4 sm:text-sm"
                      style={{
                        textDecoration: "none",
                      }}
                    >
                      Vedi prodotto
                      <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <BottomNav active="catalogo" />
    </main>
  );
}
