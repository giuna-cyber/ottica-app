import Link from "next/link";
import { notFound } from "next/navigation";
import type { Articolo, RispostaCatalogo } from "../types";

const API_ARUBA =
  "https://www.agentiplusdb.net/ottica-api/catalogo.php";

type PageProps = {
  params: Promise<{ id: string }>;
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
        (prodotto) => Number(prodotto.id) === id
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
    <main className="min-h-screen bg-white pb-24 text-[#102A2E]">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0C252B]/95 text-white backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link
            href="/catalogo"
            className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-black"
          >
            ← Catalogo
          </Link>

          <p className="text-sm font-black">
            OTTICA APP
          </p>

          <Link
            href="/login"
            className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-black"
          >
            Admin
          </Link>
        </div>
      </header>

      <section className="bg-[linear-gradient(135deg,#083B4C_0%,#1D6E7A_58%,#A9D6DE_100%)] text-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#D8F4F7]">
            Dettaglio montatura
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-[-0.05em] sm:text-6xl">
            {prodotto.nome}
          </h1>

          <p className="mt-3 text-sm font-bold text-white/75">
            {prodotto.marca || "Ottica App"}
            {prodotto.modello
              ? ` · ${prodotto.modello}`
              : ""}
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-2 lg:py-10">
        <div>
          <div className="aspect-square overflow-hidden rounded-3xl border-2 border-[#1D6E7A] bg-white shadow-[0_18px_50px_rgba(8,59,76,0.10)]">
            {prodotto.immagine_url ? (
              <img
                src={prodotto.immagine_url}
                alt={prodotto.nome}
                className="h-full w-full object-contain p-5"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-7xl">
                👓
              </div>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-[#DCE8E9] bg-[#F8FBFB] p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#5D858C]">
                {prodotto.categoria}
              </p>

              <h2 className="mt-1 text-3xl font-black tracking-[-0.04em]">
                {prodotto.nome}
              </h2>
            </div>

            {inPromo ? (
              <div className="text-right">
                <div className="mb-2 inline-flex rounded-full bg-red-600 px-3 py-1 text-[11px] font-black text-white">
                  PROMO -{scontoPromo}%
                </div>

                <div className="flex items-end justify-end gap-2">
                  <span className="text-sm font-bold text-[#8A9A9E] line-through">
                    {formattaPrezzo(prodotto.prezzo)}
                  </span>
                  <span className="text-2xl font-black text-red-600">
                    {formattaPrezzo(prezzoPromo ?? 0)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-2xl font-black text-[#083B4C]">
                {formattaPrezzo(prodotto.prezzo)}
              </p>
            )}
          </div>

          {prodotto.descrizione && (
            <p className="mt-5 text-sm leading-7 text-[#60777C]">
              {prodotto.descrizione}
            </p>
          )}

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-[#DCE8E9] bg-white p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#789095]">
                Genere
              </p>
              <p className="mt-1 font-black">
                {prodotto.genere || "-"}
              </p>
            </div>

            <div className="rounded-2xl border border-[#DCE8E9] bg-white p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#789095]">
                Materiale
              </p>
              <p className="mt-1 font-black">
                {prodotto.materiale || "-"}
              </p>
            </div>

            <div className="rounded-2xl border border-[#DCE8E9] bg-white p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#789095]">
                Forma
              </p>
              <p className="mt-1 font-black">
                {prodotto.forma || "-"}
              </p>
            </div>

            <div className="rounded-2xl border border-[#DCE8E9] bg-white p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#789095]">
                Disponibilità
              </p>
              <p className="mt-1 font-black">
                {quantitaTotale} pezzi
              </p>
            </div>
          </div>

          {prodotto.varianti?.length > 0 && (
            <div className="mt-6">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#5D858C]">
                Varianti disponibili
              </p>

              <div className="mt-3 grid gap-2">
                {prodotto.varianti.map((variante) => (
                  <div
                    key={variante.id}
                    className="flex items-center justify-between rounded-xl border border-[#DCE8E9] bg-white px-4 py-3 text-sm"
                  >
                    <span className="font-bold text-[#4E6D73]">
                      {[
                        variante.colore,
                        variante.taglia,
                        variante.misura,
                      ]
                        .filter(Boolean)
                        .join(" · ") || "Variante"}
                    </span>

                    <span className="font-black text-[#083B4C]">
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
              className="mt-7 flex w-full items-center justify-center rounded-2xl bg-red-600 px-5 py-4 text-sm font-black text-white shadow-lg transition active:scale-[0.99]"
            >
              ACQUISTA CON PROMO
            </Link>
          ) : (
            <Link
              href={`/acquista/${prodotto.id}`}
              className="mt-7 flex w-full items-center justify-center rounded-2xl bg-[#083B4C] px-5 py-4 text-sm font-black text-white shadow-lg transition active:scale-[0.99]"
            >
              ACQUISTA
            </Link>
          )}

          <Link
            href="/appuntamenti"
            className="mt-3 flex w-full items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#083B4C,#1D6E7A)] px-5 py-4 text-sm font-black text-white shadow-lg"
          >
            Prenota prova montatura
          </Link>

          <Link
            href="/catalogo"
            className="mt-3 flex w-full items-center justify-center rounded-2xl border border-[#BFD9DD] bg-white px-5 py-4 text-sm font-black text-[#1D6E7A]"
          >
            Torna al catalogo
          </Link>
        </div>
      </section>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#DCE6E6] bg-white/95 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 shadow-[0_-8px_30px_rgba(16,42,46,0.08)] backdrop-blur-xl">
        <div className="mx-auto grid max-w-md grid-cols-5 text-center">
          <Link href="/" className="px-2 py-2 text-[10px] font-bold text-[#789095]">
            Home
          </Link>
          <Link href="/catalogo" className="px-2 py-2 text-[10px] font-black text-[#0C252B]">
            Catalogo
          </Link>
          <Link href="/appuntamenti" className="px-2 py-2 text-[10px] font-bold text-[#789095]">
            Prenota
          </Link>
          <Link href="/promozioni" className="px-2 py-2 text-[10px] font-bold text-[#789095]">
            Promo
          </Link>
          <Link href="/profilo" className="px-2 py-2 text-[10px] font-bold text-[#789095]">
            Profilo
          </Link>
        </div>
      </nav>
    </main>
  );
}
