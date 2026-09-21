"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Appuntamento = {
  id: number;
  cliente_id: number | null;
  tipo_appuntamento_id: number;
  slot_id: number | null;
  nome_cliente: string;
  telefono: string;
  email: string | null;
  note: string | null;
  data_appuntamento: string;
  ora_inizio: string;
  ora_fine: string | null;
  stato: string;
  creato_il: string | null;
  aggiornato_il: string | null;
  tipo_appuntamento: string;
};

type RispostaElenco = {
  ok: boolean;
  appuntamenti?: Appuntamento[];
  errore?: string;
};

type RispostaNegozio = {
  ok: boolean;
  negozio?: {
    nome_negozio?: string;
  };
  errore?: string;
};

function oggiISO() {
  const oggi = new Date();
  const anno = oggi.getFullYear();
  const mese = String(oggi.getMonth() + 1).padStart(2, "0");
  const giorno = String(oggi.getDate()).padStart(2, "0");
  return `${anno}-${mese}-${giorno}`;
}

function formattaData(data: string) {
  const parti = data.split("-");
  if (parti.length !== 3) return data;
  return `${parti[2]}/${parti[1]}/${parti[0]}`;
}

function formattaOra(ora: string | null) {
  return ora ? ora.slice(0, 5) : "-";
}

function classeStato(stato: string) {
  if (stato === "Confermato") {
    return "border-[color-mix(in_srgb,var(--app-success)_35%,white)] bg-[color-mix(in_srgb,var(--app-success)_12%,white)] text-[var(--app-success)]";
  }

  if (stato === "Annullato") {
    return "border-[color-mix(in_srgb,var(--app-danger)_35%,white)] bg-[color-mix(in_srgb,var(--app-danger)_12%,white)] text-[var(--app-danger)]";
  }

  return "border-[color-mix(in_srgb,var(--app-warning)_35%,white)] bg-[color-mix(in_srgb,var(--app-warning)_12%,white)] text-[var(--app-warning)]";
}

function preparaNumeroWhatsApp(telefono: string) {
  let numero = telefono.replace(/\D/g, "");

  if (numero.startsWith("00")) {
    numero = numero.slice(2);
  }

  if (numero.length === 10 && numero.startsWith("3")) {
    numero = `39${numero}`;
  }

  return numero;
}

function creaUrlWhatsApp(telefono: string, messaggio: string) {
  const numero = preparaNumeroWhatsApp(telefono);
  return `https://wa.me/${numero}?text=${encodeURIComponent(messaggio)}`;
}

function messaggioSingolo(appuntamento: Appuntamento) {
  return [
    `Ciao ${appuntamento.nome_cliente},`,
    "",
    "ti contattiamo in merito al tuo appuntamento:",
    `${appuntamento.tipo_appuntamento}`,
    `${formattaData(appuntamento.data_appuntamento)} alle ${formattaOra(
      appuntamento.ora_inizio
    )}.`,
    "",
    "Grazie.",
  ].join("\n");
}

function IconaWhatsApp({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M16.02 3C8.85 3 3.03 8.77 3.03 15.88c0 2.27.6 4.48 1.73 6.42L3 29l6.9-1.8a13.03 13.03 0 0 0 6.12 1.55h.01c7.16 0 12.99-5.77 12.99-12.87C29.02 8.77 23.19 3 16.02 3Zm0 23.58h-.01a10.82 10.82 0 0 1-5.52-1.5l-.4-.24-4.09 1.07 1.09-3.95-.26-.41a10.63 10.63 0 0 1-1.66-5.67c0-5.9 4.86-10.7 10.85-10.7 5.98 0 10.85 4.8 10.85 10.7 0 5.9-4.87 10.7-10.85 10.7Zm5.95-8.01c-.33-.16-1.94-.95-2.24-1.06-.3-.11-.52-.16-.74.16-.22.32-.85 1.06-1.04 1.27-.19.22-.38.24-.71.08-.33-.16-1.39-.51-2.65-1.62-.98-.86-1.64-1.93-1.83-2.25-.19-.32-.02-.5.14-.66.15-.14.33-.38.49-.57.16-.19.22-.32.33-.54.11-.22.05-.41-.03-.57-.08-.16-.74-1.76-1.01-2.41-.27-.64-.54-.55-.74-.56h-.63c-.22 0-.57.08-.87.41-.3.32-1.15 1.11-1.15 2.71 0 1.6 1.18 3.14 1.34 3.36.16.22 2.32 3.51 5.62 4.92.79.34 1.4.54 1.88.69.79.25 1.5.21 2.07.13.63-.09 1.94-.78 2.21-1.54.27-.76.27-1.41.19-1.54-.08-.14-.3-.22-.63-.38Z" />
    </svg>
  );
}

