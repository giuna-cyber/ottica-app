"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Articolo } from "./types";
import BottomNav from "@/app/components/bottom-nav";
import { IconaCatalogoOttica } from "@/app/icone-ottica";

const IconaOcchiali = IconaCatalogoOttica;

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

function coloreCss(valore: string | null | undefined) {
  const testo = (valore ?? "").trim().toLowerCase();

  const colori: Record<string, string> = {
    nero: "#111111",
    nera: "#111111",
    black: "#111111",
    bianco: "#FFFFFF",
    bianca: "#FFFFFF",
    white: "#FFFFFF",
    grigio: "#808080",
    grigia: "#808080",
    grey: "#808080",
    gray: "#808080",
    argento: "#C0C0C0",
    silver: "#C0C0C0",
    oro: "#D4AF37",
    gold: "#D4AF37",
    dorato: "#D4AF37",
    dorata: "#D4AF37",
    rosso: "#D64545",
    rossa: "#D64545",
    bordeaux: "#7B1E2B",
    blu: "#315C9B",
    blue: "#315C9B",
    azzurro: "#6FAED9",
    azzurra: "#6FAED9",
    verde: "#5A8F63",
    green: "#5A8F63",
    oliva: "#7A7D45",
    marrone: "#7A5238",
    brown: "#7A5238",
    beige: "#D8C5A5",
    avana: "#A67645",
    tartaruga: "#8A5B3D",
    rosa: "#D98FA5",
    pink: "#D98FA5",
    fucsia: "#D13C86",
    viola: "#76528F",
    purple: "#76528F",
    giallo: "#E3C548",
    yellow: "#E3C548",
    arancione: "#E58A3A",
    orange: "#E58A3A",
    trasparente: "#F8F8F8",
    cristallo: "#F8F8F8",
    fumé: "#6F7478",
    fume: "#6F7478",
    fumo: "#6F7478",
    smoke: "#6F7478",
    ambra: "#C98B3C",
    verdeacqua: "#64B3A6",
  };

  const compatto = testo.replace(/[\s_-]+/g, "");

  if (colori[testo]) return colori[testo];
  if (colori[compatto]) return colori[compatto];

  for (const chiave of Object.keys(colori)) {
    if (testo.includes(chiave) || compatto.includes(chiave)) {
      return colori[chiave];
    }
  }

  return "#D1D5DB";
}

function testoVariante(
  montatura: string | null | undefined,
  lente: string | null | undefined
) {
  const m = (montatura ?? "").trim();
  const l = (lente ?? "").trim();

  if (m && l) return `${m}/${l}`;
  if (m) return m;
  if (l) return l;
  return "—";
}

