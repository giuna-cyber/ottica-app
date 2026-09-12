"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Riepilogo = {
  venduto: number;
  incassato: number;
  ordini: number;
  ordiniPagati: number;
  articoliVenduti: number;
  valoreMedio: number;
  sconti: number;
  spedizioni: number;
};

type Mese = {
  mese: string;
  etichetta: string;
  totale: number;
  ordini: number;
};

type Prodotto = {
  articolo_id: number;
  nome_articolo: string;
  marca: string | null;
  modello: string | null;
  quantita: number;
  totale: number;
};

type Categoria = {
  categoria: string;
  quantita: number;
  totale: number;
};

type Cliente = {
  cliente: string;
  email: string;
  ordini: number;
  totale: number;
};

type Stato = {
  stato: string;
  numero: number;
  totale: number;
};

type UltimoOrdine = {
  id: number;
  numero_ordine: string;
  cliente: string;
  totale: number;
  stato_ordine: string;
  stato_pagamento: string;
  creato_il: string;
};

type DatiStatistiche = {
  riepilogo: Riepilogo;
  mensile: Mese[];
  prodotti: Prodotto[];
  categorie: Categoria[];
  clienti: Cliente[];
  stati: Stato[];
  ultimiOrdini: UltimoOrdine[];
};

function euro(valore: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(Number(valore || 0));
}

function numero(valore: number) {
  return new Intl.NumberFormat("it-IT").format(Number(valore || 0));
}

function dataIT(valore: string) {
  const data = new Date(valore.replace(" ", "T"));
  if (Number.isNaN(data.getTime())) return valore;

  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(data);
}

function oggiISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function inizioAnnoISO() {
  return `${new Date().getFullYear()}-01-01`;
}

function IconaGrafico() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M4 19.5V13h4v6.5M10 19.5V8h4v11.5M16 19.5V4.5h4v15" />
      <path d="M3 19.5h18" />
    </svg>
  );
}