export default function AdminAppuntamentiPage() {
  const router = useRouter();

  const [appuntamenti, setAppuntamenti] = useState<Appuntamento[]>([]);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState("");
  const [filtro, setFiltro] = useState("Tutti");
  const [ricerca, setRicerca] = useState("");
  const [dataFiltro, setDataFiltro] = useState(oggiISO());
  const [inAggiornamento, setInAggiornamento] = useState<number | null>(null);

  const [selezionati, setSelezionati] = useState<number[]>([]);
  const [messaggioMultiplo, setMessaggioMultiplo] = useState(
    "Gentile cliente, ti informiamo che per un imprevisto dobbiamo modificare l'appuntamento previsto. Ti contatteremo per concordare una nuova disponibilità. Ci scusiamo per il disagio."
  );
  const [mostraInvioMultiplo, setMostraInvioMultiplo] = useState(false);
  const [nomeNegozio, setNomeNegozio] = useState("");

  useEffect(() => {
    const admin = sessionStorage.getItem("ottica_admin");

    if (!admin) {
      router.replace("/login");
      return;
    }

    caricaAppuntamenti();
    caricaNegozio();
  }, [router]);

  async function caricaNegozio() {
    try {
      const risposta = await fetch("/api/admin/negozio", {
        cache: "no-store",
      });

      const dati = (await risposta.json()) as RispostaNegozio;

      if (!risposta.ok || !dati.ok) {
        throw new Error(
          dati.errore || "Impossibile caricare i dati del negozio."
        );
      }

      setNomeNegozio((dati.negozio?.nome_negozio ?? "").trim());
    } catch {
      setNomeNegozio("");
    }
  }

  async function caricaAppuntamenti() {
    setCaricamento(true);
    setErrore("");

    try {
      const risposta = await fetch("/api/admin/appuntamenti", {
        cache: "no-store",
      });

      const dati = (await risposta.json()) as RispostaElenco;

      if (!risposta.ok || !dati.ok) {
        throw new Error(
          dati.errore || "Impossibile caricare gli appuntamenti."
        );
      }

      setAppuntamenti(dati.appuntamenti ?? []);
    } catch (erroreCaricamento) {
      setErrore(
        erroreCaricamento instanceof Error
          ? erroreCaricamento.message
          : "Impossibile caricare gli appuntamenti."
      );
    } finally {
      setCaricamento(false);
    }
  }

  async function cambiaStato(id: number, stato: string) {
    setInAggiornamento(id);
    setErrore("");

    try {
      const risposta = await fetch("/api/admin/appuntamenti/stato", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, stato }),
      });

      const dati = await risposta.json();

      if (!risposta.ok || !dati.ok) {
        throw new Error(
          dati.errore || "Impossibile aggiornare lo stato."
        );
      }

      await caricaAppuntamenti();
    } catch (erroreAggiornamento) {
      setErrore(
        erroreAggiornamento instanceof Error
          ? erroreAggiornamento.message
          : "Impossibile aggiornare lo stato."
      );
    } finally {
      setInAggiornamento(null);
    }
  }

  const elencoFiltrato = useMemo(() => {
    const testo = ricerca.trim().toLowerCase();

    return appuntamenti.filter((appuntamento) => {
      const statoOk =
        filtro === "Tutti" || appuntamento.stato === filtro;

      const dataOk =
        dataFiltro === "" ||
        appuntamento.data_appuntamento === dataFiltro;

      const ricercaOk =
        testo === "" ||
        appuntamento.nome_cliente.toLowerCase().includes(testo) ||
        appuntamento.telefono.toLowerCase().includes(testo) ||
        (appuntamento.email ?? "").toLowerCase().includes(testo) ||
        appuntamento.tipo_appuntamento.toLowerCase().includes(testo);

      return statoOk && dataOk && ricercaOk;
    });
  }, [appuntamenti, filtro, ricerca, dataFiltro]);

  const appuntamentiSelezionati = useMemo(
    () =>
      appuntamenti.filter((appuntamento) =>
        selezionati.includes(appuntamento.id)
      ),
    [appuntamenti, selezionati]
  );

  const tuttiVisibiliSelezionati =
    elencoFiltrato.length > 0 &&
    elencoFiltrato.every((appuntamento) =>
      selezionati.includes(appuntamento.id)
    );

  function cambiaData(nuovaData: string) {
    setDataFiltro(nuovaData);
    setSelezionati([]);
    setMostraInvioMultiplo(false);
  }

  function selezionaAppuntamento(id: number) {
    setSelezionati((correnti) =>
      correnti.includes(id)
        ? correnti.filter((voce) => voce !== id)
        : [...correnti, id]
    );
  }

  function selezionaTuttiVisibili() {
    const idsVisibili = elencoFiltrato.map((appuntamento) => appuntamento.id);

    if (tuttiVisibiliSelezionati) {
      setSelezionati((correnti) =>
        correnti.filter((id) => !idsVisibili.includes(id))
      );
      return;
    }

    setSelezionati((correnti) =>
      Array.from(new Set([...correnti, ...idsVisibili]))
    );
  }

  function pulisciSelezione() {
    setSelezionati([]);
    setMostraInvioMultiplo(false);
  }

  function apriWhatsAppSingolo(appuntamento: Appuntamento) {
    const url = creaUrlWhatsApp(
      appuntamento.telefono,
      messaggioSingolo(appuntamento)
    );

    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function aggiornaStatoSenzaRicaricare(id: number, stato: string) {
    const risposta = await fetch("/api/admin/appuntamenti/stato", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, stato }),
    });

    const dati = await risposta.json();

    if (!risposta.ok || !dati.ok) {
      throw new Error(
        dati.errore || "Impossibile aggiornare lo stato."
      );
    }
  }

  function creaMessaggioMultiploConFirma() {
    const testo = messaggioMultiplo.trim();

    if (!testo) return "";

    if (!nomeNegozio) return testo;

    return `${testo}\n\n${nomeNegozio}`;
  }

  async function apriWhatsAppSelezionato(appuntamento: Appuntamento) {
    const testo = creaMessaggioMultiploConFirma();

    if (!testo) {
      setErrore("Scrivi prima il messaggio da inviare.");
      return;
    }

    setErrore("");
    setInAggiornamento(appuntamento.id);

    const url = creaUrlWhatsApp(appuntamento.telefono, testo);
    window.open(url, "_blank", "noopener,noreferrer");

    try {
      await aggiornaStatoSenzaRicaricare(appuntamento.id, "Annullato");
      await caricaAppuntamenti();
    } catch (erroreAggiornamento) {
      setErrore(
        erroreAggiornamento instanceof Error
          ? erroreAggiornamento.message
          : "WhatsApp è stato aperto, ma non è stato possibile annullare l'appuntamento."
      );
    } finally {
      setInAggiornamento(null);
    }
  }

  async function provaApriTutti() {
    if (appuntamentiSelezionati.length === 0) {
      setErrore("Seleziona almeno un appuntamento.");
      return;
    }

    const testo = creaMessaggioMultiploConFirma();

    if (!testo) {
      setErrore("Scrivi prima il messaggio da inviare.");
      return;
    }

    setErrore("");

    /*
      WhatsApp non consente a una normale pagina web di inviare automaticamente
      lo stesso messaggio a più numeri. Qui apriamo una chat per ogni destinatario.
      Alcuni browser possono bloccare le aperture multiple: in quel caso si usano
      i pulsanti individuali mostrati nel pannello.
    */
    appuntamentiSelezionati.forEach((appuntamento, indice) => {
      window.setTimeout(() => {
        const url = creaUrlWhatsApp(appuntamento.telefono, testo);
        window.open(url, "_blank", "noopener,noreferrer");
      }, indice * 250);
    });

    try {
      await Promise.all(
        appuntamentiSelezionati.map((appuntamento) =>
          aggiornaStatoSenzaRicaricare(appuntamento.id, "Annullato")
        )
      );

      await caricaAppuntamenti();
      setSelezionati([]);
      setMostraInvioMultiplo(false);
    } catch (erroreAggiornamento) {
      setErrore(
        erroreAggiornamento instanceof Error
          ? erroreAggiornamento.message
          : "Le chat WhatsApp sono state aperte, ma non è stato possibile annullare tutti gli appuntamenti."
      );
      await caricaAppuntamenti();
    }
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[var(--app-background)] pb-10 text-[var(--app-text)]">
      <header className="border-b border-[var(--app-border)] bg-[var(--app-surface)]">
        <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--app-primary)]">
                Area amministrativa
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                Appuntamenti
              </h1>
              <p className="mt-2 text-sm text-[var(--app-muted)]">
                Gestione prenotazioni e comunicazioni WhatsApp ai clienti.
              </p>
            </div>

            <Link
              href="/admin"
              className="w-fit rounded-xl border border-[var(--app-border-strong)] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--app-text)] transition hover:bg-[var(--app-surface-soft)]"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 sm:py-9">
        {errore && (
          <div className="mb-5 rounded-xl border border-[color-mix(in_srgb,var(--app-danger)_30%,white)] bg-[color-mix(in_srgb,var(--app-danger)_10%,white)] px-4 py-4 text-sm font-semibold text-[var(--app-danger)]">
            {errore}
          </div>
        )}

        <div className="mb-5 rounded-[22px] border border-[var(--app-border)] bg-[var(--app-surface)] p-4">
          <div className="grid gap-3 lg:grid-cols-[210px_minmax(0,1fr)_auto]">
            <label className="text-xs font-semibold text-[var(--app-text-soft)]">
              Giorno appuntamenti
              <input
                type="date"
                value={dataFiltro}
                onChange={(evento) => cambiaData(evento.target.value)}
                className="mt-1 w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-background)] px-3 py-3 text-sm text-[var(--app-text)] outline-none focus:border-[var(--app-primary)]"
              />
            </label>

            <label className="text-xs font-semibold text-[var(--app-text-soft)]">
              Cerca
              <input
                type="search"
                value={ricerca}
                onChange={(evento) => setRicerca(evento.target.value)}
                placeholder="Cliente, telefono, email, servizio..."
                className="mt-1 w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-background)] px-4 py-3 text-sm text-[var(--app-text)] outline-none focus:border-[var(--app-primary)]"
              />
            </label>

            <button
              type="button"
              onClick={caricaAppuntamenti}
              className="self-end rounded-xl bg-[var(--app-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--app-primary-hover)]"
            >
              Aggiorna
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex max-w-full gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {["Tutti", "Da confermare", "Confermato", "Annullato"].map(
                (voce) => (
                  <button
                    key={voce}
                    type="button"
                    onClick={() => {
                      setFiltro(voce);
                      setSelezionati([]);
                    }}
                    className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-semibold ${
                      filtro === voce
                        ? "border-[var(--app-primary)] bg-[var(--app-primary)] text-white"
                        : "border-[var(--app-border)] bg-[var(--app-background)] text-[var(--app-text-soft)]"
                    }`}
                  >
                    {voce}
                  </button>
                )
              )}
            </div>

            <button
              type="button"
              onClick={() => cambiaData("")}
              className="text-xs font-semibold text-[var(--app-primary)]"
            >
              Mostra tutti i giorni
            </button>
          </div>
        </div>

        {!caricamento && elencoFiltrato.length > 0 && (
          <div className="mb-5 rounded-[22px] border border-[var(--app-border)] bg-[var(--app-surface)] p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold">
                  {dataFiltro
                    ? `Appuntamenti del ${formattaData(dataFiltro)}`
                    : "Appuntamenti visualizzati"}
                </p>
                <p className="mt-1 text-xs text-[var(--app-muted)]">
                  {selezionati.length} selezionati su {elencoFiltrato.length} visualizzati.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={selezionaTuttiVisibili}
                  className="rounded-xl border border-[var(--app-border-strong)] bg-[var(--app-background)] px-4 py-2.5 text-xs font-semibold text-[var(--app-text-soft)]"
                >
                  {tuttiVisibiliSelezionati
                    ? "Deseleziona tutti"
                    : "Seleziona tutti"}
                </button>

                {selezionati.length > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={pulisciSelezione}
                      className="rounded-xl border border-[var(--app-border)] px-4 py-2.5 text-xs font-semibold text-[var(--app-muted)]"
                    >
                      Azzera selezione
                    </button>

                    <button
                      type="button"
                      onClick={() => setMostraInvioMultiplo(true)}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-xs font-semibold text-white"
                    >
                      <IconaWhatsApp />
                      Messaggio a {selezionati.length}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {mostraInvioMultiplo && selezionati.length > 0 && (
          <section className="mb-6 rounded-[22px] border border-[var(--app-border)] bg-[var(--app-surface)] p-5 shadow-[0_16px_34px_rgba(32,56,59,.06)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#25A85A]">
                  WhatsApp
                </p>
                <h2 className="mt-1 font-serif text-2xl font-medium">
                  Messaggio comune
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--app-muted)]">
                  Lo stesso testo verrà preparato per tutti gli appuntamenti selezionati.
                  {nomeNegozio
                    ? ` Il messaggio verrà firmato automaticamente con ${nomeNegozio}.`
                    : ""}
                  Gli appuntamenti verranno impostati automaticamente come Annullati.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setMostraInvioMultiplo(false)}
                className="text-xs font-semibold text-[var(--app-muted)]"
              >
                Chiudi
              </button>
            </div>

            <textarea
              value={messaggioMultiplo}
              onChange={(evento) => setMessaggioMultiplo(evento.target.value)}
              rows={5}
              className="mt-4 w-full resize-y rounded-xl border border-[var(--app-border)] bg-[var(--app-background)] px-4 py-3 text-sm leading-6 text-[var(--app-text)] outline-none focus:border-[var(--app-primary)]"
              placeholder="Scrivi il messaggio da inviare..."
            />

            {nomeNegozio && (
              <p className="mt-2 text-xs text-[var(--app-muted)]">
                Firma automatica: <strong>{nomeNegozio}</strong>
              </p>
            )}

            <div className="mt-4 rounded-xl bg-[var(--app-surface-soft)] p-4">
              <p className="text-xs font-semibold text-[var(--app-text-soft)]">
                Destinatari selezionati
              </p>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {appuntamentiSelezionati.map((appuntamento) => (
                  <div
                    key={appuntamento.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {appuntamento.nome_cliente}
                      </p>
                      <p className="mt-1 text-xs text-[var(--app-muted)]">
                        {formattaOra(appuntamento.ora_inizio)} · {appuntamento.telefono}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => apriWhatsAppSelezionato(appuntamento)}
                      className="shrink-0 rounded-lg bg-[#25D366] p-2.5 text-white"
                      title={`Apri WhatsApp per ${appuntamento.nome_cliente}`}
                    >
                      <IconaWhatsApp />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={provaApriTutti}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-semibold text-white"
              >
                <IconaWhatsApp className="h-5 w-5" />
                Invia e annulla selezionati
              </button>

              <p className="text-xs leading-5 text-[var(--app-muted)]">
                WhatsApp richiede comunque la conferma dell&apos;invio in ogni chat.
                Se il browser blocca le schede multiple, usa i pulsanti verdi accanto ai singoli destinatari.
              </p>
            </div>
          </section>
        )}

        {caricamento ? (
          <div className="rounded-[22px] border border-[var(--app-border)] bg-[var(--app-surface)] p-8 text-center font-semibold text-[var(--app-muted)]">
            Caricamento appuntamenti...
          </div>
        ) : elencoFiltrato.length === 0 ? (
          <div className="rounded-[22px] border border-[var(--app-border)] bg-[var(--app-surface)] p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center text-[var(--app-primary)]">
              <svg
                viewBox="0 0 24 24"
                className="h-9 w-9"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
                <path d="M8 3v4M16 3v4M3.5 10h17" />
              </svg>
            </div>
            <h2 className="mt-3 text-xl font-semibold">Nessun appuntamento</h2>
            <p className="mt-2 text-sm text-[var(--app-muted)]">
              Non ci sono prenotazioni corrispondenti ai filtri selezionati.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {elencoFiltrato.map((appuntamento) => {
              const selezionato = selezionati.includes(appuntamento.id);

              return (
                <article
                  key={appuntamento.id}
                  className={`min-w-0 overflow-hidden rounded-[20px] border bg-[var(--app-surface)] p-4 transition sm:p-5 ${
                    selezionato
                      ? "border-[var(--app-primary)] ring-2 ring-[color-mix(in_srgb,var(--app-primary)_18%,transparent)]"
                      : "border-[var(--app-border)]"
                  }`}
                >
                  <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex min-w-0 flex-1 gap-3">
                      <label
                        className="mt-0.5 flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-[var(--app-border)] bg-[var(--app-background)]"
                        title="Seleziona appuntamento"
                      >
                        <input
                          type="checkbox"
                          checked={selezionato}
                          onChange={() => selezionaAppuntamento(appuntamento.id)}
                          className="h-4 w-4 cursor-pointer"
                          style={{ accentColor: "var(--app-primary)" }}
                          aria-label={`Seleziona ${appuntamento.nome_cliente}`}
                        />
                      </label>

                      <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                          <h2 className="min-w-0 break-words text-xl font-semibold tracking-[-0.02em]">
                            {appuntamento.nome_cliente}
                          </h2>

                          <span
                            className={`rounded-full border px-3 py-1 text-[10px] font-semibold ${classeStato(
                              appuntamento.stato
                            )}`}
                          >
                            {appuntamento.stato}
                          </span>
                        </div>

                        <p className="mt-2 text-sm font-semibold text-[var(--app-primary)]">
                          {appuntamento.tipo_appuntamento}
                        </p>

                        <div className="mt-3 grid gap-1 text-sm text-[var(--app-muted)]">
                          <p>
                            <strong className="text-[var(--app-text-soft)]">
                              Data:
                            </strong>{" "}
                            {formattaData(appuntamento.data_appuntamento)}
                          </p>

                          <p>
                            <strong className="text-[var(--app-text-soft)]">
                              Orario:
                            </strong>{" "}
                            {formattaOra(appuntamento.ora_inizio)}
                            {appuntamento.ora_fine
                              ? ` - ${formattaOra(appuntamento.ora_fine)}`
                              : ""}
                          </p>

                          <p>
                            <strong className="text-[var(--app-text-soft)]">
                              Telefono:
                            </strong>{" "}
                            <a
                              href={`tel:${appuntamento.telefono}`}
                              className="font-semibold text-[var(--app-primary)]"
                            >
                              {appuntamento.telefono}
                            </a>
                          </p>

                          {appuntamento.email && (
                            <p>
                              <strong className="text-[var(--app-text-soft)]">
                                Email:
                              </strong>{" "}
                              <a
                                href={`mailto:${appuntamento.email}`}
                                className="font-semibold text-[var(--app-primary)]"
                              >
                                {appuntamento.email}
                              </a>
                            </p>
                          )}

                          {appuntamento.note && (
                            <p className="mt-2 rounded-xl bg-[var(--app-surface-soft)] p-3">
                              <strong className="text-[var(--app-text-soft)]">
                                Note:
                              </strong>{" "}
                              {appuntamento.note}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid min-w-[190px] gap-2">
                      <button
                        type="button"
                        onClick={() => apriWhatsAppSingolo(appuntamento)}
                        className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-xs font-semibold text-white"
                      >
                        <IconaWhatsApp />
                        Invia messaggio
                      </button>

                      <button
                        type="button"
                        disabled={inAggiornamento === appuntamento.id}
                        onClick={() =>
                          cambiaStato(appuntamento.id, "Confermato")
                        }
                        className="rounded-xl bg-[var(--app-success)] px-4 py-3 text-xs font-semibold text-white disabled:opacity-50"
                      >
                        Conferma
                      </button>

                      <button
                        type="button"
                        disabled={inAggiornamento === appuntamento.id}
                        onClick={() =>
                          cambiaStato(appuntamento.id, "Da confermare")
                        }
                        className="rounded-xl bg-[var(--app-warning)] px-4 py-3 text-xs font-semibold text-white disabled:opacity-50"
                      >
                        Da confermare
                      </button>

                      <button
                        type="button"
                        disabled={inAggiornamento === appuntamento.id}
                        onClick={() =>
                          cambiaStato(appuntamento.id, "Annullato")
                        }
                        className="rounded-xl bg-[var(--app-danger)] px-4 py-3 text-xs font-semibold text-white disabled:opacity-50"
                      >
                        Annulla
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
