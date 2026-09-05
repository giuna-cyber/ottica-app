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
    <main className="min-h-screen bg-[#F5F9F9] pb-10 text-[#102A2E]">
      <header className="bg-[linear-gradient(135deg,#083B4C,#1D6E7A)] text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#CBEDEF]">
              Area amministrativa
            </p>
            <h1 className="mt-1 text-3xl font-black">
              Promozioni
            </h1>
          </div>

          <Link
            href="/admin"
            className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-black"
          >
            Dashboard
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-6">
        {errore && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-black text-red-700">
            {errore}
          </div>
        )}

        {messaggio && (
          <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-black text-emerald-700">
            {messaggio}
          </div>
        )}

        <div className="rounded-3xl border border-[#DCE8E9] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-black">
              {id > 0 ? "Modifica promozione" : "Nuova promozione"}
            </h2>

            {id > 0 && (
              <button
                type="button"
                onClick={nuova}
                className="rounded-xl border border-[#1D6E7A] px-4 py-2 text-xs font-black text-[#1D6E7A]"
              >
                Nuova
              </button>
            )}
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="mb-2 block text-sm font-black">
                Titolo *
              </span>
              <input
                value={titolo}
                onChange={(e) => setTitolo(e.target.value)}
                className="w-full rounded-xl border border-[#C9DADC] px-4 py-3"
              />
            </label>

            <label className="sm:col-span-2">
              <span className="mb-2 block text-sm font-black">
                Descrizione
              </span>
              <textarea
                rows={4}
                value={descrizione}
                onChange={(e) => setDescrizione(e.target.value)}
                className="w-full rounded-xl border border-[#C9DADC] px-4 py-3"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-black">
                Sconto %
              </span>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={sconto}
                onChange={(e) => setSconto(e.target.value)}
                className="w-full rounded-xl border border-[#C9DADC] px-4 py-3"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-black">
                Prodotto collegato
              </span>
              <select
                value={articoloId}
                onChange={(e) => setArticoloId(e.target.value)}
                className="w-full rounded-xl border border-[#C9DADC] px-4 py-3"
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
              <span className="mb-2 block text-sm font-black">
                Immagine URL
              </span>
              <input
                value={immagineUrl}
                onChange={(e) => setImmagineUrl(e.target.value)}
                placeholder="/images/promo-1.png"
                className="w-full rounded-xl border border-[#C9DADC] px-4 py-3"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-black">
                Data inizio
              </span>
              <input
                type="date"
                value={dataInizio}
                onChange={(e) => setDataInizio(e.target.value)}
                className="w-full rounded-xl border border-[#C9DADC] px-4 py-3"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-black">
                Data fine
              </span>
              <input
                type="date"
                value={dataFine}
                onChange={(e) => setDataFine(e.target.value)}
                className="w-full rounded-xl border border-[#C9DADC] px-4 py-3"
              />
            </label>

            <label className="sm:col-span-2 flex items-center gap-3 rounded-xl border border-[#DCE8E9] bg-[#F7FAFA] p-4">
              <input
                type="checkbox"
                checked={attiva}
                onChange={(e) => setAttiva(e.target.checked)}
              />
              <span className="font-black">
                Promozione attiva
              </span>
            </label>
          </div>

          <button
            type="button"
            onClick={salva}
            className="mt-5 w-full rounded-2xl bg-[linear-gradient(135deg,#083B4C,#1D6E7A)] px-5 py-4 text-sm font-black text-white"
          >
            Salva promozione
          </button>
        </div>

        <div className="mt-6 grid gap-3">
          {promozioni.map((p) => (
            <article
              key={p.id}
              className="rounded-2xl border border-[#DCE8E9] bg-white p-4 shadow-sm"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-black">
                      {p.titolo}
                    </h3>

                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-black ${
                        p.attiva === 1
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {p.attiva === 1 ? "Attiva" : "Disattivata"}
                    </span>
                  </div>

                  {p.articolo_nome && (
                    <p className="mt-1 text-sm font-black text-[#1D6E7A]">
                      {p.articolo_nome}
                    </p>
                  )}

                  {p.sconto_percentuale !== null && (
                    <p className="mt-1 text-sm text-[#60777C]">
                      Sconto: {p.sconto_percentuale}%
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => modifica(p)}
                    className="rounded-xl border border-[#1D6E7A] px-4 py-2 text-xs font-black text-[#1D6E7A]"
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
                    className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-black text-white"
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
                    className="rounded-xl bg-red-600 px-4 py-2 text-xs font-black text-white"
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
