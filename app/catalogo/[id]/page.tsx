import Link from "next/link";
import { notFound } from "next/navigation";
import type { Articolo } from "../types";

const API_ARUBA =
  "https://www.agentiplusdb.net/ottica-api/catalogo.php";

type PageProps = {
  params: Promise<{ id: string }>;
};

type RispostaCatalogo = {
  ok: boolean;
  articoli?: Articolo[];
  errore?: string;
};

async function caricaProdotto(id: number): Promise<Articolo | null> {
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
      return null;
    }

    const dati =
      (await risposta.json()) as RispostaCatalogo;

    if (!dati.ok) {
      return null;
    }

    return (
      (dati.articoli ?? []).find(
        (prodotto: Articolo) => Number(prodotto.id) === id
      ) ?? null
    );
  } catch {
    return null;
  }
}

function formattaPrezzo(prezzo: number) {
  return `€ ${Number(prezzo)
    .toFixed(2)
    .replace(".", ",")}`;
}


function IconaHome() {
  return (
    <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M4 10.5 12 4l8 6.5V20H4v-9.5Z" />
      <path d="M9 20v-6h6v6" />
    </svg>
  );
}

function IconaOcchiali() {
  return (
    <svg viewBox="0 0 32 24" className="h-[24px] w-[30px]" fill="none" stroke="currentColor" strokeWidth="1.7">
      <ellipse cx="9" cy="13" rx="6" ry="5.5" />
      <ellipse cx="23" cy="13" rx="6" ry="5.5" />
      <path d="M15 12c1-1.6 2-1.6 3 0M3 11 1.5 5M29 11 30.5 5" />
    </svg>
  );
}

function IconaCalendario() {
  return (
    <svg viewBox="0 0 24 24" className="h-[23px] w-[23px]" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.8" />
      <path d="M8 3v4M16 3v4M3.5 9.5h17" />
    </svg>
  );
}

function IconaPromo() {
  return (
    <svg viewBox="0 0 24 24" className="h-[23px] w-[23px]" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M4 8.5 10.5 2H19v8.5L12.5 17 4 8.5Z" />
      <circle cx="15.7" cy="5.7" r="1.2" />
    </svg>
  );
}

function IconaProfilo() {
  return (
    <svg viewBox="0 0 24 24" className="h-[23px] w-[23px]" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="8" r="3.7" />
      <path d="M5 20c1.2-4.1 3.6-6.1 7-6.1s5.8 2 7 6.1" />
    </svg>
  );
}

