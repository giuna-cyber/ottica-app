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
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (stato === "Annullato") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

function preparaNumeroWhatsApp(telefono: string) {
  let numero = telefono.replace(/\D/g, "");

  if (numero.startsWith("00")) {
    numero = numero.slice(2);
  }

  // Numeri mobili italiani inseriti senza prefisso internazionale.
  if (numero.length === 10 && numero.startsWith("3")) {
    numero = `39${numero}`;
  }

  return numero;
}

function urlWhatsApp(appuntamento: Appuntamento) {
  const numero = preparaNumeroWhatsApp(appuntamento.telefono);

  const messaggio = [
    `Ciao ${appuntamento.nome_cliente},`,
    "",
    "ti contattiamo da Ottica App in merito al tuo appuntamento:",
    `${appuntamento.tipo_appuntamento}`,
    `${formattaData(appuntamento.data_appuntamento)} alle ${formattaOra(
      appuntamento.ora_inizio
    )}.`,
    "",
    "Grazie.",
  ].join("\n");

  return `https://wa.me/${numero}?text=${encodeURIComponent(messaggio)}`;
}

function IconaWhatsApp() {
  return (
    <svg
      viewBox="0 0 32 32"
      className="h-4 w-4"
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
  const [inAggiornamento, setInAggiornamento] = useState<number | null>(null);

  useEffect(() => {
    const admin = sessionStorage.getItem("ottica_admin");

    if (!admin) {
      router.replace("/login");
      return;
    }

    caricaAppuntamenti();
  }, [router]);

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

      const ricercaOk =
        testo === "" ||
        appuntamento.nome_cliente.toLowerCase().includes(testo) ||
        appuntamento.telefono.toLowerCase().includes(testo) ||
        (appuntamento.email ?? "").toLowerCase().includes(testo) ||
        appuntamento.tipo_appuntamento.toLowerCase().includes(testo);

      return statoOk && ricercaOk;
    });
  }, [appuntamenti, filtro, ricerca]);

  return (
    <main className="min-h-screen bg-[#F5F9F9] pb-10 text-[#102A2E]">
      <header className="bg-[linear-gradient(135deg,#083B4C,#1D6E7A)] text-white">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#CBEDEF]">
                Area amministrativa
              </p>
              <h1 className="mt-1 text-3xl font-black tracking-[-0.04em]">
                Appuntamenti
              </h1>
              <p className="mt-1 text-sm text-white/75">
                Gestione prenotazioni clienti.
              </p>
            </div>

            <Link
              href="/admin"
              className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-black"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {errore && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm font-black text-red-700">
            {errore}
          </div>
        )}

        <div className="mb-5 rounded-3xl border border-[#DCE8E9] bg-white p-4 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <input
              type="search"
              value={ricerca}
              onChange={(evento) => setRicerca(evento.target.value)}
              placeholder="Cerca cliente, telefono, email, servizio..."
              className="w-full rounded-xl border border-[#C9DADC] px-4 py-3 text-sm outline-none focus:border-[#1D6E7A]"
            />

            <button
              type="button"
              onClick={caricaAppuntamenti}
              className="rounded-xl bg-[#083B4C] px-5 py-3 text-sm font-black text-white"
            >
              Aggiorna
            </button>
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {["Tutti", "Da confermare", "Confermato", "Annullato"].map(
              (voce) => (
                <button
                  key={voce}
                  type="button"
                  onClick={() => setFiltro(voce)}
                  className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-black ${
                    filtro === voce
                      ? "border-[#083B4C] bg-[#083B4C] text-white"
                      : "border-[#C9DADC] bg-white text-[#2D626C]"
                  }`}
                >
                  {voce}
                </button>
              )
            )}
          </div>
        </div>

        {caricamento ? (
          <div className="rounded-3xl border border-[#DCE8E9] bg-white p-8 text-center font-black text-[#6D8287]">
            Caricamento appuntamenti...
          </div>
        ) : elencoFiltrato.length === 0 ? (
          <div className="rounded-3xl border border-[#DCE8E9] bg-white p-8 text-center">
            <div className="text-4xl">📅</div>
            <h2 className="mt-3 text-xl font-black">Nessun appuntamento</h2>
            <p className="mt-2 text-sm text-[#6D8287]">
              Non ci sono prenotazioni corrispondenti ai filtri selezionati.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {elencoFiltrato.map((appuntamento) => (
              <article
                key={appuntamento.id}
                className="rounded-3xl border border-[#DCE8E9] bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-black">
                        {appuntamento.nome_cliente}
                      </h2>
                      <span
                        className={`rounded-full border px-3 py-1 text-[10px] font-black ${classeStato(
                          appuntamento.stato
                        )}`}
                      >
                        {appuntamento.stato}
                      </span>
                    </div>

                    <p className="mt-2 text-sm font-black text-[#1D6E7A]">
                      {appuntamento.tipo_appuntamento}
                    </p>

                    <div className="mt-3 grid gap-1 text-sm text-[#5E7479]">
                      <p>
                        <strong>Data:</strong>{" "}
                        {formattaData(appuntamento.data_appuntamento)}
                      </p>
                      <p>
                        <strong>Orario:</strong>{" "}
                        {formattaOra(appuntamento.ora_inizio)}
                        {appuntamento.ora_fine
                          ? ` - ${formattaOra(appuntamento.ora_fine)}`
                          : ""}
                      </p>
                      <p>
                        <strong>Telefono:</strong>{" "}
                        <a
                          href={`tel:${appuntamento.telefono}`}
                          className="font-black text-[#1D6E7A]"
                        >
                          {appuntamento.telefono}
                        </a>
                      </p>

                      {appuntamento.email && (
                        <p>
                          <strong>Email:</strong>{" "}
                          <a
                            href={`mailto:${appuntamento.email}`}
                            className="font-black text-[#1D6E7A]"
                          >
                            {appuntamento.email}
                          </a>
                        </p>
                      )}

                      {appuntamento.note && (
                        <p className="mt-2 rounded-xl bg-[#F5F9F9] p-3">
                          <strong>Note:</strong> {appuntamento.note}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid min-w-[190px] gap-2">
                    <a
                      href={urlWhatsApp(appuntamento)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-xs font-black text-white shadow-sm transition hover:brightness-95"
                    >
                      <IconaWhatsApp />
                      Invia messaggio
                    </a>

                    <button
                      type="button"
                      disabled={inAggiornamento === appuntamento.id}
                      onClick={() =>
                        cambiaStato(appuntamento.id, "Confermato")
                      }
                      className="rounded-xl bg-emerald-600 px-4 py-3 text-xs font-black text-white disabled:opacity-50"
                    >
                      Conferma
                    </button>

                    <button
                      type="button"
                      disabled={inAggiornamento === appuntamento.id}
                      onClick={() =>
                        cambiaStato(appuntamento.id, "Da confermare")
                      }
                      className="rounded-xl bg-amber-500 px-4 py-3 text-xs font-black text-white disabled:opacity-50"
                    >
                      Da confermare
                    </button>

                    <button
                      type="button"
                      disabled={inAggiornamento === appuntamento.id}
                      onClick={() =>
                        cambiaStato(appuntamento.id, "Annullato")
                      }
                      className="rounded-xl bg-red-600 px-4 py-3 text-xs font-black text-white disabled:opacity-50"
                    >
                      Annulla
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
