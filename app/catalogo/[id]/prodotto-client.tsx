"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type VarianteDettaglio = {
  id?: number;
  colore_montatura?: string | null;
  colore_lente?: string | null;
  misura?: string | null;
  immagine_url?: string | null;
  quantita?: number | null;
};

export type ProdottoDettaglio = {
  id: number;
  nome?: string | null;
  descrizione?: string | null;
  categoria?: string | null;
  prezzo: number;
  immagine_url?: string | null;
  marca?: string | null;
  modello?: string | null;
  codice_articolo?: string | null;
  genere?: string | null;
  tipo_lente?: string | null;
  colore_montatura?: string | null;
  colore_lente?: string | null;
  in_promozione?: boolean | null;
  sconto_percentuale?: number | null;
  prezzo_promozionale?: number | null;
  varianti?: VarianteDettaglio[];
};

type Props = {
  prodotto: ProdottoDettaglio;
};

function formattaPrezzo(prezzo: number) {
  return `€ ${Number(prezzo)
    .toFixed(2)
    .replace(".", ",")}`;
}

function titoloProdotto(prodotto: ProdottoDettaglio) {
  const titolo = [prodotto.marca, prodotto.modello]
    .map((v) => String(v ?? "").trim())
    .filter(Boolean)
    .join(" ");

  return titolo || prodotto.nome || "Prodotto";
}

function coloreCss(valore?: string | null) {
  const testo = String(valore ?? "")
    .trim()
    .toLowerCase();

  if (!testo) return "#D9E2DF";

  const colori: Array<[string, string]> = [
    ["nero", "#171717"],
    ["nera", "#171717"],
    ["black", "#171717"],
    ["bianco", "#F5F5F3"],
    ["bianca", "#F5F5F3"],
    ["white", "#F5F5F3"],
    ["grigio", "#808789"],
    ["grigia", "#808789"],
    ["grey", "#808789"],
    ["gray", "#808789"],
    ["argento", "#A7ADB0"],
    ["silver", "#A7ADB0"],
    ["oro", "#B69354"],
    ["dorato", "#B69354"],
    ["dorata", "#B69354"],
    ["gold", "#B69354"],
    ["marrone", "#76563D"],
    ["marrone scuro", "#523A2A"],
    ["brown", "#76563D"],
    ["tartarugato", "#7A5636"],
    ["tartarugata", "#7A5636"],
    ["havana", "#785438"],
    ["avana", "#785438"],
    ["blu", "#39536D"],
    ["blue", "#39536D"],
    ["azzurro", "#72A9C8"],
    ["azzurra", "#72A9C8"],
    ["verde", "#55735E"],
    ["green", "#55735E"],
    ["rosso", "#A84943"],
    ["rossa", "#A84943"],
    ["red", "#A84943"],
    ["rosa", "#C98C99"],
    ["pink", "#C98C99"],
    ["viola", "#695470"],
    ["purple", "#695470"],
    ["giallo", "#D8B54E"],
    ["gialla", "#D8B54E"],
    ["arancio", "#C97946"],
    ["arancione", "#C97946"],
    ["trasparente", "#EDEDEA"],
    ["cristallo", "#EDEDEA"],
  ];

  const esatto = colori.find(([nome]) => testo === nome);
  if (esatto) return esatto[1];

  const contenuto = colori.find(([nome]) =>
    testo.includes(nome)
  );
  if (contenuto) return contenuto[1];

  return "#8FA6A1";
}

function descrizioneVariante(variante: VarianteDettaglio) {
  const colori = [
    variante.colore_montatura,
    variante.colore_lente,
  ]
    .map((v) => String(v ?? "").trim())
    .filter(Boolean)
    .join(" / ");

  const parti = [
    colori,
    variante.misura
      ? `Misura ${variante.misura}`
      : "",
  ].filter(Boolean);

  return parti.join(" · ") || "Variante";
}

