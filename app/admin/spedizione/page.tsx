"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function euro(valore: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(valore);
}

export default function AdminSpedizionePage() {
  const router = useRouter();

  const [costoSpedizione, setCostoSpedizione] = useState("7.90");
  const [sogliaGratis, setSogliaGratis] = useState("50.00");

  const [caricamento, setCaricamento] = useState(true);
  const [salvataggio, setSalvataggio] = useState(false);
  const [errore, setErrore] = useState("");
  const [messaggio, setMessaggio] = useState("");

  useEffect(() => {
    caricaImpostazioni();
  }, []);

  async function caricaImpostazioni() {
    setCaricamento(true);
    setErrore("");

    try {
      const risposta = await fetch("/api/admin/spedizione", {
        cache: "no-store",
      });

      if (risposta.status === 401) {
        router.replace("/login");
        return;
      }

      const dati = await risposta.json();

      if (!risposta.ok || !dati.ok) {
        throw new Error(
          dati.errore || "Impossibile caricare le impostazioni."
        );
      }

      setCostoSpedizione(
        Number(dati.impostazioni?.costo_spedizione ?? 7.9).toFixed(2)
      );

      setSogliaGratis(
        Number(
          dati.impostazioni?.soglia_spedizione_gratuita ?? 50
        ).toFixed(2)
      );
    } catch (e) {
      setErrore(
        e instanceof Error
          ? e.message
          : "Impossibile caricare le impostazioni."
      );
    } finally {
      setCaricamento(false);
    }
  }

  async function salva() {
    setSalvataggio(true);
    setErrore("");
    setMessaggio("");

    try {
      const costo = Number(costoSpedizione);
      const soglia = Number(sogliaGratis);

      if (!Number.isFinite(costo) || costo < 0) {
        throw new Error("Inserisci un costo di spedizione valido.");
      }

      if (!Number.isFinite(soglia) || soglia < 0) {
        throw new Error("Inserisci una soglia gratuita valida.");
      }

      const risposta = await fetch("/api/admin/spedizione", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          costo_spedizione: costo,
          soglia_spedizione_gratuita: soglia,
        }),
      });

      if (risposta.status === 401) {
        router.replace("/login");
        return;
      }

      const dati = await risposta.json();

      if (!risposta.ok || !dati.ok) {
        throw new Error(
          dati.errore || "Salvataggio non riuscito."
        );
      }

      setCostoSpedizione(
        Number(
          dati.impostazioni?.costo_spedizione ?? costo
        ).toFixed(2)
      );

      setSogliaGratis(
        Number(
          dati.impostazioni?.soglia_spedizione_gratuita ?? soglia
        ).toFixed(2)
      );

      setMessaggio("Impostazioni di spedizione aggiornate.");
    } catch (e) {
      setErrore(
        e instanceof Error
          ? e.message
          : "Salvataggio non riuscito."
      );
    } finally {
      setSalvataggio(false);
    }
  }

  const costoNumero = Number(costoSpedizione || 0);
  const sogliaNumero = Number(sogliaGratis || 0);

  return (
    <main className="min-h-screen bg-[#F5F9F9] pb-10 text-[#102A2E]">
      <header className="bg-[linear-gradient(135deg,#083B4C,#1D6E7A)] text-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-6 sm:px-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#CBEDEF]">
              Area amministrativa
            </p>
            <h1 className="mt-1 text-3xl font-black">
              Spedizione
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

      <section className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
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

        <div className="rounded-3xl border border-[#DCE8E9] bg-white p-5 shadow-sm sm:p-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#5D858C]">
              Configurazione
            </p>
            <h2 className="mt-1 text-2xl font-black">
              Regole di spedizione
            </h2>
          </div>

          {caricamento ? (
            <div className="mt-6 rounded-2xl bg-[#F8FBFB] p-6 text-center font-black text-[#6D8287]">
              Caricamento impostazioni...
            </div>
          ) : (
            <>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label>
                  <span className="mb-2 block text-sm font-black">
                    Costo spedizione €
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={costoSpedizione}
                    onChange={(e) =>
                      setCostoSpedizione(e.target.value)
                    }
                    className="w-full rounded-xl border border-[#C9DADC] px-4 py-3"
                  />

                  <p className="mt-2 text-xs leading-5 text-[#789095]">
                    Importo applicato quando l'ordine non raggiunge
                    la soglia gratuita.
                  </p>
                </label>

                <label>
                  <span className="mb-2 block text-sm font-black">
                    Spedizione gratuita da €
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={sogliaGratis}
                    onChange={(e) =>
                      setSogliaGratis(e.target.value)
                    }
                    className="w-full rounded-xl border border-[#C9DADC] px-4 py-3"
                  />

                  <p className="mt-2 text-xs leading-5 text-[#789095]">
                    La soglia viene calcolata sul totale prodotti dopo
                    eventuali promozioni.
                  </p>
                </label>
              </div>

              <div className="mt-6 rounded-2xl border border-[#DCE8E9] bg-[#F8FBFB] p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#789095]">
                  Regola attuale
                </p>

                <p className="mt-2 text-lg font-black">
                  Ordini inferiori a {euro(sogliaNumero)}
                </p>

                <p className="mt-1 text-sm text-[#60777C]">
                  Spedizione:{" "}
                  <strong>{euro(costoNumero)}</strong>
                </p>

                <div className="mt-4 border-t border-[#DCE8E9] pt-4">
                  <p className="text-lg font-black text-emerald-700">
                    Ordini da {euro(sogliaNumero)} in su
                  </p>

                  <p className="mt-1 text-sm font-black text-emerald-700">
                    Spedizione gratuita
                  </p>
                </div>

                <p className="mt-4 text-xs leading-5 text-[#789095]">
                  Il ritiro in negozio resta sempre gratuito.
                </p>
              </div>

              <button
                type="button"
                onClick={salva}
                disabled={salvataggio}
                className="mt-6 w-full rounded-2xl bg-[linear-gradient(135deg,#083B4C,#1D6E7A)] px-5 py-4 text-sm font-black text-white shadow-lg disabled:opacity-50"
              >
                {salvataggio
                  ? "Salvataggio..."
                  : "Salva impostazioni"}
              </button>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