function variantiUniche(articolo: Articolo) {
  return Array.from(
    new Map(
      (articolo.varianti ?? [])
        .map((v) => {
          const montatura = (v.colore_montatura ?? "").trim();
          const lente = (v.colore_lente ?? "").trim();
          const key = `${montatura}||${lente}`;

          return [
            key,
            {
              key,
              montatura,
              lente,
              etichetta: testoVariante(montatura, lente),
            },
          ] as const;
        })
        .filter(
          ([key, value]) =>
            key !== "||" &&
            (value.montatura !== "" || value.lente !== "")
        )
    ).values()
  );
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
    <main className="min-h-screen bg-[var(--app-background)] pb-28 text-[var(--app-text)]">
      <header className="border-b border-[var(--app-border)] bg-[var(--app-surface)]">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--app-primary)]">
                Collezione
              </p>
              <h1 className="mt-2 font-serif text-4xl font-medium tracking-[-0.04em] text-[var(--app-text)] sm:text-5xl">
                Catalogo
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--app-muted)] sm:text-base">
                Montature selezionate, colori e modelli disponibili nel centro ottico.
              </p>
            </div>

            <Link
              href="/"
              className="w-fit rounded-full border border-[#D2DEDA] bg-[var(--app-surface)] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--app-primary-hover)]"
            >
              ← Home
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="rounded-[22px] border border-[color-mix(in_srgb,var(--app-text)_14%,white)] bg-[var(--app-surface)] p-4 shadow-[0_12px_30px_rgba(80,108,105,.06)] sm:p-5">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--app-primary)]">
                Esplora la collezione
              </p>
              <p className="mt-1 text-sm font-medium text-[var(--app-text-soft)]">
                {filtrati.length} {filtrati.length === 1 ? "prodotto" : "prodotti"} trovati
              </p>
            </div>

            <span className="rounded-full border border-[var(--app-border-strong)] bg-[var(--app-surface-soft)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--app-primary-hover)]">
              Catalogo aggiornato
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <input
              type="search"
              value={ricerca}
              onChange={(e) => setRicerca(e.target.value)}
              placeholder="Cerca prodotto..."
              className="w-full rounded-xl border border-[var(--app-border-strong)] bg-[var(--app-surface)] px-4 py-3 text-sm text-[var(--app-text)] outline-none transition placeholder:text-[#9AA9A5] focus:border-[var(--app-primary)]"
            />

            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full rounded-xl border border-[var(--app-border-strong)] bg-[var(--app-surface)] px-4 py-3 text-sm text-[var(--app-text)] outline-none focus:border-[var(--app-primary)]"
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
              className="w-full rounded-xl border border-[var(--app-border-strong)] bg-[var(--app-surface)] px-4 py-3 text-sm text-[var(--app-text)] outline-none focus:border-[var(--app-primary)]"
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
          <div className="mt-6 rounded-[20px] border border-[var(--app-border)] bg-[var(--app-surface)] p-8 text-center text-sm font-medium text-[var(--app-muted)]">
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
                  className="group relative flex min-h-full w-full flex-col overflow-hidden rounded-[18px] border border-[color-mix(in_srgb,var(--app-text)_16%,white)] bg-[var(--app-surface)] shadow-[0_10px_24px_rgba(80,108,105,.06)] transition duration-300 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--app-text)_22%,white)] hover:shadow-[0_14px_30px_rgba(80,108,105,.10)] sm:rounded-[22px]"
                >

                  <div className="border-b border-[color-mix(in_srgb,var(--app-text)_14%,white)] bg-white">
                    <Link
                      href={`/catalogo/${articolo.id}?foto=copertina`}
                      className="relative block"
                    >
                      <div className="relative aspect-square overflow-hidden bg-white">
                        {articolo.in_promozione &&
                          articolo.sconto_percentuale !== null && (
                            <div
                              className="absolute left-2 top-2 z-20 rounded-full border border-[color-mix(in_srgb,var(--app-danger)_35%,white)] bg-[color-mix(in_srgb,var(--app-danger)_16%,white)] px-2 py-1 text-[8px] font-semibold tracking-[0.02em] text-[var(--app-danger)] sm:left-3 sm:top-3 sm:px-2.5 sm:py-1.5 sm:text-[10px]"
                            >
                              PROMO -{Number(articolo.sconto_percentuale)}%
                            </div>
                          )}

                        <div
                          className="absolute right-2 top-2 z-10 max-w-[48%] truncate rounded-full border border-[var(--app-border)] bg-[var(--app-surface)]/90 px-2 py-1 text-[7px] font-semibold uppercase tracking-[0.08em] text-[var(--app-text-soft)] backdrop-blur-sm sm:right-3 sm:top-3 sm:px-2.5 sm:text-[9px]"
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
                          <div className="flex h-full items-center justify-center text-[var(--app-primary)]">
                            <IconaOcchiali />
                          </div>
                        )}
                      </div>
                    </Link>

                    <div className="px-3 pb-3 pt-2 sm:px-5 sm:pb-4">
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        {variantiUniche(articolo).length > 0 ? (
                          variantiUniche(articolo).map((variante, indice) => {
                            const coloreMontatura = coloreCss(variante.montatura);
                            const coloreLente = coloreCss(
                              variante.lente || variante.montatura
                            );

                            return (
                              <span
                                key={variante.key}
                                className={`h-5 w-5 rounded-full border border-black/20 shadow-sm ${
                                  indice === 0
                                    ? "ring-2 ring-[#63A5FF] ring-offset-2"
                                    : ""
                                }`}
                                style={{
                                  background:
                                    variante.montatura && variante.lente
                                      ? `linear-gradient(90deg, ${coloreMontatura} 0 50%, ${coloreLente} 50% 100%)`
                                      : variante.montatura
                                        ? coloreMontatura
                                        : coloreLente,
                                }}
                                title={variante.etichetta}
                                aria-label={variante.etichetta}
                              />
                            );
                          })
                        ) : articolo.colore_lente ? (
                          <span
                            className="h-5 w-5 rounded-full border border-black/20 shadow-sm ring-2 ring-[#63A5FF] ring-offset-2"
                            style={{
                              backgroundColor: coloreCss(articolo.colore_lente),
                            }}
                            title={articolo.colore_lente}
                            aria-label={articolo.colore_lente}
                          />
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col bg-[var(--app-surface)] p-3 sm:p-5">
                    <p className="truncate text-[8px] font-semibold uppercase tracking-[0.14em] text-[var(--app-text-soft)] sm:text-[10px] sm:tracking-[0.18em]">
                      {articolo.marca || "OTTICA APP"}
                    </p>

                    <Link href={`/catalogo/${articolo.id}?foto=copertina`}>
                      <h2 className="mt-1 line-clamp-2 h-[34px] font-serif text-[14px] font-medium leading-[1.2] tracking-[-0.015em] text-[var(--app-text)] sm:h-[46px] sm:text-[1.2rem]">
                        {articolo.nome}
                      </h2>
                    </Link>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] sm:text-xs">
                      <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-3 py-2.5">
                        <span className="block text-[8px] font-semibold uppercase tracking-[0.12em] text-[var(--app-muted)]">
                          Modello
                        </span>
                        <span className="mt-1 block truncate font-medium text-[var(--app-text-soft)]">
                          {articolo.modello || "—"}
                        </span>
                      </div>

                      <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-3 py-2.5">
                        <span className="block text-[8px] font-semibold uppercase tracking-[0.12em] text-[var(--app-muted)]">
                          Forma
                        </span>
                        <span className="mt-1 block truncate font-medium text-[var(--app-text-soft)]">
                          {articolo.forma || "—"}
                        </span>
                      </div>

                      <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-3 py-2.5">
                        <span className="block text-[8px] font-semibold uppercase tracking-[0.12em] text-[var(--app-muted)]">
                          Materiale
                        </span>
                        <span className="mt-1 block truncate font-medium text-[var(--app-text-soft)]">
                          {articolo.materiale || "—"}
                        </span>
                      </div>

                      <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-3 py-2.5">
                        <span className="block text-[8px] font-semibold uppercase tracking-[0.12em] text-[var(--app-muted)]">
                          Tipo lente
                        </span>
                        <span className="mt-1 block truncate font-medium text-[var(--app-text-soft)]">
                          {articolo.tipo_lente || "—"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-[var(--app-border)] pt-3 text-[10px] sm:text-xs">
                      <span className="font-semibold text-[var(--app-text)]">
                        Colore lente
                      </span>

                      {articolo.colore_lente ? (
                        <span
                          className="h-4 w-4 rounded-full border border-black/20 shadow-sm"
                          style={{
                            backgroundColor: coloreCss(
                              articolo.colore_lente
                            ),
                          }}
                          title={articolo.colore_lente}
                          aria-label={`Colore lente ${articolo.colore_lente}`}
                        />
                      ) : (
                        <span className="text-[var(--app-muted)]">—</span>
                      )}
                    </div>

                    <div className="mt-3 space-y-2 text-[10px] sm:text-xs">
                      <span className="block font-semibold text-[var(--app-text)]">
                        Varianti disponibili
                      </span>

                      <div className="flex flex-wrap gap-2">
                        {variantiUniche(articolo).length > 0 ? (
                          variantiUniche(articolo).map((variante) => {
                            const coloreMontatura = coloreCss(variante.montatura);
                            const coloreLente = coloreCss(
                              variante.lente || variante.montatura
                            );

                            return (
                              <span
                                key={variante.key}
                                className="inline-flex items-center gap-2 rounded-full border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-2.5 py-1.5 text-[10px] font-medium text-[var(--app-text-soft)]"
                              >
                                <span
                                  className="h-4 w-4 shrink-0 rounded-full border border-black/20 shadow-sm"
                                  style={{
                                    background:
                                      variante.montatura && variante.lente
                                        ? `linear-gradient(90deg, ${coloreMontatura} 0 50%, ${coloreLente} 50% 100%)`
                                        : variante.montatura
                                          ? coloreMontatura
                                          : coloreLente,
                                  }}
                                  title={variante.etichetta}
                                  aria-label={variante.etichetta}
                                />
                                <span>{variante.etichetta}</span>
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-[var(--app-muted)]">—</span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex min-h-[42px] items-end border-t border-[var(--app-border)] pt-4 sm:min-h-[48px]">
                      {promo ? (
                        <div className="flex flex-col gap-0.5 sm:flex-row sm:flex-wrap sm:items-end sm:gap-x-2">
                          <span
                            className="text-[9px] font-semibold line-through sm:text-xs"
                            style={{
                              color: "color-mix(in srgb, var(--app-danger) 78%, var(--app-muted))",
                              textDecorationColor: "var(--app-danger)",
                              textDecorationThickness: "1.5px",
                            }}
                          >
                            {euro(Number(articolo.prezzo))}
                          </span>

                          <span className="text-[18px] font-semibold leading-none text-[var(--app-danger)] sm:text-2xl">
                            {euro(Number(articolo.prezzo_promozionale))}
                          </span>
                        </div>
                      ) : (
                        <p className="text-[18px] font-semibold leading-none text-[var(--app-text-soft)] sm:text-2xl">
                          {euro(Number(articolo.prezzo))}
                        </p>
                      )}
                    </div>

                    <Link
                      href={`/catalogo/${articolo.id}?foto=copertina`}
                      className="mt-5 flex h-[42px] w-full shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[var(--app-primary)] px-2.5 text-[10px] font-semibold text-white shadow-[0_7px_16px_rgba(80,108,105,.10)] transition hover:bg-[var(--app-primary-hover)] sm:mt-6 sm:h-[48px] sm:rounded-xl sm:px-4 sm:text-sm"
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