export default async function DettaglioProdottoPage({
  params,
}: PageProps) {
  const { id } = await params;
  const prodottoId = Number(id);

  if (!Number.isFinite(prodottoId)) {
    notFound();
  }

  const prodotto = await caricaProdotto(prodottoId);

  if (!prodotto) {
    notFound();
  }

  const quantitaTotale = (prodotto.varianti ?? []).reduce(
    (totale, variante) =>
      totale + Number(variante.quantita ?? 0),
    0
  );

  const inPromo =
    prodotto.in_promozione === true &&
    prodotto.sconto_percentuale !== null &&
    prodotto.prezzo_promozionale !== null;

  const scontoPromo = inPromo
    ? Number(prodotto.sconto_percentuale)
    : null;

  const prezzoPromo = inPromo
    ? Number(prodotto.prezzo_promozionale)
    : null;

  return (
    <main className="min-h-screen bg-[#F6F4EF] pb-28 text-[#20383B]">
      <header className="sticky top-0 z-50 border-b border-[#D9E2DF] bg-[#FBFAF7]/95 text-[#20383B] backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link
            href="/catalogo"
            className="rounded-xl border border-[#D4DFDB] bg-white px-3 py-2 text-xs font-semibold text-[#738682]"
          >
            ← Catalogo
          </Link>

          <p className="text-sm font-semibold">
            OTTICA APP
          </p>

          <Link
            href="/login"
            className="rounded-xl border border-[#D4DFDB] bg-white px-3 py-2 text-xs font-semibold text-[#738682]"
          >
            Admin
          </Link>
        </div>
      </header>

      <section className="border-b border-[#D9E2DF] bg-[linear-gradient(135deg,#EEF3F0_0%,#FBFAF7_52%,#F5F2EC_100%)] text-[#20383B]">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#89A39D]">
            Dettaglio montatura
          </p>

          <h1 className="mt-2 font-serif text-4xl font-medium tracking-[-0.05em] sm:text-6xl">
            {prodotto.nome}
          </h1>

          <p className="mt-3 text-sm font-medium text-[#7E8F8B]">
            {prodotto.marca || "Ottica App"}
            {prodotto.modello
              ? ` · ${prodotto.modello}`
              : ""}
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-2 lg:py-10">
        <div>
          <div className="aspect-square overflow-hidden rounded-[22px] border border-[#D9E2DF] bg-white shadow-[0_14px_34px_rgba(80,108,105,.07)]">
            {prodotto.immagine_url ? (
              <img
                src={prodotto.immagine_url}
                alt={prodotto.nome}
                className="h-full w-full object-contain p-5"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[#8FB8B2]">
                <IconaOcchiali />
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[22px] border border-[#D9E2DF] bg-[#FBFAF7] p-5 shadow-[0_12px_30px_rgba(80,108,105,.05)] sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#89A39D]">
                {prodotto.categoria}
              </p>

              <h2 className="mt-1 font-serif text-3xl font-medium tracking-[-0.04em]">
                {prodotto.nome}
              </h2>
            </div>

            {inPromo ? (
              <div className="text-right">
                <div className="mb-2 inline-flex rounded-full border border-[#E7C9C5] bg-[#F6E7E4] px-3 py-1 text-[11px] font-semibold text-[#9A615A]">
                  PROMO -{scontoPromo}%
                </div>

                <div className="flex items-end justify-end gap-2">
                  <span className="text-sm font-bold text-[#8A9A9E] line-through">
                    {formattaPrezzo(prodotto.prezzo)}
                  </span>
                  <span className="font-serif text-2xl font-medium text-[#A85D55]">
                    {formattaPrezzo(prezzoPromo ?? 0)}
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

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-[#D9E2DF] bg-white p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8B9C98]">
                Genere
              </p>
              <p className="mt-1 font-semibold">
                {prodotto.genere || "-"}
              </p>
            </div>

            <div className="rounded-2xl border border-[#D9E2DF] bg-white p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8B9C98]">
                Materiale
              </p>
              <p className="mt-1 font-semibold">
                {prodotto.materiale || "-"}
              </p>
            </div>

            <div className="rounded-2xl border border-[#D9E2DF] bg-white p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8B9C98]">
                Forma
              </p>
              <p className="mt-1 font-semibold">
                {prodotto.forma || "-"}
              </p>
            </div>

            <div className="rounded-2xl border border-[#D9E2DF] bg-white p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8B9C98]">
                Disponibilità
              </p>
              <p className="mt-1 font-semibold">
                {quantitaTotale} pezzi
              </p>
            </div>
          </div>

          {(prodotto.varianti?.length ?? 0) > 0 && (
            <div className="mt-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#89A39D]">
                Varianti disponibili
              </p>

              <div className="mt-3 grid gap-2">
                {(prodotto.varianti ?? []).map((variante) => (
                  <div
                    key={variante.id}
                    className="flex items-center justify-between rounded-xl border border-[#D9E2DF] bg-white px-4 py-3 text-sm"
                  >
                    <span className="font-medium text-[#6F918B]">
                      {[
                        variante.colore,
                        variante.taglia,
                        variante.misura,
                      ]
                        .filter(Boolean)
                        .join(" · ") || "Variante"}
                    </span>

                    <span className="font-semibold text-[#506C69]">
                      {variante.quantita} disp.
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {inPromo ? (
            <Link
              href={`/acquista/${prodotto.id}`}
              className="mt-7 flex w-full items-center justify-center rounded-2xl bg-red-600 px-5 py-4 text-sm font-semibold text-white shadow-lg transition active:scale-[0.99]"
            >
              ACQUISTA CON PROMO
            </Link>
          ) : (
            <Link
              href={`/acquista/${prodotto.id}`}
              className="mt-7 flex w-full items-center justify-center rounded-2xl bg-[#506C69] px-5 py-4 text-sm font-semibold text-white shadow-lg transition active:scale-[0.99]"
            >
              ACQUISTA
            </Link>
          )}

          <Link
            href="/appuntamenti"
            className="mt-3 flex w-full items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#506C69,#7FA39A)] px-5 py-4 text-sm font-semibold text-white shadow-lg"
          >
            Prenota prova montatura
          </Link>

          <Link
            href="/catalogo"
            className="mt-3 flex w-full items-center justify-center rounded-2xl border border-[#BFD9DD] bg-white px-5 py-4 text-sm font-semibold text-[#7FA39A]"
          >
            Torna al catalogo
          </Link>
        </div>
      </section>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#D9E2DF] bg-[#FBFAF7]/96 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 backdrop-blur-xl">
        <div className="mx-auto grid max-w-md grid-cols-5">
          <Link href="/" className="flex flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[#8B9C98]">
            <IconaHome />
            <span className="text-[10px] font-medium">Home</span>
          </Link>

          <Link href="/catalogo" className="flex flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[#6F918B]">
            <IconaOcchiali />
            <span className="text-[10px] font-semibold">Catalogo</span>
          </Link>

          <Link href="/appuntamenti" className="flex flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[#8B9C98]">
            <IconaCalendario />
            <span className="text-[10px] font-medium">Prenota</span>
          </Link>

          <Link href="/promozioni" className="flex flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[#8B9C98]">
            <IconaPromo />
            <span className="text-[10px] font-medium">Promo</span>
          </Link>

          <Link href="/profilo" className="flex flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[#8B9C98]">
            <IconaProfilo />
            <span className="text-[10px] font-medium">Profilo</span>
          </Link>
        </div>
      </nav>
    </main>
  );
}
