"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

type TipoAppuntamento = {
  id: number;
  nome: string;
  descrizione: string | null;
  durata_minuti: number;
};

type SlotAppuntamento = {
  id: number;
  tipo_appuntamento_id: number;
  data_appuntamento: string;
  ora_inizio: string;
  ora_fine: string;
  disponibile?: boolean | number | string;
  occupato?: boolean | number | string;
};

type RispostaTipi = {
  ok: boolean;
  tipi?: TipoAppuntamento[];
  errore?: string;
};

type RispostaSlot = {
  ok: boolean;
  slot?: SlotAppuntamento[];
  errore?: string;
};

type RispostaCreazione = {
  ok: boolean;
  appuntamento_id?: number;
  messaggio?: string;
  errore?: string;
};

function formattaData(data: string) {
  const [anno, mese, giorno] =
    data.split("-");

  if (!anno || !mese || !giorno) {
    return data;
  }

  return `${giorno}/${mese}/${anno}`;
}

function formattaOra(ora: string) {
  return ora.slice(0, 5);
}

function IconaHome() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 10.5V20h13v-9.5" />
    </svg>
  );
}

function IconaOcchiali() {
  return (
    <svg viewBox="0 0 64 64" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="3">
      <circle cx="18" cy="36" r="10" />
      <circle cx="46" cy="36" r="10" />
      <path d="M28 35c2-2 6-2 8 0" />
      <path d="M8 34 12 21" />
      <path d="M56 34 52 21" />
    </svg>
  );
}

function IconaCalendario() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </svg>
  );
}

function IconaPromo() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m20 12-8 8-8-8 8-8 8 8Z" />
      <path d="M9 9h.01M15 15h.01M15 9l-6 6" />
    </svg>
  );
}

function IconaProfilo() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4.5 4.2-6.5 8-6.5s6.5 2 8 6.5" />
    </svg>
  );
}

