"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type RigaOrdine = {
  id: number;
  articolo_id: number;
  variante_id: number | null;
  promozione_id: number | null;
  nome_articolo: string;
  marca: string | null;
  modello: string | null;
  descrizione_variante: string | null;
  quantita: number;
  prezzo_unitario: number;
  sconto_percentuale: number;
  prezzo_unitario_finale: number;
  totale_riga: number;
};

type Ordine = {
  id: number;
  cliente_id: number | null;
  numero_ordine: string;
  nome: string;
  cognome: string;
  email: string;
  telefono: string | null;
  modalita_consegna: "Ritiro in negozio" | "Spedizione";
  indirizzo: string | null;
  civico: string | null;
  cap: string | null;
  citta: string | null;
  provincia: string | null;
  metodo_pagamento: "In negozio" | "Online";
  stato_pagamento: "Da pagare" | "Pagato" | "Rimborsato";
  stato_ordine:
    | "Ricevuto"
    | "In lavorazione"
    | "Pronto per il ritiro"
    | "Spedito"
    | "Completato"
    | "Annullato";
  subtotale: number;
  sconto_totale: number;
  spese_spedizione: number;
  totale: number;
  note: string | null;
  creato_il: string;
  aggiornato_il: string;
  righe: RigaOrdine[];
};

function euro(valore: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(valore);
}

function dataOra(valore: string) {
  const data = new Date(valore.replace(" ", "T"));

  if (Number.isNaN(data.getTime())) {
    return valore;
  }

  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(data);
}

