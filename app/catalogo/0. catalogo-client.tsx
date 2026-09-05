"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Articolo } from "./types";

function IconaHome() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 10.5V20h13v-9.5" />
    </svg>
  );
}

function IconaOcchiali() {
  return (
    <svg viewBox="0 0 64 64" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="3">
      <circle cx="18" cy="36" r="10" />
      <circle cx="46" cy="36" r="10" />
      <path d="M28 35c2-2 6-2 8 0" />
      <path d="M8 34 12 21" />
      <path d="M56 34 52 21" />
    </svg>
  );
}

function IconaCalendario() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </svg>
  );
}

function IconaPromo() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m20 12-8 8-8-8 8-8 8 8Z" />
      <path d="M9 9h.01M15 15h.01M15 9l-6 6" />
    </svg>
  );
}

function IconaProfilo() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4.5 4.2-6.5 8-6.5s6.5 2 8 6.5" />
    </svg>
  );
}

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
    <main className="min-h-screen bg-[#F5F9F9] pb-28 text-[#102A2E]">
      <header className="bg-[linear-gradient(135deg,#083B4C,#1D6E7A)] text-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#CBEDEF]">
            Collezione
          </p>
          <h1 className="mt-2 text-3xl font-black">
            Catalogo
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/80">
            Scopri i modelli disponibili e le offerte attive.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="grid gap-3 rounded-3xl border border-[#DCE8E9] bg-white p-4 shadow-sm sm:grid-cols-3">
          <input
            type="search"
            value={ricerca}
            onChange={(e) => setRicerca(e.target.value)}
            placeholder="Cerca prodotto..."
            className="rounded-xl border border-[#C9DADC] px-4 py-3 text-sm outline-none focus:border-[#1D6E7A]"
          />

          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="rounded-xl border border-[#C9DADC] bg-white px-4 py-3 text-sm outline-none focus:border-[#1D6E7A]"
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
            className="rounded-xl border border-[#C9DADC] bg-white px-4 py-3 text-sm outline-none focus:border-[#1D6E7A]"
          >
            {generi.map((g) => (
              <option key={g} value={g}>
                {g === "Tutti" ? "Tutti i generi" : g}
              </option>
            ))}
          </select>
        </div>

        {filtrati.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-[#DCE8E9] bg-white p-8 text-center text-sm font-bold text-[#6D8287]">
            Nessun prodotto trovato.
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtrati.map((articolo) => (
              <article
                key={articolo.id}
                className="relative overflow-hidden rounded-3xl border border-[#DCE8E9] bg-white shadow-sm"
              >
                {articolo.in_promozione &&
                  articolo.sconto_percentuale !== null && (
                    <div className="absolute left-3 top-3 z-10 rounded-full bg-red-600 px-3 py-1.5 text-[11px] font-black text-white shadow-lg">
                      PROMO -{Number(articolo.sconto_percentuale)}%
                    </div>
                  )}

                <Link href={`/catalogo/${articolo.id}`}>
                  <div className="aspect-square bg-[#F7FAFA]">
                    {articolo.immagine_url ? (
                      <img
                        src={articolo.immagine_url}
                        alt={articolo.nome}
                        className="h-full w-full object-contain p-5"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-6xl">
                        👓
                      </div>
                    )}
                  </div>
                </Link>

                <div className="p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#5D858C]">
                    {articolo.marca || articolo.categoria}
                  </p>

                  <Link href={`/catalogo/${articolo.id}`}>
                    <h2 className="mt-1 text-xl font-black">
                      {articolo.nome}
                    </h2>
                  </Link>

                  {articolo.modello && (
                    <p className="mt-1 text-sm text-[#6D8287]">
                      {articolo.modello}
                    </p>
                  )}

                  {articolo.in_promozione &&
                  articolo.prezzo_promozionale !== null ? (
                    <div className="mt-4 flex items-end gap-2">
                      <span className="text-sm font-bold text-[#8A9A9E] line-through">
                        {euro(Number(articolo.prezzo))}
                      </span>

                      <span className="text-2xl font-black text-red-600">
                        {euro(Number(articolo.prezzo_promozionale))}
                      </span>
                    </div>
                  ) : (
                    <p className="mt-4 text-2xl font-black text-[#083B4C]">
                      {euro(Number(articolo.prezzo))}
                    </p>
                  )}

                  <Link
                    href={`/catalogo/${articolo.id}`}
                    className="mt-5 flex w-full items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#083B4C,#1D6E7A)] px-4 py-3 text-sm font-black text-white"
                  >
                    Vedi prodotto
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#DCE6E6] bg-white/95 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 shadow-[0_-8px_30px_rgba(16,42,46,0.08)] backdrop-blur-xl">
        <div className="mx-auto grid max-w-md grid-cols-5">
          <Link href="/" className="flex flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[#789095]">
            <IconaHome />
            <span className="text-[10px] font-bold">Home</span>
          </Link>

          <Link href="/catalogo" className="flex flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[#0C252B]">
            <IconaOcchiali />
            <span className="text-[10px] font-black">Catalogo</span>
          </Link>

          <Link href="/appuntamenti" className="flex flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[#789095]">
            <IconaCalendario />
            <span className="text-[10px] font-bold">Prenota</span>
          </Link>

          <Link href="/promozioni" className="flex flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[#789095]">
            <IconaPromo />
            <span className="text-[10px] font-bold">Promo</span>
          </Link>

          <Link href="/profilo" className="flex flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[#789095]">
            <IconaProfilo />
            <span className="text-[10px] font-bold">Profilo</span>
          </Link>
        </div>
      </nav>
    </main>
  );
}
