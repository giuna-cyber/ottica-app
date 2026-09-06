"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Tipo = {
  id: number;
  nome: string;
  descrizione: string | null;
  durata_minuti: number;
  attivo: number;
};

type Slot = {
  id: number;
  tipo_appuntamento_id: number;
  data_appuntamento: string;
  ora_inizio: string;
  ora_fine: string;
  disponibile: number;
  tipo_appuntamento: string;
};

function dataIt(data: string) {
  const [a, m, g] = data.split("-");
  if (!a || !m || !g) return data;

  const d = new Date(Number(a), Number(m) - 1, Number(g));

  return new Intl.DateTimeFormat("it-IT", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(d);
}

export default function AdminSlotPage() {
  const router = useRouter();

  const [tipi, setTipi] = useState<Tipo[]>([]);
  const [slot, setSlot] = useState<Slot[]>([]);
  const [tipoId, setTipoId] = useState<number | null>(null);
  const [data, setData] = useState("");
  const [giornoVisualizzato, setGiornoVisualizzato] = useState("");
  const [oraInizio, setOraInizio] = useState("09:00");
  const [oraFine, setOraFine] = useState("13:00");

  const [nuovoNome, setNuovoNome] = useState("");
  const [nuovaDurata, setNuovaDurata] = useState("30");
  const [nuovaDescrizione, setNuovaDescrizione] = useState("");

  const [modificaId, setModificaId] = useState<number | null>(null);
  const [modificaNome, setModificaNome] = useState("");
  const [modificaDurata, setModificaDurata] = useState("");
  const [modificaDescrizione, setModificaDescrizione] = useState("");

  const [selezionati, setSelezionati] = useState<number[]>([]);
  const [errore, setErrore] = useState("");
  const [messaggio, setMessaggio] = useState("");
  const [operazione, setOperazione] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem("ottica_admin")) {
      router.replace("/login");
      return;
    }

    const oggi = new Date();
    const locale = new Date(
      oggi.getTime() - oggi.getTimezoneOffset() * 60000
    )
      .toISOString()
      .slice(0, 10);

    setData(locale);
    setGiornoVisualizzato(locale);

    caricaTipi();
    caricaSlot();
  }, [router]);

  async function caricaTipi() {
    try {
      const r = await fetch("/api/admin/tipi-appuntamento", {
        cache: "no-store",
      });

      const d = await r.json();

      if (!r.ok || !d.ok) {
        throw new Error(d.errore || "Errore caricamento tipi.");
      }

      const elenco = (d.tipi ?? []) as Tipo[];
      setTipi(elenco);

      const attivi = elenco.filter((t) => Number(t.attivo) === 1);

      setTipoId((corrente) => {
        if (
          corrente &&
          attivi.some((t) => Number(t.id) === Number(corrente))
        ) {
          return corrente;
        }

        return attivi.length > 0 ? Number(attivi[0].id) : null;
      });
    } catch (e) {
      setErrore(
        e instanceof Error ? e.message : "Errore caricamento tipi."
      );
    }
  }

  async function caricaSlot() {
    try {
      const r = await fetch("/api/admin/slot", {
        cache: "no-store",
      });

      const d = await r.json();

      if (!r.ok || !d.ok) {
        throw new Error(d.errore || "Errore caricamento slot.");
      }

      setSlot(d.slot ?? []);
      setSelezionati([]);
    } catch (e) {
      setErrore(
        e instanceof Error ? e.message : "Errore caricamento slot."
      );
    }
  }

  const tipiAttivi = useMemo(
    () => tipi.filter((t) => Number(t.attivo) === 1),
    [tipi]
  );

  const tipoSelezionato = useMemo(
    () => tipi.find((t) => Number(t.id) === Number(tipoId)) ?? null,
    [tipi, tipoId]
  );

  const slotDelGiorno = useMemo(() => {
    return [...slot]
      .filter((s) => s.data_appuntamento === giornoVisualizzato)
      .sort((a, b) => a.ora_inizio.localeCompare(b.ora_inizio));
  }, [slot, giornoVisualizzato]);

  function cambiaGiorno(delta: number) {
    if (!giornoVisualizzato) return;

    const d = new Date(`${giornoVisualizzato}T12:00:00`);
    d.setDate(d.getDate() + delta);

    const locale = new Date(
      d.getTime() - d.getTimezoneOffset() * 60000
    )
      .toISOString()
      .slice(0, 10);

    setGiornoVisualizzato(locale);
  }

  function selezionaTuttiGiorno() {
    const ids = slotDelGiorno.map((s) => s.id);
    const tuttiSelezionati =
      ids.length > 0 && ids.every((id) => selezionati.includes(id));

    setSelezionati((correnti) => {
      if (tuttiSelezionati) {
        return correnti.filter((id) => !ids.includes(id));
      }

      return Array.from(new Set([...correnti, ...ids]));
    });
  }

  function seleziona(id: number) {
    setSelezionati((correnti) =>
      correnti.includes(id)
        ? correnti.filter((x) => x !== id)
        : [...correnti, id]
    );
  }

  async function azioneSlot(corpo: Record<string, unknown>) {
    setOperazione(true);
    setErrore("");
    setMessaggio("");

    try {
      const r = await fetch("/api/admin/slot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(corpo),
      });

      const d = await r.json();

      if (!r.ok || !d.ok) {
        throw new Error(d.errore || "Operazione non riuscita.");
      }

      setMessaggio(d.messaggio || "Operazione completata.");
      await caricaSlot();
    } catch (e) {
      setErrore(
        e instanceof Error ? e.message : "Operazione non riuscita."
      );
    } finally {
      setOperazione(false);
    }
  }

  async function azioneTipo(corpo: Record<string, unknown>) {
    setOperazione(true);
    setErrore("");
    setMessaggio("");

    try {
      const r = await fetch("/api/admin/tipi-appuntamento", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(corpo),
      });

      const d = await r.json();

      if (!r.ok || !d.ok) {
        throw new Error(d.errore || "Operazione non riuscita.");
      }

      setMessaggio(d.messaggio || "Operazione completata.");
      setNuovoNome("");
      setNuovaDescrizione("");
      setNuovaDurata("30");
      setModificaId(null);

      await caricaTipi();
      await caricaSlot();
    } catch (e) {
      setErrore(
        e instanceof Error ? e.message : "Operazione non riuscita."
      );
    } finally {
      setOperazione(false);
    }
  }

  function apriModifica(tipo: Tipo) {
    setModificaId(tipo.id);
    setModificaNome(tipo.nome);
    setModificaDurata(String(tipo.durata_minuti));
    setModificaDescrizione(tipo.descrizione ?? "");
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#F5F9F9] pb-12 text-[#102A2E]">
      <header className="bg-[linear-gradient(135deg,#083B4C,#1D6E7A)] text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#CBEDEF]">
              Area amministrativa
            </p>
            <h1 className="mt-1 break-words text-2xl font-black leading-tight sm:text-3xl">
              Disponibilità e servizi
            </h1>
          </div>

          <Link
            href="/admin"
            className="shrink-0 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-black"
          >
            Dashboard
          </Link>
        </div>
      </header>

      <section className="mx-auto w-full max-w-7xl px-2.5 py-5 sm:px-6 sm:py-6">
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

        <div className="grid w-full min-w-0 grid-cols-1 gap-5 xl:grid-cols-[390px_minmax(0,1fr)] xl:gap-6">
          <aside className="min-w-0 space-y-6">
            <div className="min-w-0 overflow-hidden rounded-3xl border border-[#DCE8E9] bg-white p-4 shadow-sm sm:p-5">
              <div className="flex min-w-0 flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#5D858C]">
                    Configurazione
                  </p>
                  <h2 className="mt-1 break-words text-xl font-black leading-tight sm:text-2xl">
                    Tipi di appuntamento
                  </h2>
                </div>
                <span className="rounded-full bg-[#EAF4F5] px-3 py-1 text-xs font-black text-[#1D6E7A]">
                  {tipi.length}
                </span>
              </div>

              <div className="mt-5 grid min-w-0 gap-3">
                <input
                  value={nuovoNome}
                  onChange={(e) => setNuovoNome(e.target.value)}
                  placeholder="Nome servizio"
                  className="min-w-0 w-full rounded-xl border border-[#C9DADC] px-4 py-3"
                />

                <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_120px]">
                  <input
                    value={nuovaDescrizione}
                    onChange={(e) => setNuovaDescrizione(e.target.value)}
                    placeholder="Descrizione"
                    className="min-w-0 w-full rounded-xl border border-[#C9DADC] px-4 py-3"
                  />

                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={nuovaDurata}
                    onChange={(e) => setNuovaDurata(e.target.value)}
                    className="rounded-xl border border-[#C9DADC] px-3 py-3"
                    aria-label="Durata minuti"
                  />
                </div>

                <button
                  type="button"
                  disabled={operazione || !nuovoNome.trim()}
                  onClick={() =>
                    azioneTipo({
                      azione: "crea",
                      nome: nuovoNome,
                      descrizione: nuovaDescrizione,
                      durata_minuti: Number(nuovaDurata),
                    })
                  }
                  className="rounded-2xl bg-[#083B4C] px-4 py-3 text-sm font-black text-white disabled:opacity-40"
                >
                  + Aggiungi tipo
                </button>
              </div>

              <div className="mt-5 grid gap-3">
                {tipi.map((t) => (
                  <div
                    key={t.id}
                    className="min-w-0 overflow-hidden rounded-2xl border border-[#DCE8E9] bg-[#F8FBFB] p-4"
                  >
                    {modificaId === t.id ? (
                      <div className="grid gap-3">
                        <input
                          value={modificaNome}
                          onChange={(e) => setModificaNome(e.target.value)}
                          className="rounded-xl border border-[#C9DADC] bg-white px-3 py-2.5"
                        />

                        <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_110px]">
                          <input
                            value={modificaDescrizione}
                            onChange={(e) =>
                              setModificaDescrizione(e.target.value)
                            }
                            className="rounded-xl border border-[#C9DADC] bg-white px-3 py-2.5"
                          />

                          <input
                            type="number"
                            min="5"
                            step="5"
                            value={modificaDurata}
                            onChange={(e) =>
                              setModificaDurata(e.target.value)
                            }
                            className="rounded-xl border border-[#C9DADC] bg-white px-3 py-2.5"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              azioneTipo({
                                azione: "modifica",
                                id: t.id,
                                nome: modificaNome,
                                descrizione: modificaDescrizione,
                                durata_minuti: Number(modificaDurata),
                              })
                            }
                            className="rounded-xl bg-[#083B4C] px-3 py-2 text-xs font-black text-white"
                          >
                            Salva
                          </button>

                          <button
                            type="button"
                            onClick={() => setModificaId(null)}
                            className="rounded-xl border border-[#C9DADC] bg-white px-3 py-2 text-xs font-black"
                          >
                            Annulla
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex min-w-0 flex-col items-start gap-3 sm:flex-row sm:justify-between">
                          <div className="min-w-0">
                            <p className="break-words font-black">{t.nome}</p>
                            <p className="mt-1 text-xs font-bold text-[#1D6E7A]">
                              {t.durata_minuti} minuti
                            </p>
                            {t.descrizione && (
                              <p className="mt-1 break-words text-xs text-[#6D8287]">
                                {t.descrizione}
                              </p>
                            )}
                          </div>

                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-black ${
                              Number(t.attivo) === 1
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-neutral-200 text-neutral-600"
                            }`}
                          >
                            {Number(t.attivo) === 1 ? "Attivo" : "Disattivo"}
                          </span>
                        </div>

                        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                          <button
                            type="button"
                            onClick={() => apriModifica(t)}
                            className="w-full rounded-xl border border-[#1D6E7A] px-3 py-2 text-[11px] font-black text-[#1D6E7A]"
                          >
                            Modifica
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              azioneTipo({
                                azione: "stato",
                                id: t.id,
                                attivo: Number(t.attivo) === 1 ? 0 : 1,
                              })
                            }
                            className="w-full rounded-xl border border-[#C9DADC] bg-white px-3 py-2 text-[11px] font-black"
                          >
                            {Number(t.attivo) === 1
                              ? "Disattiva"
                              : "Riattiva"}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              azioneTipo({
                                azione: "elimina",
                                id: t.id,
                              })
                            }
                            className="w-full rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-black text-red-700"
                          >
                            Elimina
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="min-w-0 overflow-hidden rounded-3xl border border-[#DCE8E9] bg-white p-4 shadow-sm sm:p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#5D858C]">
                Nuova disponibilità
              </p>
              <h2 className="mt-1 break-words text-xl font-black leading-tight sm:text-2xl">
                Genera orari
              </h2>

              <div className="mt-5 grid gap-4">
                <label>
                  <span className="mb-2 block text-sm font-black">
                    Servizio
                  </span>
                  <select
                    value={tipoId ?? ""}
                    onChange={(e) => setTipoId(Number(e.target.value))}
                    className="w-full rounded-xl border border-[#C9DADC] px-4 py-3"
                  >
                    {tipiAttivi.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nome} ({t.durata_minuti} min)
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span className="mb-2 block text-sm font-black">
                    Data
                  </span>
                  <input
                    type="date"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    className="w-full rounded-xl border border-[#C9DADC] px-4 py-3"
                  />
                </label>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label>
                    <span className="mb-2 block text-sm font-black">
                      Dalle
                    </span>
                    <input
                      type="time"
                      value={oraInizio}
                      onChange={(e) => setOraInizio(e.target.value)}
                      className="w-full rounded-xl border border-[#C9DADC] px-3 py-3"
                    />
                  </label>

                  <label>
                    <span className="mb-2 block text-sm font-black">
                      Alle
                    </span>
                    <input
                      type="time"
                      value={oraFine}
                      onChange={(e) => setOraFine(e.target.value)}
                      className="w-full rounded-xl border border-[#C9DADC] px-3 py-3"
                    />
                  </label>
                </div>

                <button
                  type="button"
                  disabled={operazione || !tipoId}
                  onClick={() =>
                    azioneSlot({
                      azione: "genera",
                      tipo_appuntamento_id: tipoId,
                      data_appuntamento: data,
                      ora_inizio: oraInizio,
                      ora_fine: oraFine,
                      durata_minuti:
                        tipoSelezionato?.durata_minuti ?? 0,
                    })
                  }
                  className="rounded-2xl bg-[linear-gradient(135deg,#083B4C,#1D6E7A)] px-5 py-4 text-sm font-black text-white disabled:opacity-40"
                >
                  Genera ogni{" "}
                  {tipoSelezionato?.durata_minuti ?? "-"} min
                </button>
              </div>
            </div>
          </aside>

          <div className="min-w-0">
            <div className="min-w-0 rounded-3xl border border-[#DCE8E9] bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#5D858C]">
                      Calendario
                    </p>
                    <h2 className="mt-1 break-words text-xl font-black leading-tight sm:text-2xl">
                      Slot creati
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={caricaSlot}
                    className="self-start rounded-xl bg-[#083B4C] px-4 py-2.5 text-xs font-black text-white"
                  >
                    Aggiorna
                  </button>
                </div>

                <div className="rounded-2xl border border-[#C9DADC] bg-[#F8FBFB] p-3 sm:p-4">
                  <div className="grid min-w-0 grid-cols-[40px_minmax(0,1fr)_40px] items-center gap-2 sm:grid-cols-[44px_minmax(0,1fr)_44px]">
                    <button
                      type="button"
                      onClick={() => cambiaGiorno(-1)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#C9DADC] bg-white text-lg font-black text-[#083B4C] sm:h-11 sm:w-11 sm:text-xl"
                      aria-label="Giorno precedente"
                    >
                      ←
                    </button>

                    <div className="min-w-0 text-center">
                      <p className="truncate text-base font-black capitalize sm:text-lg">
                        {giornoVisualizzato ? dataIt(giornoVisualizzato) : "-"}
                      </p>
                      <input
                        type="date"
                        value={giornoVisualizzato}
                        onChange={(e) => setGiornoVisualizzato(e.target.value)}
                        className="mt-2 w-full max-w-[220px] rounded-xl border border-[#C9DADC] bg-white px-3 py-2 text-center text-sm font-bold"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => cambiaGiorno(1)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#C9DADC] bg-white text-lg font-black text-[#083B4C] sm:h-11 sm:w-11 sm:text-xl"
                      aria-label="Giorno successivo"
                    >
                      →
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={selezionaTuttiGiorno}
                    disabled={slotDelGiorno.length === 0}
                    className="rounded-xl border border-[#C9DADC] bg-white px-3 py-2.5 text-xs font-black disabled:opacity-40"
                  >
                    Seleziona tutti del giorno
                  </button>

                  <button
                    type="button"
                    disabled={operazione || selezionati.length === 0}
                    onClick={() =>
                      azioneSlot({
                        azione: "elimina_multipli",
                        ids: selezionati,
                      })
                    }
                    className="rounded-xl bg-red-600 px-3 py-2.5 text-xs font-black text-white disabled:opacity-35"
                  >
                    Elimina selezionati ({selezionati.length})
                  </button>
                </div>

                {slotDelGiorno.length === 0 ? (
                  <div className="rounded-2xl bg-[#F5F9F9] p-8 text-center">
                    <div className="text-3xl">📅</div>
                    <p className="mt-3 text-sm font-black text-[#506B71]">
                      Nessuno slot per questo giorno
                    </p>
                    <p className="mt-1 text-xs text-[#789095]">
                      Usa le frecce oppure scegli una data dal calendario.
                    </p>
                  </div>
                ) : (
                  <div className="grid min-w-0 grid-cols-1 gap-2 min-[380px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
                    {slotDelGiorno.map((s) => {
                      const selezionato = selezionati.includes(s.id);
                      const libero = Number(s.disponibile) === 1;

                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => seleziona(s.id)}
                          className={`relative min-w-0 overflow-hidden rounded-2xl border p-3 text-left transition ${
                            selezionato
                              ? "border-[#083B4C] bg-[#DCEFF1] ring-2 ring-[#083B4C]/15"
                              : libero
                              ? "border-emerald-200 bg-white"
                              : "border-red-200 bg-red-50"
                          }`}
                        >
                          <span
                            className={`absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded border text-[10px] font-black ${
                              selezionato
                                ? "border-[#083B4C] bg-[#083B4C] text-white"
                                : "border-[#AFC5C8] bg-white text-transparent"
                            }`}
                          >
                            ✓
                          </span>

                          <p className="pr-7 text-lg font-black leading-none">
                            {s.ora_inizio.slice(0, 5)}
                          </p>

                          <p className="mt-1 text-[10px] font-bold text-[#789095]">
                            fino {s.ora_fine.slice(0, 5)}
                          </p>

                          <p className="mt-3 line-clamp-2 break-words text-[10px] font-black leading-4 text-[#1D6E7A]">
                            {s.tipo_appuntamento}
                          </p>

                          <p
                            className={`mt-2 text-[9px] font-black ${
                              libero ? "text-emerald-700" : "text-red-700"
                            }`}
                          >
                            {libero ? "LIBERO" : "NON DISPONIBILE"}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