export default function AdminOrdiniShopPage() {
  const router = useRouter();

  const [ordini, setOrdini] = useState<Ordine[]>([]);
  const [ricerca, setRicerca] = useState("");
  const [filtroStato, setFiltroStato] = useState("Tutti");
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState("");
  const [messaggio, setMessaggio] = useState("");
  const [ordineAperto, setOrdineAperto] = useState<number | null>(null);

  useEffect(() => {
    caricaOrdini();
  }, []);

  async function caricaOrdini() {
    setCaricamento(true);
    setErrore("");

    try {
      const risposta = await fetch("/api/admin/ordini-shop", {
        cache: "no-store",
      });

      if (risposta.status === 401) {
        router.replace("/login");
        return;
      }

      const dati = await risposta.json();

      if (!risposta.ok || !dati.ok) {
        throw new Error(
          dati.errore || "Impossibile caricare gli ordini."
        );
      }

      setOrdini(dati.ordini ?? []);
    } catch (e) {
      setErrore(
        e instanceof Error
          ? e.message
          : "Impossibile caricare gli ordini."
      );
    } finally {
      setCaricamento(false);
    }
  }

  async function aggiorna(
    corpo: Record<string, unknown>,
    successo: string
  ) {
    setErrore("");
    setMessaggio("");

    try {
      const risposta = await fetch("/api/admin/ordini-shop", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(corpo),
      });

      if (risposta.status === 401) {
        router.replace("/login");
        return;
      }

      const dati = await risposta.json();

      if (!risposta.ok || !dati.ok) {
        throw new Error(
          dati.errore || "Aggiornamento non riuscito."
        );
      }

      setMessaggio(successo);
      await caricaOrdini();
    } catch (e) {
      setErrore(
        e instanceof Error
          ? e.message
          : "Aggiornamento non riuscito."
      );
    }
  }

  const filtrati = useMemo(() => {
    const testo = ricerca.trim().toLowerCase();

    return ordini.filter((ordine) => {
      const matchRicerca =
        !testo ||
        [
          ordine.numero_ordine,
          ordine.nome,
          ordine.cognome,
          ordine.email,
          ordine.telefono ?? "",
        ].some((v) =>
          v.toLowerCase().includes(testo)
        );

      const matchStato =
        filtroStato === "Tutti" ||
        ordine.stato_ordine === filtroStato;

      return matchRicerca && matchStato;
    });
  }, [ordini, ricerca, filtroStato]);

  return (
    <main className="min-h-screen bg-[#F5F9F9] pb-10 text-[#102A2E]">
      <header className="bg-[linear-gradient(135deg,#083B4C,#1D6E7A)] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#CBEDEF]">
              Area amministrativa
            </p>
            <h1 className="mt-1 text-3xl font-black">
              Ordini Shop
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

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
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

        <div className="grid gap-3 rounded-3xl border border-[#DCE8E9] bg-white p-4 shadow-sm sm:grid-cols-2">
          <input
            type="search"
            value={ricerca}
            onChange={(e) => setRicerca(e.target.value)}
            placeholder="Cerca ordine, cliente, email..."
            className="rounded-xl border border-[#C9DADC] px-4 py-3 text-sm"
          />

          <select
            value={filtroStato}
            onChange={(e) => setFiltroStato(e.target.value)}
            className="rounded-xl border border-[#C9DADC] bg-white px-4 py-3 text-sm"
          >
            <option value="Tutti">Tutti gli stati</option>
            <option value="Ricevuto">Ricevuto</option>
            <option value="In lavorazione">In lavorazione</option>
            <option value="Pronto per il ritiro">Pronto per il ritiro</option>
            <option value="Spedito">Spedito</option>
            <option value="Completato">Completato</option>
            <option value="Annullato">Annullato</option>
          </select>
        </div>

        {caricamento ? (
          <div className="mt-5 rounded-3xl border border-[#DCE8E9] bg-white p-8 text-center font-black text-[#6D8287]">
            Caricamento ordini...
          </div>
        ) : filtrati.length === 0 ? (
          <div className="mt-5 rounded-3xl border border-[#DCE8E9] bg-white p-8 text-center font-black text-[#6D8287]">
            Nessun ordine trovato.
          </div>
        ) : (
          <div className="mt-5 grid gap-4">
            {filtrati.map((ordine) => {
              const aperto = ordineAperto === ordine.id;

              return (
                <article
                  key={ordine.id}
                  className="overflow-hidden rounded-3xl border border-[#DCE8E9] bg-white shadow-sm"
                >
                  <div className="grid gap-4 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#083B4C] px-3 py-1 text-[10px] font-black text-white">
                          {ordine.numero_ordine}
                        </span>

                        <span className="rounded-full bg-[#EAF4F5] px-3 py-1 text-[10px] font-black text-[#1D6E7A]">
                          {ordine.stato_ordine}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-[10px] font-black ${
                            ordine.stato_pagamento === "Pagato"
                              ? "bg-emerald-50 text-emerald-700"
                              : ordine.stato_pagamento === "Rimborsato"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {ordine.stato_pagamento}
                        </span>
                      </div>

                      <h2 className="mt-3 text-xl font-black">
                        {ordine.nome} {ordine.cognome}
                      </h2>

                      <p className="mt-1 text-sm text-[#6D8287]">
                        {ordine.email}
                        {ordine.telefono ? ` · ${ordine.telefono}` : ""}
                      </p>

                      <p className="mt-2 text-xs font-bold text-[#789095]">
                        {dataOra(ordine.creato_il)} · {ordine.modalita_consegna}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-4 lg:block lg:text-right">
                      <div>
                        {ordine.sconto_totale > 0 && (
                          <p className="text-xs font-black text-red-600">
                            Sconto {euro(ordine.sconto_totale)}
                          </p>
                        )}

                        <p className="text-2xl font-black text-[#083B4C]">
                          {euro(ordine.totale)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setOrdineAperto(aperto ? null : ordine.id)
                        }
                        className="rounded-xl border border-[#1D6E7A] px-4 py-2 text-xs font-black text-[#1D6E7A]"
                      >
                        {aperto ? "Chiudi" : "Dettagli"}
                      </button>
                    </div>
                  </div>

                  {aperto && (
                    <div className="border-t border-[#E4EEEE] bg-[#F8FBFB] p-5">
                      <div className="grid gap-4 lg:grid-cols-2">
                        <div className="rounded-2xl border border-[#DCE8E9] bg-white p-4">
                          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#789095]">
                            Prodotti
                          </p>

                          <div className="mt-3 grid gap-3">
                            {(ordine.righe ?? []).map((riga) => (
                              <div
                                key={riga.id}
                                className="rounded-xl border border-[#E4EEEE] p-3"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="font-black">
                                      {riga.nome_articolo}
                                    </p>

                                    <p className="mt-1 text-xs text-[#6D8287]">
                                      {[riga.marca, riga.modello]
                                        .filter(Boolean)
                                        .join(" · ")}
                                    </p>

                                    {riga.descrizione_variante && (
                                      <p className="mt-1 text-xs font-bold text-[#4E7F86]">
                                        {riga.descrizione_variante}
                                      </p>
                                    )}
                                  </div>

                                  <p className="font-black">
                                    {riga.quantita} ×{" "}
                                    {euro(riga.prezzo_unitario_finale)}
                                  </p>
                                </div>

                                {riga.sconto_percentuale > 0 && (
                                  <p className="mt-2 text-xs font-black text-red-600">
                                    Promo -{riga.sconto_percentuale}%
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-2xl border border-[#DCE8E9] bg-white p-4">
                          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#789095]">
                            Consegna e note
                          </p>

                          <p className="mt-3 font-black">
                            {ordine.modalita_consegna}
                          </p>

                          {ordine.modalita_consegna === "Spedizione" && (
                            <p className="mt-2 text-sm leading-6 text-[#60777C]">
                              {ordine.indirizzo} {ordine.civico}
                              <br />
                              {ordine.cap} {ordine.citta} ({ordine.provincia})
                            </p>
                          )}

                          {ordine.note && (
                            <div className="mt-4 rounded-xl bg-[#F5F9F9] p-3 text-sm text-[#60777C]">
                              <strong>Note:</strong> {ordine.note}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <label className="rounded-2xl border border-[#DCE8E9] bg-white p-4">
                          <span className="mb-2 block text-sm font-black">
                            Stato ordine
                          </span>

                          <select
                            value={ordine.stato_ordine}
                            onChange={(e) =>
                              aggiorna(
                                {
                                  azione: "stato_ordine",
                                  id: ordine.id,
                                  stato_ordine: e.target.value,
                                },
                                "Stato ordine aggiornato."
                              )
                            }
                            className="w-full rounded-xl border border-[#C9DADC] bg-white px-4 py-3"
                          >
                            <option value="Ricevuto">Ricevuto</option>
                            <option value="In lavorazione">In lavorazione</option>
                            <option value="Pronto per il ritiro">
                              Pronto per il ritiro
                            </option>
                            <option value="Spedito">Spedito</option>
                            <option value="Completato">Completato</option>
                            <option value="Annullato">Annullato</option>
                          </select>
                        </label>

                        <label className="rounded-2xl border border-[#DCE8E9] bg-white p-4">
                          <span className="mb-2 block text-sm font-black">
                            Stato pagamento
                          </span>

                          <select
                            value={ordine.stato_pagamento}
                            onChange={(e) =>
                              aggiorna(
                                {
                                  azione: "stato_pagamento",
                                  id: ordine.id,
                                  stato_pagamento: e.target.value,
                                },
                                "Stato pagamento aggiornato."
                              )
                            }
                            className="w-full rounded-xl border border-[#C9DADC] bg-white px-4 py-3"
                          >
                            <option value="Da pagare">Da pagare</option>
                            <option value="Pagato">Pagato</option>
                            <option value="Rimborsato">Rimborsato</option>
                          </select>
                        </label>
                      </div>

                      <div className="mt-4 rounded-2xl bg-[#083B4C] p-4 text-white">
                        <div className="flex items-center justify-between text-sm">
                          <span>Subtotale</span>
                          <span className="font-black">
                            {euro(ordine.subtotale)}
                          </span>
                        </div>

                        {ordine.sconto_totale > 0 && (
                          <div className="mt-2 flex items-center justify-between text-sm text-[#FFD8DD]">
                            <span>Sconto</span>
                            <span className="font-black">
                              - {euro(ordine.sconto_totale)}
                            </span>
                          </div>
                        )}

                        <div className="mt-3 flex items-end justify-between border-t border-white/15 pt-3">
                          <span className="font-black">Totale</span>
                          <span className="text-2xl font-black">
                            {euro(ordine.totale)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
