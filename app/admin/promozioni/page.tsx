"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Prodotto = {
  id: number;
  nome: string;
};

type Promo = {
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
};

export default function AdminPromozioniPage() {
  const router = useRouter();

  const [promozioni, setPromozioni] = useState<Promo[]>([]);
  const [prodotti, setProdotti] = useState<Prodotto[]>([]);
  const [id, setId] = useState(0);
  const [titolo, setTitolo] = useState("");
  const [descrizione, setDescrizione] = useState("");
  const [immagineUrl, setImmagineUrl] = useState("");
  const [sconto, setSconto] = useState("");
  const [articoloId, setArticoloId] = useState("");
  const [dataInizio, setDataInizio] = useState("");
  const [dataFine, setDataFine] = useState("");
  const [attiva, setAttiva] = useState(true);
  const [errore, setErrore] = useState("");
  const [messaggio, setMessaggio] = useState("");

  useEffect(() => {
    if (!sessionStorage.getItem("ottica_admin")) {
      router.replace("/login");
      return;
    }

    caricaPromozioni();
    caricaProdotti();
  }, [router]);

  async function caricaPromozioni() {
    const r = await fetch("/api/admin/promozioni", {
      cache: "no-store",
    });
    const d = await r.json();

    if (d.ok) {
      setPromozioni(d.promozioni ?? []);
    } else {
      setErrore(d.errore || "Errore caricamento promozioni.");
    }
  }

  async function caricaProdotti() {
    const r = await fetch("/api/catalogo", {
      cache: "no-store",
    });
    const d = await r.json();

    if (d.ok) {
      setProdotti(
        (d.articoli ?? []).map((p: any) => ({
          id: p.id,
          nome: p.nome,
        }))
      );
    }
  }

  function nuova() {
    setId(0);
    setTitolo("");
    setDescrizione("");
    setImmagineUrl("");
    setSconto("");
    setArticoloId("");
    setDataInizio("");
    setDataFine("");
    setAttiva(true);
    setErrore("");
    setMessaggio("");
  }

  function modifica(p: Promo) {
    setId(p.id);
    setTitolo(p.titolo);
    setDescrizione(p.descrizione ?? "");
    setImmagineUrl(p.immagine_url ?? "");
    setSconto(
      p.sconto_percentuale !== null
        ? String(p.sconto_percentuale)
        : ""
    );
    setArticoloId(
      p.articolo_id !== null ? String(p.articolo_id) : ""
    );
    setDataInizio(p.data_inizio ?? "");
    setDataFine(p.data_fine ?? "");
    setAttiva(p.attiva === 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function azione(corpo: Record<string, unknown>) {
    setErrore("");
    setMessaggio("");

    const r = await fetch("/api/admin/promozioni", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(corpo),
    });

    const d = await r.json();

    if (!r.ok || !d.ok) {
      setErrore(d.errore || "Operazione non riuscita.");
      return false;
    }

    setMessaggio(d.messaggio || "Operazione completata.");
    await caricaPromozioni();
    return true;
  }

  async function salva() {
    const ok = await azione({
      azione: "salva",
      id,
      titolo,
      descrizione,
      immagine_url: immagineUrl,
      sconto_percentuale: sconto,
      articolo_id: articoloId,
      data_inizio: dataInizio,
      data_fine: dataFine,
      attiva: attiva ? 1 : 0,
    });

    if (ok) nuova();
  }

  return (
    <main className="min-h-screen bg-[#F6F4EF] pb-10 text-[#20383B]">
      <header className="border-b border-[#D9E2DF] bg-[#FBFAF7]">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-7 sm:flex-row sm:items-end sm:justify-between sm:px-6 sm:py-9">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#89A39D]">
              Area amministrativa
            </p>
            <h1 className="mt-2 font-serif text-4xl font-medium tracking-[-0.04em] text-[#20383B] sm:text-5xl">
              Promozioni
            </h1>
            <p className="mt-2 text-sm text-[#7E8F8B]">
              Crea offerte, associa prodotti e gestisci periodi promozionali.
            </p>
          </div>

          <Link
            href="/admin"
            className="w-fit rounded-full border border-[#D4DFDB] bg-white px-4 py-2 text-[11px] font-semibold text-[#738682] transition hover:bg-[#F3F5F2]"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-6">
        {errore && (
          <div className="mb-4 rounded-2xl border border-[#E9D1CD] bg-[#F8ECE9] p-4 text-sm font-semibold text-[#9A615A]">
            {errore}
          </div>
        )}

        {messaggio && (
          <div className="mb-4 rounded-2xl border border-[#CFE0D8] bg-[#EDF5F0] p-4 text-sm font-semibold text-[#55766D]">
            {messaggio}
          </div>
        )}

        <div className="rounded-[24px] border border-[#D9E2DF] bg-[#FBFAF7] p-5 shadow-[0_12px_30px_rgba(80,108,105,.05)]">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-serif text-2xl font-medium tracking-[-0.025em]">
              {id > 0 ? "Modifica promozione" : "Nuova promozione"}
            </h2>

            {id > 0 && (
              <button
                type="button"
                onClick={nuova}
                className="rounded-full border border-[#8FB8B2] bg-white px-4 py-2 text-xs font-semibold text-[#6F918B] transition hover:bg-[#EDF3F0]"
              >
                Nuova
              </button>
            )}
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-[#20383B]">
                Titolo *
              </span>
              <input
                value={titolo}
                onChange={(e) => setTitolo(e.target.value)}
                className="w-full rounded-xl border border-[#D4DFDB] bg-white px-4 py-3 text-[#20383B] outline-none transition focus:border-[#8FB8B2]"
              />
            </label>

            <label className="sm:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-[#20383B]">
                Descrizione
              </span>
              <textarea
                rows={4}
                value={descrizione}
                onChange={(e) => setDescrizione(e.target.value)}
                className="w-full rounded-xl border border-[#D4DFDB] bg-white px-4 py-3 text-[#20383B] outline-none transition focus:border-[#8FB8B2]"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-semibold text-[#20383B]">
                Sconto %
              </span>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={sconto}
                onChange={(e) => setSconto(e.target.value)}
                className="w-full rounded-xl border border-[#D4DFDB] bg-white px-4 py-3 text-[#20383B] outline-none transition focus:border-[#8FB8B2]"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-semibold text-[#20383B]">
                Prodotto collegato
              </span>
              <select
                value={articoloId}
                onChange={(e) => setArticoloId(e.target.value)}
                className="w-full rounded-xl border border-[#D4DFDB] bg-white px-4 py-3 text-[#20383B] outline-none transition focus:border-[#8FB8B2]"
              >
                <option value="">Nessun prodotto specifico</option>
                {prodotti.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </label>

            <label className="sm:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-[#20383B]">
                Immagine URL
              </span>
              <input
                value={immagineUrl}
                onChange={(e) => setImmagineUrl(e.target.value)}
                placeholder="/images/promo-1.png"
                className="w-full rounded-xl border border-[#D4DFDB] bg-white px-4 py-3 text-[#20383B] outline-none transition focus:border-[#8FB8B2]"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-semibold text-[#20383B]">
                Data inizio
              </span>
              <input
                type="date"
                value={dataInizio}
                onChange={(e) => setDataInizio(e.target.value)}
                className="w-full rounded-xl border border-[#D4DFDB] bg-white px-4 py-3 text-[#20383B] outline-none transition focus:border-[#8FB8B2]"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-semibold text-[#20383B]">
                Data fine
              </span>
              <input
                type="date"
                value={dataFine}
                onChange={(e) => setDataFine(e.target.value)}
                className="w-full rounded-xl border border-[#D4DFDB] bg-white px-4 py-3 text-[#20383B] outline-none transition focus:border-[#8FB8B2]"
              />
            </label>

            <label className="sm:col-span-2 flex items-center gap-3 rounded-xl border border-[#D9E2DF] bg-[#F3F5F2] p-4">
              <input
                type="checkbox"
                checked={attiva}
                onChange={(e) => setAttiva(e.target.checked)}
              />
              <span className="font-semibold">
                Promozione attiva
              </span>
            </label>
          </div>

          <button
            type="button"
            onClick={salva}
            className="mt-5 w-full rounded-xl bg-[#7FA39A] px-5 py-4 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(80,108,105,.12)] transition hover:bg-[#6F918B]"
          >
            Salva promozione
          </button>
        </div>

        <div className="mt-6 grid gap-3">
          {promozioni.map((p) => (
            <article
              key={p.id}
              className="rounded-[20px] border border-[#D9E2DF] bg-[#FBFAF7] p-4 shadow-[0_10px_24px_rgba(80,108,105,.05)]"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-serif text-lg font-medium text-[#20383B]">
                      {p.titolo}
                    </h3>

                    <span
                      className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
                        p.attiva === 1
                          ? "border-[#CFE0D8] bg-[#EDF5F0] text-[#55766D]"
                          : "border-[#E9D1CD] bg-[#F8ECE9] text-[#9A615A]"
                      }`}
                    >
                      {p.attiva === 1 ? "Attiva" : "Disattivata"}
                    </span>
                  </div>

                  {p.articolo_nome && (
                    <p className="mt-1 text-sm font-semibold text-[#6F918B]">
                      {p.articolo_nome}
                    </p>
                  )}

                  {p.sconto_percentuale !== null && (
                    <p className="mt-1 text-sm text-[#738682]">
                      Sconto: {p.sconto_percentuale}%
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => modifica(p)}
                    className="rounded-full border border-[#8FB8B2] bg-white px-4 py-2 text-xs font-semibold text-[#6F918B] transition hover:bg-[#EDF3F0]"
                  >
                    Modifica
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      azione({
                        azione: "attiva",
                        id: p.id,
                        attiva: p.attiva === 1 ? 0 : 1,
                      })
                    }
                    className="rounded-xl border border-[#E1D6B8] bg-[#F6EEDB] px-4 py-2 text-xs font-semibold text-[#8A6E35]"
                  >
                    {p.attiva === 1 ? "Disattiva" : "Riattiva"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Eliminare questa promozione?")) {
                        azione({
                          azione: "elimina",
                          id: p.id,
                        });
                      }
                    }}
                    className="rounded-xl border border-[#E7C9C5] bg-[#F6E7E4] px-4 py-2 text-xs font-semibold text-[#9A615A]"
                  >
                    Elimina
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
