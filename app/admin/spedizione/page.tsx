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
    <main className="min-h-screen bg-[#F6F4EF] pb-10 text-[#20383B]">
      <header className="bg-[linear-gradient(135deg,#506C69,#7FA39A)] text-white">
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
          <div className="mb-4 rounded-2xl border border-[#E9D1CD] bg-[#F8ECE9] p-4 text-sm font-semibold text-[#9A615A]">
            {errore}
          </div>
        )}

        {messaggio && (
          <div className="mb-4 rounded-2xl border border-[#CFE0D8] bg-[#EDF5F0] p-4 text-sm font-semibold text-[#55766D]">
            {messaggio}
          </div>
        )}

        <div className="rounded-[24px] border border-[#D9E2DF] bg-[#FBFAF7] p-5 shadow-[0_12px_30px_rgba(80,108,105,.05)] sm:p-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#89A39D]">
              Configurazione
            </p>
            <h2 className="mt-1 font-serif text-2xl font-medium tracking-[-0.025em]">
              Regole di spedizione
            </h2>
          </div>

          {caricamento ? (
            <div className="mt-6 rounded-2xl bg-[#F3F5F2] p-6 text-center font-medium text-[#7E8F8B]">
              Caricamento impostazioni...
            </div>
          ) : (
            <>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label>
                  <span className="mb-2 block text-sm font-semibold text-[#20383B]">
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
                    className="w-full rounded-xl border border-[#D4DFDB] bg-white px-4 py-3 text-[#20383B] outline-none transition focus:border-[#8FB8B2]"
                  />

                  <p className="mt-2 text-xs leading-5 text-[#8B9C98]">
                    Importo applicato quando l'ordine non raggiunge
                    la soglia gratuita.
                  </p>
                </label>

                <label>
                  <span className="mb-2 block text-sm font-semibold text-[#20383B]">
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
                    className="w-full rounded-xl border border-[#D4DFDB] bg-white px-4 py-3 text-[#20383B] outline-none transition focus:border-[#8FB8B2]"
                  />

                  <p className="mt-2 text-xs leading-5 text-[#8B9C98]">
                    La soglia viene calcolata sul totale prodotti dopo
                    eventuali promozioni.
                  </p>
                </label>
              </div>

              <div className="mt-6 rounded-[20px] border border-[#D9E2DF] bg-[#F3F5F2] p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#89A39D]">
                  Regola attuale
                </p>

                <p className="mt-2 font-serif text-lg font-medium">
                  Ordini inferiori a {euro(sogliaNumero)}
                </p>

                <p className="mt-1 text-sm text-[#738682]">
                  Spedizione:{" "}
                  <strong>{euro(costoNumero)}</strong>
                </p>

                <div className="mt-4 border-t border-[#D9E2DF] pt-4">
                  <p className="font-serif text-lg font-medium text-[#55766D]">
                    Ordini da {euro(sogliaNumero)} in su
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#55766D]">
                    Spedizione gratuita
                  </p>
                </div>

                <p className="mt-4 text-xs leading-5 text-[#8B9C98]">
                  Il ritiro in negozio resta sempre gratuito.
                </p>
              </div>

              <button
                type="button"
                onClick={salva}
                disabled={salvataggio}
                className="mt-6 w-full rounded-xl bg-[#7FA39A] px-5 py-4 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(80,108,105,.12)] transition hover:bg-[#6F918B] disabled:opacity-50"
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
