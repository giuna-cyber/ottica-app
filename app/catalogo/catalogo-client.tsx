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
      <header className="relative overflow-hidden bg-[linear-gradient(135deg,#083B4C_0%,#1D6E7A_58%,#A9D6DE_100%)] text-white">
        <svg
          viewBox="0 0 1600 360"
          preserveAspectRatio="none"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full"
        >
          <g fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.2">
            <path d="M-80 75 C 180 10, 260 170, 520 110 S 870 10, 1100 92 S 1380 160, 1680 40" />
            <path d="M-90 90 C 170 25, 275 185, 535 125 S 885 25, 1115 107 S 1395 175, 1695 55" />
            <path d="M-100 105 C 160 40, 290 200, 550 140 S 900 40, 1130 122 S 1410 190, 1710 70" />
            <path d="M-110 120 C 150 55, 305 215, 565 155 S 915 55, 1145 137 S 1425 205, 1725 85" />
            <path d="M-120 135 C 140 70, 320 230, 580 170 S 930 70, 1160 152 S 1440 220, 1740 100" />
          </g>

          <g fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1">
            <path d="M-180 315 C 90 190, 280 390, 565 278 S 955 188, 1220 285 S 1490 390, 1760 245" />
            <path d="M-170 330 C 100 205, 290 405, 575 293 S 965 203, 1230 300 S 1500 405, 1770 260" />
            <path d="M-160 345 C 110 220, 300 420, 585 308 S 975 218, 1240 315 S 1510 420, 1780 275" />
            <path d="M-150 360 C 120 235, 310 435, 595 323 S 985 233, 1250 330 S 1520 435, 1790 290" />
          </g>

          <g fill="none" stroke="rgba(255,255,255,0.18)">
            <circle cx="1450" cy="80" r="175" />
            <circle cx="80" cy="320" r="210" />
          </g>
        </svg>

        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 82% 18%, rgba(255,255,255,.10), transparent 24%), radial-gradient(circle at 15% 85%, rgba(0,43,51,.18), transparent 30%)",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#CBEDEF]">
            Collezione
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-[-0.04em] sm:text-5xl">
            Catalogo
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-white/85 sm:text-base">
            Scopri i modelli disponibili e le offerte attive.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div
          className="rounded-[28px] p-4 sm:p-5"
          style={{
            background:
              "linear-gradient(145deg, #FFFFFF 0%, #F2F8F8 100%)",
            border: "1px solid #B7CBCD",
            boxShadow: "0 14px 34px rgba(12,37,43,.08)",
          }}
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#4B777E]">
                Esplora la collezione
              </p>
              <p className="mt-1 text-sm font-bold text-[#60777C]">
                {filtrati.length} {filtrati.length === 1 ? "prodotto" : "prodotti"} trovati
              </p>
            </div>

            <div
              className="rounded-full px-3 py-1.5 text-[11px] font-black text-[#0C4A59]"
              style={{
                background: "#E6F2F3",
                border: "1px solid #C9DADC",
              }}
            >
              Catalogo aggiornato
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <input
              type="search"
              value={ricerca}
              onChange={(e) => setRicerca(e.target.value)}
              placeholder="Cerca prodotto..."
              className="rounded-2xl px-4 py-3 text-sm outline-none"
              style={{
                background: "#FFFFFF",
                border: "1px solid #AFC5C8",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,.7)",
              }}
            />

            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="rounded-2xl px-4 py-3 text-sm outline-none"
              style={{
                background: "#FFFFFF",
                border: "1px solid #AFC5C8",
              }}
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
              className="rounded-2xl px-4 py-3 text-sm outline-none"
              style={{
                background: "#FFFFFF",
                border: "1px solid #AFC5C8",
              }}
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
          <div className="mt-6 rounded-3xl border border-[#DCE8E9] bg-white p-8 text-center text-sm font-bold text-[#6D8287]">
            Nessun prodotto trovato.
          </div>
        ) : (
          <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtrati.map((articolo) => {
              const promo =
                articolo.in_promozione &&
                articolo.prezzo_promozionale !== null;

              return (
                <article
                  key={articolo.id}
                  className="group relative overflow-hidden"
                  style={{
                    borderRadius: 28,
                    border: "1.5px solid #566F75",
                    background: "#FFFFFF",
                    boxShadow:
                      "0 16px 38px rgba(12,37,43,.11), 0 2px 6px rgba(12,37,43,.05)",
                    display: "flex",
                    flexDirection: "column",
                    minHeight: 560,
                    transition:
                      "transform .25s ease, box-shadow .25s ease",
                  }}
                >
                  <div
                    className="pointer-events-none absolute inset-x-0 top-0 z-20"
                    style={{
                      height: 4,
                      background:
                        "linear-gradient(90deg,#083B4C 0%,#1D6E7A 55%,#7ECBD3 100%)",
                    }}
                  />

                  <Link
                    href={`/catalogo/${articolo.id}`}
                    className="relative block"
                  >
                    <div
                      className="relative overflow-hidden"
                      style={{
                        height: 330,
                        background:
                          "radial-gradient(circle at 78% 15%, rgba(169,214,222,.20), transparent 25%), linear-gradient(180deg,#FFFFFF 0%,#F7FAFA 100%)",
                        borderBottom: "1.5px solid #566F75",
                      }}
                    >
                      <div
                        className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full"
                        style={{
                          border: "1px solid rgba(29,110,122,.10)",
                        }}
                      />
                      <div
                        className="pointer-events-none absolute -left-20 bottom-[-70px] h-44 w-44 rounded-full"
                        style={{
                          border: "1px solid rgba(29,110,122,.08)",
                        }}
                      />

                      {articolo.in_promozione &&
                        articolo.sconto_percentuale !== null && (
                          <div
                            className="absolute left-4 top-4 z-20"
                            style={{
                              background: "#9A0F1C",
                              color: "#FFFFFF",
                              border: "1px solid #6E0710",
                              borderRadius: 14,
                              padding: "8px 12px",
                              boxShadow:
                                "0 7px 16px rgba(154,15,28,.22)",
                              fontSize: 11,
                              fontWeight: 950,
                              letterSpacing: ".04em",
                            }}
                          >
                            PROMO -{Number(articolo.sconto_percentuale)}%
                          </div>
                        )}

                      <div
                        className="absolute right-4 top-4 z-10 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em]"
                        style={{
                          background: "rgba(255,255,255,.88)",
                          color: "#46666D",
                          border: "1px solid #D7E5E6",
                          backdropFilter: "blur(4px)",
                        }}
                      >
                        {articolo.categoria || "Ottica App"}
                      </div>

                      {articolo.immagine_url ? (
                        <img
                          src={articolo.immagine_url}
                          alt={articolo.nome}
                          className="h-full w-full object-contain"
                          style={{
                            padding: "42px 28px 24px",
                            transition: "transform .28s ease",
                          }}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-6xl">
                          👓
                        </div>
                      )}
                    </div>
                  </Link>

                  <div
                    className="flex flex-1 flex-col p-5"
                    style={{
                      background:
                        "linear-gradient(180deg,#FFFFFF 0%,#F5FAFA 100%)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#3F737B]">
                          {articolo.marca || "OTTICA APP"}
                        </p>

                        <Link href={`/catalogo/${articolo.id}`}>
                          <h2 className="mt-1 text-[1.35rem] font-black leading-tight tracking-[-0.02em] text-[#102A2E]">
                            {articolo.nome}
                          </h2>
                        </Link>

                        {articolo.modello && (
                          <p className="mt-1 text-sm font-medium text-[#6D8287]">
                            {articolo.modello}
                          </p>
                        )}
                      </div>

                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#0C4A59]"
                        style={{
                          background: "#ECF5F6",
                          border: "1px solid #C9DADC",
                        }}
                      >
                        <IconaOcchiali />
                      </span>
                    </div>

                    <div className="mt-4">
                      {promo ? (
                        <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
                          <span
                            className="text-sm font-black line-through"
                            style={{
                              color: "#B4232F",
                              textDecorationColor: "#B4232F",
                              textDecorationThickness: "1.5px",
                            }}
                          >
                            {euro(Number(articolo.prezzo))}
                          </span>

                          <span className="text-3xl font-black leading-none text-[#C80F1F]">
                            {euro(Number(articolo.prezzo_promozionale))}
                          </span>
                        </div>
                      ) : (
                        <p className="text-3xl font-black leading-none text-[#083B4C]">
                          {euro(Number(articolo.prezzo))}
                        </p>
                      )}
                    </div>

                    <div
                      className="mt-5 grid grid-cols-2 gap-2 text-[11px]"
                      style={{ color: "#60777C" }}
                    >
                      {articolo.forma && (
                        <div
                          className="rounded-xl px-3 py-2"
                          style={{
                            background: "#EEF6F6",
                            border: "1px solid #D7E5E6",
                          }}
                        >
                          <span className="block text-[9px] font-black uppercase tracking-[0.12em] text-[#789095]">
                            Forma
                          </span>
                          <span className="mt-0.5 block font-bold">
                            {articolo.forma}
                          </span>
                        </div>
                      )}

                      {articolo.materiale && (
                        <div
                          className="rounded-xl px-3 py-2"
                          style={{
                            background: "#EEF6F6",
                            border: "1px solid #D7E5E6",
                          }}
                        >
                          <span className="block text-[9px] font-black uppercase tracking-[0.12em] text-[#789095]">
                            Materiale
                          </span>
                          <span className="mt-0.5 block font-bold">
                            {articolo.materiale}
                          </span>
                        </div>
                      )}
                    </div>

                    <Link
                      href={`/catalogo/${articolo.id}`}
                      className="mt-auto flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-black text-white"
                      style={{
                        marginTop: 22,
                        background:
                          "linear-gradient(135deg,#041E27 0%,#083B4C 56%,#1D6E7A 100%)",
                        boxShadow:
                          "0 9px 20px rgba(8,59,76,.22)",
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