export default function StatisticheVenditePage() {
  const router = useRouter();

  const [dal, setDal] = useState(inizioAnnoISO());
  const [al, setAl] = useState(oggiISO());
  const [dati, setDati] = useState<DatiStatistiche | null>(null);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState("");

  async function carica(dalScelto = dal, alScelto = al) {
    setCaricamento(true);
    setErrore("");

    try {
      const params = new URLSearchParams({
        dal: dalScelto,
        al: alScelto,
      });

      const risposta = await fetch(`/api/admin/statistiche?${params.toString()}`, {
        cache: "no-store",
      });

      if (risposta.status === 401) {
        router.replace("/login");
        return;
      }

      const payload = await risposta.json();

      if (!risposta.ok || !payload.ok) {
        throw new Error(payload.errore || "Impossibile caricare le statistiche.");
      }

      setDati(payload.dati);
    } catch (e) {
      setErrore(
        e instanceof Error ? e.message : "Impossibile caricare le statistiche."
      );
    } finally {
      setCaricamento(false);
    }
  }

  useEffect(() => {
    carica(inizioAnnoISO(), oggiISO());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const massimoMensile = useMemo(() => {
    if (!dati?.mensile?.length) return 1;
    return Math.max(...dati.mensile.map((m) => Number(m.totale || 0)), 1);
  }, [dati]);

  function periodo(chiave: "mese" | "anno" | "tutto") {
    const oggi = new Date();
    let nuovoDal = "";

    if (chiave === "mese") {
      nuovoDal = `${oggi.getFullYear()}-${String(oggi.getMonth() + 1).padStart(2, "0")}-01`;
    } else if (chiave === "anno") {
      nuovoDal = `${oggi.getFullYear()}-01-01`;
    } else {
      nuovoDal = "2000-01-01";
    }

    const nuovoAl = oggiISO();
    setDal(nuovoDal);
    setAl(nuovoAl);
    carica(nuovoDal, nuovoAl);
  }

  return (
    <main className="min-h-screen bg-[var(--app-background)] pb-12 text-[var(--app-text)]">
      <header className="border-b border-[var(--app-border)] bg-[var(--app-surface)]">
        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-9">
          <Link
            href="/admin"
            className="text-xs font-semibold text-[var(--app-primary)]"
          >
            ← Dashboard
          </Link>

          <div className="mt-5 flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--app-surface-soft)] text-[var(--app-primary)]">
              <IconaGrafico />
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.23em] text-[var(--app-primary)]">
                Vendite tramite app
              </p>
              <h1 className="mt-1 font-serif text-3xl font-medium tracking-[-0.035em] sm:text-4xl">
                Statistiche
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--app-muted)]">
                Analizza ordini, incassi, prodotti e clienti generati dallo shop dell’app.
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="rounded-[22px] border border-[var(--app-border)] bg-[var(--app-surface)] p-4">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => periodo("mese")}
              className="rounded-full border border-[var(--app-border)] bg-[var(--app-background)] px-4 py-2 text-xs font-semibold text-[var(--app-text-soft)]"
            >
              Questo mese
            </button>
            <button
              type="button"
              onClick={() => periodo("anno")}
              className="rounded-full border border-[var(--app-border)] bg-[var(--app-background)] px-4 py-2 text-xs font-semibold text-[var(--app-text-soft)]"
            >
              Quest’anno
            </button>
            <button
              type="button"
              onClick={() => periodo("tutto")}
              className="rounded-full border border-[var(--app-border)] bg-[var(--app-background)] px-4 py-2 text-xs font-semibold text-[var(--app-text-soft)]"
            >
              Tutto
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <label className="text-xs font-semibold text-[var(--app-text-soft)]">
              Dal
              <input
                type="date"
                value={dal}
                onChange={(e) => setDal(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-background)] px-3 py-2.5 text-sm text-[var(--app-text)] outline-none"
              />
            </label>

            <label className="text-xs font-semibold text-[var(--app-text-soft)]">
              Al
              <input
                type="date"
                value={al}
                onChange={(e) => setAl(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-background)] px-3 py-2.5 text-sm text-[var(--app-text)] outline-none"
              />
            </label>

            <button
              type="button"
              onClick={() => carica()}
              className="self-end rounded-xl bg-[var(--app-primary)] px-5 py-3 text-sm font-semibold text-white"
            >
              Aggiorna
            </button>
          </div>
        </div>

        {errore && (
          <div className="mt-5 rounded-2xl border border-[color-mix(in_srgb,var(--app-danger)_30%,white)] bg-[color-mix(in_srgb,var(--app-danger)_10%,white)] p-4 text-sm font-semibold text-[var(--app-danger)]">
            {errore}
          </div>
        )}

        {caricamento ? (
          <div className="mt-5 rounded-[22px] border border-[var(--app-border)] bg-[var(--app-surface)] p-10 text-center text-sm font-medium text-[var(--app-muted)]">
            Caricamento statistiche...
          </div>
        ) : dati ? (
          <>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Kpi titolo="Venduto" valore={euro(dati.riepilogo.venduto)} descrizione="Ordini non annullati" />
              <Kpi titolo="Incassato" valore={euro(dati.riepilogo.incassato)} descrizione={`${numero(dati.riepilogo.ordiniPagati)} ordini pagati`} />
              <Kpi titolo="Ordini" valore={numero(dati.riepilogo.ordini)} descrizione={`Media ${euro(dati.riepilogo.valoreMedio)}`} />
              <Kpi titolo="Articoli venduti" valore={numero(dati.riepilogo.articoliVenduti)} descrizione={`Sconti ${euro(dati.riepilogo.sconti)}`} />
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
              <section className="rounded-[22px] border border-[var(--app-border)] bg-[var(--app-surface)] p-5">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--app-primary)]">
                      Andamento
                    </p>
                    <h2 className="mt-1 font-serif text-2xl font-medium">
                      Vendite mensili
                    </h2>
                  </div>
                  <p className="text-xs text-[var(--app-muted)]">
                    Totale ordini non annullati
                  </p>
                </div>

                <div className="mt-6 flex min-h-[240px] items-end gap-2 overflow-x-auto pb-2">
                  {dati.mensile.length === 0 ? (
                    <p className="self-center text-sm text-[var(--app-muted)]">
                      Nessuna vendita nel periodo.
                    </p>
                  ) : (
                    dati.mensile.map((mese) => {
                      const altezza = Math.max(
                        10,
                        Math.round((mese.totale / massimoMensile) * 180)
                      );

                      return (
                        <div
                          key={mese.mese}
                          className="flex min-w-[62px] flex-1 flex-col items-center justify-end"
                        >
                          <span className="mb-2 text-[10px] font-semibold text-[var(--app-text-soft)]">
                            {euro(mese.totale)}
                          </span>
                          <div
                            className="w-full max-w-[48px] rounded-t-xl bg-[var(--app-primary)]"
                            style={{ height: altezza }}
                            title={`${mese.etichetta}: ${euro(mese.totale)}`}
                          />
                          <span className="mt-2 text-[10px] text-[var(--app-muted)]">
                            {mese.etichetta}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>

              <section className="rounded-[22px] border border-[var(--app-border)] bg-[var(--app-surface)] p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--app-primary)]">
                  Stato ordini
                </p>
                <h2 className="mt-1 font-serif text-2xl font-medium">
                  Distribuzione
                </h2>

                <div className="mt-5 space-y-3">
                  {dati.stati.map((stato) => (
                    <div key={stato.stato} className="rounded-xl bg-[var(--app-surface-soft)] p-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold">{stato.stato}</span>
                        <span className="text-sm font-semibold text-[var(--app-primary)]">
                          {numero(stato.numero)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[var(--app-muted)]">
                        {euro(stato.totale)}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <TabellaProdotti prodotti={dati.prodotti} />
              <TabellaCategorie categorie={dati.categorie} />
              <TabellaClienti clienti={dati.clienti} />
              <TabellaUltimiOrdini ordini={dati.ultimiOrdini} />
            </div>
          </>
        ) : null}
      </section>
    </main>
  );
}

function Kpi({
  titolo,
  valore,
  descrizione,
}: {
  titolo: string;
  valore: string;
  descrizione: string;
}) {
  return (
    <div className="rounded-[22px] border border-[var(--app-border)] bg-[var(--app-surface)] p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--app-primary)]">
        {titolo}
      </p>
      <p className="mt-2 font-serif text-3xl font-medium tracking-[-0.03em]">
        {valore}
      </p>
      <p className="mt-2 text-xs text-[var(--app-muted)]">{descrizione}</p>
    </div>
  );
}

function TitoloTabella({ sopra, titolo }: { sopra: string; titolo: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--app-primary)]">
        {sopra}
      </p>
      <h2 className="mt-1 font-serif text-2xl font-medium">{titolo}</h2>
    </div>
  );
}

function TabellaProdotti({ prodotti }: { prodotti: Prodotto[] }) {
  return (
    <section className="rounded-[22px] border border-[var(--app-border)] bg-[var(--app-surface)] p-5">
      <TitoloTabella sopra="Top 10" titolo="Prodotti più venduti" />
      <div className="mt-5 space-y-3">
        {prodotti.length === 0 ? (
          <p className="text-sm text-[var(--app-muted)]">Nessun dato disponibile.</p>
        ) : (
          prodotti.map((p, i) => (
            <div key={`${p.articolo_id}-${i}`} className="flex items-center justify-between gap-4 border-b border-[var(--app-border)] pb-3 last:border-0 last:pb-0">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {i + 1}. {p.nome_articolo}
                </p>
                <p className="mt-1 truncate text-xs text-[var(--app-muted)]">
                  {[p.marca, p.modello].filter(Boolean).join(" · ") || "Prodotto"}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold text-[var(--app-primary)]">
                  {numero(p.quantita)} pz
                </p>
                <p className="text-xs text-[var(--app-muted)]">{euro(p.totale)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function TabellaCategorie({ categorie }: { categorie: Categoria[] }) {
  return (
    <section className="rounded-[22px] border border-[var(--app-border)] bg-[var(--app-surface)] p-5">
      <TitoloTabella sopra="Ripartizione" titolo="Categorie" />
      <div className="mt-5 space-y-3">
        {categorie.length === 0 ? (
          <p className="text-sm text-[var(--app-muted)]">Nessun dato disponibile.</p>
        ) : (
          categorie.map((c) => (
            <div key={c.categoria} className="flex items-center justify-between gap-4 border-b border-[var(--app-border)] pb-3 last:border-0 last:pb-0">
              <div>
                <p className="text-sm font-semibold">{c.categoria}</p>
                <p className="mt-1 text-xs text-[var(--app-muted)]">
                  {numero(c.quantita)} articoli
                </p>
              </div>
              <p className="text-sm font-semibold text-[var(--app-primary)]">
                {euro(c.totale)}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function TabellaClienti({ clienti }: { clienti: Cliente[] }) {
  return (
    <section className="rounded-[22px] border border-[var(--app-border)] bg-[var(--app-surface)] p-5">
      <TitoloTabella sopra="Top clienti" titolo="Clienti per venduto" />
      <div className="mt-5 space-y-3">
        {clienti.length === 0 ? (
          <p className="text-sm text-[var(--app-muted)]">Nessun dato disponibile.</p>
        ) : (
          clienti.map((c, i) => (
            <div key={`${c.email}-${i}`} className="flex items-center justify-between gap-4 border-b border-[var(--app-border)] pb-3 last:border-0 last:pb-0">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {i + 1}. {c.cliente}
                </p>
                <p className="mt-1 truncate text-xs text-[var(--app-muted)]">
                  {c.email} · {numero(c.ordini)} ordini
                </p>
              </div>
              <p className="shrink-0 text-sm font-semibold text-[var(--app-primary)]">
                {euro(c.totale)}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function TabellaUltimiOrdini({ ordini }: { ordini: UltimoOrdine[] }) {
  return (
    <section className="rounded-[22px] border border-[var(--app-border)] bg-[var(--app-surface)] p-5">
      <TitoloTabella sopra="Dettaglio" titolo="Ultimi ordini" />
      <div className="mt-5 space-y-3">
        {ordini.length === 0 ? (
          <p className="text-sm text-[var(--app-muted)]">Nessun ordine disponibile.</p>
        ) : (
          ordini.map((o) => (
            <div key={o.id} className="border-b border-[var(--app-border)] pb-3 last:border-0 last:pb-0">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-semibold">{o.numero_ordine}</p>
                <p className="text-sm font-semibold text-[var(--app-primary)]">
                  {euro(o.totale)}
                </p>
              </div>
              <p className="mt-1 text-xs text-[var(--app-muted)]">
                {o.cliente} · {dataIT(o.creato_il)}
              </p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--app-text-soft)]">
                {o.stato_ordine} · {o.stato_pagamento}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
