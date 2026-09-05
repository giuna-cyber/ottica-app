"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Tipo = {
  id: number;
  nome: string;
  durata_minuti: number;
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

export default function AdminSlotPage() {
  const router = useRouter();

  const [tipi, setTipi] = useState<Tipo[]>([]);
  const [slot, setSlot] = useState<Slot[]>([]);
  const [tipoId, setTipoId] = useState<number | null>(null);
  const [data, setData] = useState("");
  const [oraInizio, setOraInizio] = useState("09:00");
  const [oraFine, setOraFine] = useState("13:00");
  const [errore, setErrore] = useState("");
  const [messaggio, setMessaggio] = useState("");

  useEffect(() => {
    if (!sessionStorage.getItem("ottica_admin")) {
      router.replace("/login");
      return;
    }

    const oggi = new Date();
    setData(oggi.toISOString().slice(0, 10));

    caricaTipi();
    caricaSlot();
  }, [router]);

  async function caricaTipi() {
    const r = await fetch("/api/appuntamenti/tipi", {
      cache: "no-store",
    });

    const d = await r.json();

    if (d.ok) {
      setTipi(d.tipi ?? []);

      if ((d.tipi ?? []).length > 0) {
        setTipoId(d.tipi[0].id);
      }
    }
  }

  async function caricaSlot() {
    const r = await fetch("/api/admin/slot", {
      cache: "no-store",
    });

    const d = await r.json();

    if (d.ok) {
      setSlot(d.slot ?? []);
    } else {
      setErrore(d.errore || "Errore caricamento slot.");
    }
  }

  const tipoSelezionato = useMemo(
    () => tipi.find((t) => t.id === tipoId) ?? null,
    [tipi, tipoId]
  );

  async function azione(corpo: Record<string, unknown>) {
    setErrore("");
    setMessaggio("");

    const r = await fetch("/api/admin/slot", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(corpo),
    });

    const d = await r.json();

    if (!r.ok || !d.ok) {
      setErrore(d.errore || "Operazione non riuscita.");
      return;
    }

    setMessaggio(d.messaggio || "Operazione completata.");
    await caricaSlot();
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
              Disponibilità
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
          <h2 className="text-2xl font-black">
            Crea disponibilità
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label>
              <span className="mb-2 block text-sm font-black">
                Servizio
              </span>
              <select
                value={tipoId ?? ""}
                onChange={(e) => setTipoId(Number(e.target.value))}
                className="w-full rounded-xl border border-[#C9DADC] px-4 py-3"
              >
                {tipi.map((t) => (
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

            <label>
              <span className="mb-2 block text-sm font-black">
                Ora inizio
              </span>
              <input
                type="time"
                value={oraInizio}
                onChange={(e) => setOraInizio(e.target.value)}
                className="w-full rounded-xl border border-[#C9DADC] px-4 py-3"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-black">
                Ora fine
              </span>
              <input
                type="time"
                value={oraFine}
                onChange={(e) => setOraFine(e.target.value)}
                className="w-full rounded-xl border border-[#C9DADC] px-4 py-3"
              />
            </label>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() =>
                azione({
                  azione: "crea",
                  tipo_appuntamento_id: tipoId,
                  data_appuntamento: data,
                  ora_inizio: oraInizio,
                  ora_fine: oraFine,
                })
              }
              className="rounded-2xl border border-[#1D6E7A] px-5 py-4 text-sm font-black text-[#1D6E7A]"
            >
              Crea singolo slot
            </button>

            <button
              type="button"
              onClick={() =>
                azione({
                  azione: "genera",
                  tipo_appuntamento_id: tipoId,
                  data_appuntamento: data,
                  ora_inizio: oraInizio,
                  ora_fine: oraFine,
                  durata_minuti:
                    tipoSelezionato?.durata_minuti ?? 0,
                })
              }
              className="rounded-2xl bg-[linear-gradient(135deg,#083B4C,#1D6E7A)] px-5 py-4 text-sm font-black text-white"
            >
              Genera ogni {tipoSelezionato?.durata_minuti ?? "-"} min
            </button>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-black">
              Slot esistenti
            </h2>

            <button
              type="button"
              onClick={caricaSlot}
              className="rounded-xl bg-[#083B4C] px-4 py-2 text-xs font-black text-white"
            >
              Aggiorna
            </button>
          </div>

          <div className="grid gap-3">
            {slot.map((s) => (
              <article
                key={s.id}
                className="rounded-2xl border border-[#DCE8E9] bg-white p-4 shadow-sm"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-black">
                      {s.tipo_appuntamento}
                    </p>
                    <p className="mt-1 text-sm text-[#60777C]">
                      {s.data_appuntamento} · {s.ora_inizio.slice(0, 5)} - {s.ora_fine.slice(0, 5)}
                    </p>
                    <p className={`mt-2 text-xs font-black ${s.disponibile === 1 ? "text-emerald-700" : "text-red-700"}`}>
                      {s.disponibile === 1 ? "Disponibile" : "Non disponibile"}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        azione({
                          azione: "disponibilita",
                          id: s.id,
                          disponibile: s.disponibile === 1 ? 0 : 1,
                        })
                      }
                      className="rounded-xl border border-[#1D6E7A] px-4 py-2 text-xs font-black text-[#1D6E7A]"
                    >
                      {s.disponibile === 1 ? "Disattiva" : "Riattiva"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("Eliminare questo slot?")) {
                          azione({
                            azione: "elimina",
                            id: s.id,
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
        </div>
      </section>
    </main>
  );
}