export default function AppuntamentiPage() {
  const [tipi, setTipi] =
    useState<TipoAppuntamento[]>([]);

  const [slot, setSlot] =
    useState<SlotAppuntamento[]>([]);

  const [tipoId, setTipoId] =
    useState<number | null>(null);

  const [dataSelezionata, setDataSelezionata] =
    useState("");

  const [slotId, setSlotId] =
    useState<number | null>(null);

  const [nome, setNome] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");

  const [caricamentoTipi, setCaricamentoTipi] =
    useState(true);

  const [caricamentoSlot, setCaricamentoSlot] =
    useState(false);

  const [salvataggio, setSalvataggio] =
    useState(false);

  const [errore, setErrore] = useState("");
  const [messaggio, setMessaggio] =
    useState("");

  useEffect(() => {
    async function caricaTipi() {
      setCaricamentoTipi(true);
      setErrore("");

      try {
        const risposta = await fetch(
          "/api/appuntamenti/tipi",
          {
            cache: "no-store",
          }
        );

        const dati =
          (await risposta.json()) as RispostaTipi;

        if (!risposta.ok || !dati.ok) {
          throw new Error(
            dati.errore ||
              "Impossibile caricare i servizi."
          );
        }

        const elenco = dati.tipi ?? [];

        setTipi(elenco);
        setTipoId(null);
      } catch (erroreCaricamento) {
        setErrore(
          erroreCaricamento instanceof Error
            ? erroreCaricamento.message
            : "Impossibile caricare i servizi."
        );
      } finally {
        setCaricamentoTipi(false);
      }
    }

    caricaTipi();
  }, []);

  useEffect(() => {
    if (!tipoId) {
      setSlot([]);
      setDataSelezionata("");
      setSlotId(null);
      return;
    }

    async function caricaSlot() {
      setCaricamentoSlot(true);
      setErrore("");
      setSlotId(null);
      setDataSelezionata("");

      try {
        const risposta = await fetch(
          `/api/appuntamenti/slot?tipo_id=${tipoId}`,
          {
            cache: "no-store",
          }
        );

        const dati =
          (await risposta.json()) as RispostaSlot;

        if (!risposta.ok || !dati.ok) {
          throw new Error(
            dati.errore ||
              "Impossibile caricare gli orari."
          );
        }

        const elenco = dati.slot ?? [];

        setSlot(elenco);

        if (elenco.length > 0) {
          setDataSelezionata(
            elenco[0].data_appuntamento
          );
        }
      } catch (erroreCaricamento) {
        setErrore(
          erroreCaricamento instanceof Error
            ? erroreCaricamento.message
            : "Impossibile caricare gli orari."
        );
        setSlot([]);
      } finally {
        setCaricamentoSlot(false);
      }
    }

    caricaSlot();
  }, [tipoId]);

  const tipoSelezionato = useMemo(
    () =>
      tipi.find((tipo) => tipo.id === tipoId) ??
      null,
    [tipoId, tipi]
  );

  const dateDisponibili = useMemo(() => {
    return Array.from(
      new Set(
        slot.map(
          (voce) => voce.data_appuntamento
        )
      )
    );
  }, [slot]);

  const slotDelGiorno = useMemo(() => {
    return slot.filter(
      (voce) =>
        voce.data_appuntamento ===
        dataSelezionata
    );
  }, [dataSelezionata, slot]);

  const slotSelezionato = useMemo(
    () =>
      slot.find((voce) => voce.id === slotId) ??
      null,
    [slotId, slot]
  );

  async function confermaPrenotazione(
    evento: FormEvent<HTMLFormElement>
  ) {
    evento.preventDefault();

    setErrore("");
    setMessaggio("");

    if (!tipoId) {
      setErrore("Seleziona un servizio.");
      return;
    }

    if (!slotId) {
      setErrore("Seleziona un orario disponibile.");
      return;
    }

    if (nome.trim() === "") {
      setErrore("Inserisci nome e cognome.");
      return;
    }

    if (telefono.trim() === "") {
      setErrore("Inserisci il numero di telefono.");
      return;
    }

    setSalvataggio(true);

    try {
      const risposta = await fetch(
        "/api/appuntamenti/crea",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            tipo_appuntamento_id: tipoId,
            slot_id: slotId,
            nome_cliente: nome.trim(),
            telefono: telefono.trim(),
            email: email.trim(),
            note: note.trim(),
          }),
        }
      );

      const dati =
        (await risposta.json()) as RispostaCreazione;

      if (!risposta.ok || !dati.ok) {
        throw new Error(
          dati.errore ||
            "Errore durante la prenotazione."
        );
      }

      setMessaggio(
        "Appuntamento prenotato correttamente."
      );

      setNome("");
      setTelefono("");
      setEmail("");
      setNote("");
      setSlotId(null);

      const nuovaRisposta = await fetch(
        `/api/appuntamenti/slot?tipo_id=${tipoId}`,
        {
          cache: "no-store",
        }
      );

      const nuoviDati =
        (await nuovaRisposta.json()) as RispostaSlot;

      if (
        nuovaRisposta.ok &&
        nuoviDati.ok
      ) {
        const nuovoElenco =
          nuoviDati.slot ?? [];

        setSlot(nuovoElenco);

        if (
          nuovoElenco.length > 0 &&
          !nuovoElenco.some(
            (voce) =>
              voce.data_appuntamento ===
              dataSelezionata
          )
        ) {
          setDataSelezionata(
            nuovoElenco[0].data_appuntamento
          );
        }
      }
    } catch (erroreSalvataggio) {
      setErrore(
        erroreSalvataggio instanceof Error
          ? erroreSalvataggio.message
          : "Errore durante la prenotazione."
      );
    } finally {
      setSalvataggio(false);
    }
  }

  return (
    <main
      className="min-h-screen overflow-hidden pb-24 text-[#102A2E]"
      style={{
        background: "linear-gradient(180deg, #FFFFFF 0%, #F7FBFB 52%, #EEF7F8 100%)",
      }}
    >
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0C252B]/95 text-white backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#0C252B] shadow-sm">
              <IconaOcchiali />
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#92D8DF]">
                Centro ottico
              </p>

              <h1 className="text-lg font-black tracking-tight">
                OTTICA APP
              </h1>
            </div>
          </Link>

          <Link
            href="/login"
            className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-black"
          >
            Admin
          </Link>
        </div>
      </header>

      <section
        className="relative overflow-hidden text-white"
        style={{
          background:
            "linear-gradient(135deg, #063847 0%, #0F6676 52%, #8FD0D8 100%)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 76% 20%, rgba(255,255,255,.16) 0%, rgba(255,255,255,0) 25%), radial-gradient(circle at 58% 88%, rgba(116,232,241,.14) 0%, rgba(116,232,241,0) 30%)",
          }}
        />

        {/* Lente grande */}
        <div
          className="pointer-events-none absolute hidden rounded-full sm:block"
          style={{
            width: 320,
            height: 320,
            right: "17%",
            top: -105,
            border: "1px solid rgba(255,255,255,.38)",
            background:
              "radial-gradient(circle at 30% 25%, rgba(255,255,255,.22) 0%, rgba(255,255,255,.06) 34%, rgba(113,226,236,.08) 66%, rgba(255,255,255,.02) 100%)",
            boxShadow:
              "inset 12px 10px 32px rgba(255,255,255,.08), inset -14px -12px 34px rgba(4,65,76,.10), 0 0 50px rgba(144,235,242,.14)",
            backdropFilter: "blur(1px)",
          }}
        >
          <div
            className="absolute rounded-full"
            style={{
              width: "38%",
              height: "20%",
              left: "14%",
              top: "10%",
              transform: "rotate(-22deg)",
              background: "rgba(255,255,255,.13)",
              filter: "blur(13px)",
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: "44%",
              height: 14,
              right: "7%",
              bottom: "17%",
              transform: "rotate(-24deg)",
              background:
                "linear-gradient(90deg, rgba(129,237,245,0), rgba(224,255,255,.18), rgba(129,237,245,0))",
              filter: "blur(7px)",
            }}
          />
        </div>

        {/* Seconda lente sovrapposta */}
        <div
          className="pointer-events-none absolute rounded-full"
          style={{
            width: 230,
            height: 230,
            right: "3%",
            top: -30,
            border: "1px solid rgba(255,255,255,.28)",
            background:
              "radial-gradient(circle at 27% 24%, rgba(255,255,255,.18) 0%, rgba(255,255,255,.045) 42%, rgba(94,211,222,.075) 74%, rgba(255,255,255,.02) 100%)",
            boxShadow:
              "inset 8px 8px 24px rgba(255,255,255,.07), 0 0 42px rgba(160,237,242,.10)",
          }}
        />

        {/* Lente tagliata a sinistra */}
        <div
          className="pointer-events-none absolute rounded-full"
          style={{
            width: 300,
            height: 300,
            left: -175,
            top: -185,
            border: "1px solid rgba(255,255,255,.12)",
            background: "rgba(255,255,255,.025)",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-10 sm:px-6 sm:pb-14 sm:pt-14">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.24em] text-[#D8F4F7] backdrop-blur">
              Prenotazioni online
            </span>

            <h2 className="mt-4 max-w-3xl text-4xl font-black leading-[0.96] tracking-[-0.055em] sm:text-6xl">
              Prenota la tua
              <span className="block text-[#D1F5F7]">
                visita in pochi passi.
              </span>
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/90 sm:text-lg sm:leading-8">
              Scegli il servizio, seleziona la data disponibile e prenota
              l’orario più comodo per te.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {["Servizio", "Data", "Orario", "Conferma"].map((voce, indice) => (
                <span
                  key={voce}
                  className="rounded-full border border-white/20 bg-[#06313B]/25 px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-white"
                >
                  {indice + 1}. {voce}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div
        className="relative"
        style={{
          background:
            "radial-gradient(circle at 0% 25%, rgba(169,214,222,.18) 0%, rgba(169,214,222,0) 28%), radial-gradient(circle at 100% 66%, rgba(143,208,216,.16) 0%, rgba(143,208,216,0) 30%), linear-gradient(180deg, #FFFFFF 0%, #F7FBFB 100%)",
        }}
      >
      <form
        onSubmit={confermaPrenotazione}
        className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10"
      >
        <div className="pointer-events-none absolute -left-52 top-40 h-96 w-96 rounded-full bg-[#A9D6DE]/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-56 top-[520px] h-[420px] w-[420px] rounded-full border border-[#A9D6DE]/20 bg-white/15" />
        {errore && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm font-black text-red-700">
            Errore: {errore}
          </div>
        )}

        {messaggio && (
          <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm font-black text-emerald-700">
            {messaggio}
          </div>
        )}

        <section className="relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#5D858C]">
            1. Servizio
          </p>

          <h3 className="mt-1 text-2xl font-black tracking-[-0.03em]">
            Cosa vuoi prenotare?
          </h3>

          {caricamentoTipi ? (
            <p className="mt-4 text-sm font-bold text-[#6D8287]">
              Caricamento servizi...
            </p>
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {tipi.map((tipo) => {
                const attivo =
                  tipo.id === tipoId;

                return (
                  <button
                    key={tipo.id}
                    type="button"
                    onClick={() =>
                      setTipoId(tipo.id)
                    }
                    className={`group relative overflow-hidden rounded-[26px] border-2 p-5 text-left transition duration-300 hover:-translate-y-1 ${
                      attivo
                        ? "border-[#1D6E7A]"
                        : "border-[#DCE8E9] hover:border-[#A9D6DE]"
                    }`}
                    style={{
                      background: attivo
                        ? "linear-gradient(145deg, #FFFFFF 0%, #EAF7F8 100%)"
                        : "linear-gradient(145deg, #FFFFFF 0%, #F8FCFC 72%, #EDF8F9 100%)",
                      boxShadow: attivo
                        ? "0 18px 42px rgba(29,110,122,.16)"
                        : "0 14px 32px rgba(16,42,46,.08)",
                    }}
                  >
                    <div
                      className={`absolute inset-x-0 top-0 h-1 ${
                        attivo
                          ? "bg-[#1D6E7A]"
                          : "bg-[#C8E3E7]"
                      }`}
                    />

                    <div className="flex items-start justify-between gap-3">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                          attivo
                            ? "bg-[#1D6E7A] text-white"
                            : "bg-[#F0F6F6] text-[#1D6E7A]"
                        }`}
                      >
                        <IconaCalendario />
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-black ${
                          attivo
                            ? "bg-[#0C252B] text-white"
                            : "bg-[#EAF2F3] text-[#385D64]"
                        }`}
                      >
                        {tipo.durata_minuti} min
                      </span>
                    </div>

                    <h4 className="mt-4 text-lg font-black tracking-[-0.02em]">
                      {tipo.nome}
                    </h4>

                    {tipo.descrizione && (
                      <p className="mt-2 min-h-[48px] text-sm leading-6 text-[#677E83]">
                        {tipo.descrizione}
                      </p>
                    )}

                    <div className="mt-4 flex items-center justify-between">
                      <span
                        className={`text-[11px] font-black uppercase tracking-[0.14em] ${
                          attivo
                            ? "text-[#1D6E7A]"
                            : "text-[#789095]"
                        }`}
                      >
                        {attivo ? "Selezionato" : "Seleziona"}
                      </span>

                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-black ${
                          attivo
                            ? "bg-[#1D6E7A] text-white"
                            : "bg-[#F0F6F6] text-[#1D6E7A]"
                        }`}
                      >
                        {attivo ? "✓" : "→"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className="relative z-10 mt-10 rounded-[30px] border border-[#DCE8E9] bg-white/85 p-5 shadow-[0_18px_45px_rgba(16,42,46,0.06)] backdrop-blur sm:p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#5D858C]">
            2. Giorno
          </p>

          <h3 className="mt-1 text-2xl font-black tracking-[-0.03em]">
            Scegli la data.
          </h3>

          {caricamentoSlot ? (
            <p className="mt-4 text-sm font-bold text-[#6D8287]">
              Caricamento disponibilità...
            </p>
          ) : !tipoId ? (
            <div className="mt-4 rounded-2xl border border-[#DCE8E9] bg-[#F7FAFA] p-5 text-sm font-bold text-[#6D8287]">
              Seleziona prima il servizio che vuoi prenotare.
            </div>
          ) : dateDisponibili.length > 0 ? (
            <div className="mt-5 max-w-xl rounded-[26px] border border-[#DCE8E9] bg-[#F8FBFB] p-5 shadow-[0_12px_28px_rgba(16,42,46,0.05)]">
              <label className="block">
                <span className="mb-2 block text-sm font-black text-[#102A2E]">
                  Data disponibile
                </span>

                <select
                  value={dataSelezionata}
                  onChange={(evento) => {
                    setDataSelezionata(evento.target.value);
                    setSlotId(null);
                  }}
                  className="w-full rounded-2xl border-2 border-[#DCE8E9] bg-white px-4 py-4 text-base font-black text-[#0C4A59] outline-none focus:border-[#1D6E7A]"
                >
                  {dateDisponibili.map((data) => (
                    <option key={data} value={data}>
                      {formattaData(data)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-[#DCE8E9] bg-[#F7FAFA] p-5 text-sm font-bold text-[#6D8287]">
              Nessuna data disponibile per questo
              servizio.
            </div>
          )}
        </section>

        <section className="relative z-10 mt-6 rounded-[30px] border border-[#DCE8E9] bg-white/85 p-5 shadow-[0_18px_45px_rgba(16,42,46,0.06)] backdrop-blur sm:p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#5D858C]">
            3. Orario
          </p>

          <h3 className="mt-1 text-2xl font-black tracking-[-0.03em]">
            Seleziona l’orario.
          </h3>

          {slotDelGiorno.length > 0 ? (
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {slotDelGiorno.map((voce) => {
                const occupato =
                  voce.occupato === true ||
                  voce.occupato === 1 ||
                  voce.occupato === "1" ||
                  voce.disponibile === false ||
                  voce.disponibile === 0 ||
                  voce.disponibile === "0";

                const selezionato =
                  !occupato && slotId === voce.id;

                return (
                  <button
                    key={voce.id}
                    type="button"
                    disabled={occupato}
                    onClick={() => {
                      if (!occupato) {
                        setSlotId(voce.id);
                      }
                    }}
                    className={`rounded-2xl border-2 px-3 py-4 text-sm font-black transition ${
                      occupato
                        ? "cursor-not-allowed border-red-200 bg-red-100 text-red-700"
                        : selezionato
                        ? "border-[#1D6E7A] bg-[#1D6E7A] text-white"
                        : "border-[#DCE8E9] bg-white text-[#0C4A59] hover:border-[#1D6E7A]"
                    }`}
                  >
                    <span className="block text-base">
                      {formattaOra(voce.ora_inizio)}
                    </span>

                    <span className="mt-1 block text-[10px] uppercase tracking-[0.12em]">
                      {occupato ? "Occupato" : "Libero"}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="mt-4 text-sm font-bold text-[#6D8287]">
              {!tipoId
                ? "Seleziona prima un servizio."
                : dateDisponibili.length === 0
                ? "Non ci sono orari disponibili per questo servizio."
                : "Seleziona una data disponibile."}
            </p>
          )}
        </section>

        <section className="relative z-10 mt-8 rounded-[30px] border border-[#D7E5E6] bg-[linear-gradient(180deg,#F8FBFB_0%,#F2F7F7_100%)] p-5 shadow-[0_18px_45px_rgba(16,42,46,0.07)] sm:p-7">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#5D858C]">
            4. I tuoi dati
          </p>

          <h3 className="mt-1 text-2xl font-black tracking-[-0.03em]">
            Completa la prenotazione.
          </h3>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-black">
                Nome e cognome *
              </span>

              <input
                type="text"
                value={nome}
                onChange={(evento) =>
                  setNome(evento.target.value)
                }
                className="w-full rounded-xl border border-[#C9DADC] bg-white px-4 py-3 outline-none focus:border-[#1D6E7A]"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-black">
                Telefono *
              </span>

              <input
                type="tel"
                value={telefono}
                onChange={(evento) =>
                  setTelefono(
                    evento.target.value
                  )
                }
                className="w-full rounded-xl border border-[#C9DADC] bg-white px-4 py-3 outline-none focus:border-[#1D6E7A]"
              />
            </label>

            <label className="sm:col-span-2">
              <span className="mb-2 block text-sm font-black">
                Email
              </span>

              <input
                type="email"
                value={email}
                onChange={(evento) =>
                  setEmail(evento.target.value)
                }
                className="w-full rounded-xl border border-[#C9DADC] bg-white px-4 py-3 outline-none focus:border-[#1D6E7A]"
              />
            </label>

            <label className="sm:col-span-2">
              <span className="mb-2 block text-sm font-black">
                Note
              </span>

              <textarea
                rows={4}
                value={note}
                onChange={(evento) =>
                  setNote(evento.target.value)
                }
                className="w-full resize-none rounded-xl border border-[#C9DADC] bg-white px-4 py-3 outline-none focus:border-[#1D6E7A]"
              />
            </label>
          </div>

          <div className="mt-6 rounded-2xl border border-[#CFE2E5] bg-white p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#6C878D]">
              Riepilogo
            </p>

            <div className="mt-2 grid gap-1 text-sm">
              <p>
                Servizio:{" "}
                <strong>
                  {tipoSelezionato?.nome ?? "-"}
                </strong>
              </p>

              <p>
                Data:{" "}
                <strong>
                  {dataSelezionata
                    ? formattaData(
                        dataSelezionata
                      )
                    : "-"}
                </strong>
              </p>

              <p>
                Orario:{" "}
                <strong>
                  {slotSelezionato
                    ? formattaOra(
                        slotSelezionato.ora_inizio
                      )
                    : "-"}
                </strong>
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={
              salvataggio ||
              !tipoId ||
              !slotId
            }
            className="relative z-20 mt-6 flex min-h-[56px] w-full items-center justify-center rounded-2xl px-5 py-4 text-sm font-black shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed"
            style={{
              backgroundColor: "#041E27",
              color: "#FFFFFF",
              opacity: 1,
              visibility: "visible",
            }}
          >
            {salvataggio
              ? "Prenotazione in corso..."
              : "Conferma prenotazione"}
          </button>
        </section>
      </form>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#DCE6E6] bg-white/95 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 shadow-[0_-8px_30px_rgba(16,42,46,0.08)] backdrop-blur-xl">
        <div className="mx-auto grid max-w-md grid-cols-5">
          <Link href="/" className="flex flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[#789095]">
            <IconaHome />
            <span className="text-[10px] font-bold">Home</span>
          </Link>

          <Link href="/catalogo" className="flex flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[#789095]">
            <IconaOcchiali />
            <span className="text-[10px] font-bold">Catalogo</span>
          </Link>

          <Link href="/appuntamenti" className="flex flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[#0C252B]">
            <IconaCalendario />
            <span className="text-[10px] font-black">Prenota</span>
          </Link>

          <Link href="/promozioni" className="flex flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[#789095]">
            <IconaPromo />
            <span className="text-[10px] font-bold">Promo</span>
          </Link>

          <Link href="/login" className="flex flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[#789095]">
            <IconaProfilo />
            <span className="text-[10px] font-bold">Profilo</span>
          </Link>
        </div>
      </nav>
    </main>
  );
}
