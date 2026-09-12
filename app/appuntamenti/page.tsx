"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import BottomNav from "@/app/components/bottom-nav";
import { IconaCatalogoOttica, IconaPrenotaOttica } from "@/app/icone-ottica";

const IconaOcchiali = IconaCatalogoOttica;
const IconaCalendario = IconaPrenotaOttica;

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
      className="min-h-screen overflow-hidden bg-[#F6F4EF] pb-24 text-[#20383B]"
      style={{
        background: "#F6F4EF",
      }}
    >
      <header className="sticky top-0 z-50 border-b border-[#D9E2DF] bg-[#FBFAF7]/95 text-[#20383B] backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#D4DFDB] bg-white text-[#6F918B] shadow-sm">
              <IconaOcchiali />
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#9AABA6]">
                Centro ottico
              </p>

              <h1 className="text-lg font-semibold tracking-tight text-[#20383B]">
                OTTICA APP
              </h1>
            </div>
          </Link>

          <Link
            href="/login"
            className="rounded-full border border-[#D4DFDB] bg-white px-3 py-2 text-xs font-semibold text-[#738682]"
          >
            Admin
          </Link>
        </div>
      </header>

      <section
        className="relative overflow-hidden border-b border-[#D9E2DF] text-[#20383B]"
        style={{
          background:
            "linear-gradient(135deg, #EEF3F0 0%, #FBFAF7 52%, #F5F2EC 100%)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 76% 20%, rgba(255,255,255,.55) 0%, rgba(255,255,255,0) 27%), radial-gradient(circle at 58% 88%, rgba(127,163,154,.14) 0%, rgba(127,163,154,0) 32%)",
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
              "radial-gradient(circle at 30% 25%, rgba(255,255,255,.22) 0%, rgba(255,255,255,.06) 34%, rgba(127,163,154,.08) 66%, rgba(255,255,255,.02) 100%)",
            boxShadow:
              "inset 12px 10px 32px rgba(255,255,255,.08), inset -14px -12px 34px rgba(80,108,105,.08), 0 0 50px rgba(127,163,154,.10)",
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
                "linear-gradient(90deg, rgba(127,163,154,0), rgba(255,255,255,.22), rgba(127,163,154,0))",
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
              "radial-gradient(circle at 27% 24%, rgba(255,255,255,.18) 0%, rgba(255,255,255,.045) 42%, rgba(127,163,154,.075) 74%, rgba(255,255,255,.02) 100%)",
            boxShadow:
              "inset 8px 8px 24px rgba(255,255,255,.07), 0 0 42px rgba(127,163,154,.08)",
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
            <span className="inline-flex rounded-full border border-[#D4DFDB] bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#7FA39A] backdrop-blur">
              Prenotazioni online
            </span>

            <h2 className="mt-4 max-w-3xl font-serif text-4xl font-medium leading-[0.98] tracking-[-0.045em] text-[#20383B] sm:text-6xl">
              Prenota la tua
              <span className="block text-[#7FA39A]">
                visita in pochi passi.
              </span>
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-[#748783] sm:text-lg sm:leading-8">
              Scegli il servizio, seleziona la data disponibile e prenota
              l’orario più comodo per te.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {["Servizio", "Data", "Orario", "Conferma"].map((voce, indice) => (
                <span
                  key={voce}
                  className="rounded-full border border-[#D4DFDB] bg-white px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#738682] shadow-sm"
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
            "#F6F4EF",
        }}
      >
      <form
        onSubmit={confermaPrenotazione}
        className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10"
      >
        <div className="pointer-events-none absolute -left-52 top-40 h-96 w-96 rounded-full bg-[#DDE8E3]/45 blur-3xl" />
        <div className="pointer-events-none absolute -right-56 top-[520px] h-[420px] w-[420px] rounded-full border border-[#DCE5E1]/60 bg-white/15" />
        {errore && (
          <div className="mb-5 rounded-2xl border border-[#E9D1CD] bg-[#F8ECE9] px-4 py-4 text-sm font-semibold text-[#9A615A]">
            Errore: {errore}
          </div>
        )}

        {messaggio && (
          <div className="mb-5 rounded-2xl border border-[#CFE0D8] bg-[#EDF5F0] px-4 py-4 text-sm font-semibold text-[#55766D]">
            {messaggio}
          </div>
        )}

        <section className="relative z-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#89A39D]">
            1. Servizio
          </p>

          <h3 className="mt-1 font-serif text-2xl font-medium tracking-[-0.025em] text-[#20383B]">
            Cosa vuoi prenotare?
          </h3>

          {caricamentoTipi ? (
            <p className="mt-4 text-sm font-medium text-[#7E8F8B]">
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
                    className={`group relative overflow-hidden rounded-[22px] border p-5 text-left transition duration-300 hover:-translate-y-1 ${
                      attivo
                        ? "border-[#8FB8B2]"
                        : "border-[#D9E2DF] hover:border-[#BFD0CB]"
                    }`}
                    style={{
                      background: attivo
                        ? "linear-gradient(145deg, #FFFFFF 0%, #EDF3F0 100%)"
                        : "linear-gradient(145deg, #FBFAF7 0%, #F5F2EC 100%)",
                      boxShadow: attivo
                        ? "0 18px 42px rgba(111,145,139,.12)"
                        : "0 14px 32px rgba(80,108,105,.05)",
                    }}
                  >
                    <div
                      className={`absolute inset-x-0 top-0 h-1 ${
                        attivo
                          ? "bg-[#7FA39A]"
                          : "bg-[#DCE6E2]"
                      }`}
                    />

                    <div className="flex items-start justify-between gap-3">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                          attivo
                            ? "bg-[#7FA39A] text-white"
                            : "bg-[#EDF3F0] text-[#6F918B]"
                        }`}
                      >
                        <IconaCalendario />
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-semibold ${
                          attivo
                            ? "bg-[#506C69] text-white"
                            : "bg-[#EEF3F1] text-[#738682]"
                        }`}
                      >
                        {tipo.durata_minuti} min
                      </span>
                    </div>

                    <h4 className="mt-4 font-serif text-lg font-medium tracking-[-0.015em] text-[#20383B]">
                      {tipo.nome}
                    </h4>

                    {tipo.descrizione && (
                      <p className="mt-2 min-h-[48px] text-sm leading-6 text-[#7E8F8B]">
                        {tipo.descrizione}
                      </p>
                    )}

                    <div className="mt-4 flex items-center justify-between">
                      <span
                        className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${
                          attivo
                            ? "text-[#6F918B]"
                            : "text-[#86928F]"
                        }`}
                      >
                        {attivo ? "Selezionato" : "Seleziona"}
                      </span>

                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                          attivo
                            ? "bg-[#7FA39A] text-white"
                            : "bg-[#EDF3F0] text-[#6F918B]"
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

        <section className="relative z-10 mt-10 rounded-[24px] border border-[#D9E2DF] bg-[#FBFAF7] p-5 shadow-[0_12px_30px_rgba(80,108,105,.05)] sm:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#89A39D]">
            2. Giorno
          </p>

          <h3 className="mt-1 font-serif text-2xl font-medium tracking-[-0.025em] text-[#20383B]">
            Scegli la data.
          </h3>

          {caricamentoSlot ? (
            <p className="mt-4 text-sm font-medium text-[#7E8F8B]">
              Caricamento disponibilità...
            </p>
          ) : !tipoId ? (
            <div className="mt-4 rounded-2xl border border-[#D9E2DF] bg-[#F3F5F2] p-5 text-sm font-medium text-[#7E8F8B]">
              Seleziona prima il servizio che vuoi prenotare.
            </div>
          ) : dateDisponibili.length > 0 ? (
            <div className="mt-5 max-w-xl rounded-[20px] border border-[#D9E2DF] bg-[#F3F5F2] p-5">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#20383B]">
                  Data disponibile
                </span>

                <select
                  value={dataSelezionata}
                  onChange={(evento) => {
                    setDataSelezionata(evento.target.value);
                    setSlotId(null);
                  }}
                  className="w-full rounded-xl border border-[#D4DFDB] bg-white px-4 py-3.5 text-base font-semibold text-[#506C69] outline-none transition focus:border-[#8FB8B2]"
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
            <div className="mt-4 rounded-2xl border border-[#D9E2DF] bg-[#F3F5F2] p-5 text-sm font-medium text-[#7E8F8B]">
              Nessuna data disponibile per questo
              servizio.
            </div>
          )}
        </section>

        <section className="relative z-10 mt-6 rounded-[24px] border border-[#D9E2DF] bg-[#FBFAF7] p-5 shadow-[0_12px_30px_rgba(80,108,105,.05)] sm:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#89A39D]">
            3. Orario
          </p>

          <h3 className="mt-1 font-serif text-2xl font-medium tracking-[-0.025em] text-[#20383B]">
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
                    className={`rounded-2xl border-2 px-3 py-4 text-sm font-semibold transition ${
                      occupato
                        ? "cursor-not-allowed border-[#E9D1CD] bg-[#F6E8E5] text-[#A6655D]"
                        : selezionato
                        ? "border-[#7FA39A] bg-[#7FA39A] text-white"
                        : "border-[#DCE8E9] bg-white text-[#506C69] hover:border-[#8FB8B2]"
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
            <p className="mt-4 text-sm font-medium text-[#7E8F8B]">
              {!tipoId
                ? "Seleziona prima un servizio."
                : dateDisponibili.length === 0
                ? "Non ci sono orari disponibili per questo servizio."
                : "Seleziona una data disponibile."}
            </p>
          )}
        </section>

        <section className="relative z-10 mt-8 rounded-[24px] border border-[#D9E2DF] bg-[#FBFAF7] p-5 shadow-[0_12px_30px_rgba(80,108,105,.05)] sm:p-7">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#89A39D]">
            4. I tuoi dati
          </p>

          <h3 className="mt-1 font-serif text-2xl font-medium tracking-[-0.025em] text-[#20383B]">
            Completa la prenotazione.
          </h3>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-semibold">
                Nome e cognome *
              </span>

              <input
                type="text"
                value={nome}
                onChange={(evento) =>
                  setNome(evento.target.value)
                }
                className="w-full rounded-xl border border-[#D4DFDB] bg-white px-4 py-3 text-[#20383B] outline-none transition focus:border-[#8FB8B2]"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-semibold">
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
                className="w-full rounded-xl border border-[#D4DFDB] bg-white px-4 py-3 text-[#20383B] outline-none transition focus:border-[#8FB8B2]"
              />
            </label>

            <label className="sm:col-span-2">
              <span className="mb-2 block text-sm font-semibold">
                Email
              </span>

              <input
                type="email"
                value={email}
                onChange={(evento) =>
                  setEmail(evento.target.value)
                }
                className="w-full rounded-xl border border-[#D4DFDB] bg-white px-4 py-3 text-[#20383B] outline-none transition focus:border-[#8FB8B2]"
              />
            </label>

            <label className="sm:col-span-2">
              <span className="mb-2 block text-sm font-semibold">
                Note
              </span>

              <textarea
                rows={4}
                value={note}
                onChange={(evento) =>
                  setNote(evento.target.value)
                }
                className="w-full resize-none rounded-xl border border-[#D4DFDB] bg-white px-4 py-3 text-[#20383B] outline-none transition focus:border-[#8FB8B2]"
              />
            </label>
          </div>

          <div className="mt-6 rounded-2xl border border-[#D9E2DF] bg-[#F3F5F2] p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#89A39D]">
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
            className="relative z-20 mt-6 flex min-h-[56px] w-full items-center justify-center rounded-xl px-5 py-4 text-sm font-semibold shadow-[0_8px_20px_rgba(80,108,105,.12)] transition hover:bg-[#6F918B] disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              backgroundColor: "#7FA39A",
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

      <BottomNav active="prenota" />
    </main>
  );
}