function PallinoVariante({
  variante,
  selezionata,
  onClick,
}: {
  variante: VarianteDettaglio;
  selezionata: boolean;
  onClick: () => void;
}) {
  const montatura = coloreCss(variante.colore_montatura);
  const lente = coloreCss(variante.colore_lente);

  return (
    <button
      type="button"
      onClick={onClick}
      title={descrizioneVariante(variante)}
      aria-label={`Seleziona ${descrizioneVariante(variante)}`}
      className={`flex h-11 w-11 items-center justify-center rounded-full border-2 transition ${
        selezionata
          ? "border-[#506C69] bg-white shadow-[0_0_0_3px_rgba(80,108,105,.12)]"
          : "border-[#D6E0DD] bg-white hover:border-[#8FB8B2]"
      }`}
    >
      <span
        className="block h-7 w-7 rounded-full border border-black/10"
        style={{
          background: `linear-gradient(90deg, ${montatura} 0 50%, ${lente} 50% 100%)`,
        }}
      />
    </button>
  );
}

export default function ProdottoClient({
  prodotto,
}: Props) {
  const varianti = useMemo(
    () => prodotto.varianti ?? [],
    [prodotto.varianti]
  );

  const indiceIniziale = useMemo(() => {
    const disponibile = varianti.findIndex(
      (v) => Number(v.quantita ?? 0) > 0
    );

    return disponibile >= 0
      ? disponibile
      : varianti.length > 0
      ? 0
      : -1;
  }, [varianti]);

  const [indiceSelezionato, setIndiceSelezionato] =
    useState(indiceIniziale);

  const varianteSelezionata =
    indiceSelezionato >= 0
      ? varianti[indiceSelezionato]
      : null;

  const quantitaTotale = varianti.reduce(
    (totale, variante) =>
      totale + Number(variante.quantita ?? 0),
    0
  );

  const quantitaMostrata = varianteSelezionata
    ? Number(varianteSelezionata.quantita ?? 0)
    : quantitaTotale;

  const immagineMostrata =
    varianteSelezionata?.immagine_url ||
    prodotto.immagine_url ||
    "";

  const titolo = titoloProdotto(prodotto);

  const inPromo =
    prodotto.in_promozione === true &&
    prodotto.sconto_percentuale !== null &&
    prodotto.sconto_percentuale !== undefined &&
    prodotto.prezzo_promozionale !== null &&
    prodotto.prezzo_promozionale !== undefined;

  const hrefAcquista =
    varianteSelezionata?.id != null
      ? `/acquista/${prodotto.id}?variante=${varianteSelezionata.id}`
      : `/acquista/${prodotto.id}`;

  const acquistabile =
    varianti.length === 0 || quantitaMostrata > 0;

  return (
    <main className="min-h-screen bg-[#F6F4EF] pb-12 text-[#20383B]">
      <header className="sticky top-0 z-50 border-b border-[#D9E2DF] bg-[#FBFAF7]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            href="/catalogo"
            className="rounded-full border border-[#D4DFDB] bg-white px-4 py-2 text-xs font-semibold text-[#607A76]"
          >
            ← Catalogo
          </Link>

          <p className="text-sm font-semibold">
            OTTICA APP
          </p>

          <Link
            href="/login"
            className="rounded-full border border-[#D4DFDB] bg-white px-4 py-2 text-xs font-semibold text-[#607A76]"
          >
            Admin
          </Link>
        </div>
      </header>

      <section className="border-b border-[#D9E2DF] bg-[#FBFAF7]">
        <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-9">
          <h1 className="font-serif text-4xl font-medium tracking-[-0.045em] sm:text-6xl">
            {titolo}
          </h1>

          {(prodotto.marca || prodotto.modello) && (
            <p className="mt-3 text-sm text-[#738682]">
              {prodotto.marca || ""}
              {prodotto.marca && prodotto.modello
                ? " · "
                : ""}
              {prodotto.modello || ""}
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_1fr] lg:py-10">
        <div className="overflow-hidden rounded-[22px] border border-[#D9E2DF] bg-white shadow-[0_14px_34px_rgba(80,108,105,.06)]">
          <div className="aspect-square bg-[#F7F7F5]">
            {immagineMostrata ? (
              <img
                src={immagineMostrata}
                alt={titolo}
                className="h-full w-full object-contain p-5"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm font-semibold text-[#8B9C98]">
                Nessuna immagine disponibile
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[22px] border border-[#D9E2DF] bg-[#FBFAF7] p-6 shadow-[0_12px_30px_rgba(80,108,105,.05)] sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#89A39D]">
                {prodotto.categoria || "Prodotto"}
              </p>

              <h2 className="mt-1 font-serif text-3xl font-medium tracking-[-0.04em]">
                {titolo}
              </h2>
            </div>

            {inPromo ? (
              <div className="text-right">
                <div className="mb-2 inline-flex rounded-full border border-[#E7C9C5] bg-[#F6E7E4] px-3 py-1 text-[11px] font-semibold text-[#9A615A]">
                  PROMO -{Number(prodotto.sconto_percentuale)}%
                </div>

                <div className="flex items-end justify-end gap-2">
                  <span className="text-sm font-semibold text-[#8A9A9E] line-through">
                    {formattaPrezzo(prodotto.prezzo)}
                  </span>
                  <span className="font-serif text-2xl font-medium text-[#A85D55]">
                    {formattaPrezzo(
                      Number(
                        prodotto.prezzo_promozionale ?? 0
                      )
                    )}
                  </span>
                </div>
              </div>
            ) : (
              <p className="font-serif text-2xl font-medium text-[#506C69]">
                {formattaPrezzo(prodotto.prezzo)}
              </p>
            )}
          </div>

          {prodotto.descrizione && (
            <p className="mt-5 text-sm leading-7 text-[#738682]">
              {prodotto.descrizione}
            </p>
          )}

          <div className="mt-7 flex items-center gap-3 border-t border-[#DDE5E2] pt-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#89A39D]">
              Disponibilità
            </p>

            <span className="flex h-9 min-w-9 items-center justify-center rounded-lg border border-[#CBDAD6] bg-white px-2 text-sm font-semibold text-[#506C69] shadow-sm">
              {quantitaMostrata}
            </span>
          </div>

          {varianti.length > 0 && (
            <div className="mt-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#89A39D]">
                Scegli colore
              </p>

              <div className="mt-3 flex flex-wrap gap-3">
                {varianti.map((variante, indice) => (
                  <PallinoVariante
                    key={variante.id ?? indice}
                    variante={variante}
                    selezionata={indice === indiceSelezionato}
                    onClick={() => {
                      setIndiceSelezionato(indice);
                    }}
                  />
                ))}
              </div>

              {varianteSelezionata && (
                <div className="mt-4 rounded-xl border border-[#D9E2DF] bg-white px-4 py-3">
                  <p className="text-sm font-semibold text-[#506C69]">
                    {descrizioneVariante(
                      varianteSelezionata
                    )}
                  </p>
                  <p className="mt-1 text-xs text-[#8B9C98]">
                    {quantitaMostrata > 0
                      ? `${quantitaMostrata} disponibili`
                      : "Momentaneamente non disponibile"}
                  </p>
                </div>
              )}
            </div>
          )}

          {acquistabile ? (
            <Link
              href={hrefAcquista}
              className={`mt-7 flex w-full items-center justify-center rounded-xl px-5 py-4 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(80,108,105,.14)] transition active:scale-[0.99] ${
                inPromo
                  ? "bg-[#A85D55]"
                  : "bg-[#506C69]"
              }`}
            >
              {inPromo
                ? "ACQUISTA CON PROMO"
                : "ACQUISTA"}
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="mt-7 flex w-full cursor-not-allowed items-center justify-center rounded-xl bg-[#B9C5C2] px-5 py-4 text-sm font-semibold text-white"
            >
              NON DISPONIBILE
            </button>
          )}

          <Link
            href="/catalogo"
            className="mt-3 flex w-full items-center justify-center rounded-xl border border-[#BFD9DD] bg-white px-5 py-4 text-sm font-semibold text-[#6F918B]"
          >
            Torna al catalogo
          </Link>
        </div>
      </section>
    </main>
  );
}
