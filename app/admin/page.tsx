"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type UtenteAdmin = {
  id: number;
  username: string;
};

export default function AdminPage() {
  const router = useRouter();
  const [utente, setUtente] =
    useState<UtenteAdmin | null>(null);

  useEffect(() => {
    const salvato =
      sessionStorage.getItem("ottica_admin");

    if (salvato) {
      try {
        setUtente(JSON.parse(salvato));
      } catch {
        sessionStorage.removeItem("ottica_admin");
      }
    }
  }, []);

  async function esci() {
    try {
      await fetch("/api/logout", {
        method: "POST",
      });
    } finally {
      sessionStorage.removeItem("ottica_admin");
      router.push("/login");
      router.refresh();
    }
  }

  return (
    <main className="min-h-screen bg-[#F5F9F9] pb-10 text-[#102A2E]">
      <header className="bg-[linear-gradient(135deg,#083B4C,#1D6E7A)] text-white">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#CBEDEF]">
                Area amministrativa
              </p>

              <h1 className="mt-1 text-3xl font-black">
                Dashboard
              </h1>

              {utente && (
                <p className="mt-1 text-sm text-white/75">
                  Accesso: {utente.username}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={esci}
              className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-black"
            >
              Esci
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/admin/appuntamenti"
            className="rounded-3xl border border-[#DCE8E9] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="text-3xl">📅</div>
            <h2 className="mt-4 text-xl font-black">
              Appuntamenti
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#6D8287]">
              Visualizza e gestisci le prenotazioni.
            </p>
          </Link>

          <Link
            href="/admin/slot"
            className="rounded-3xl border border-[#DCE8E9] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="text-3xl">🕒</div>
            <h2 className="mt-4 text-xl font-black">
              Disponibilità
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#6D8287]">
              Gestisci giorni e orari disponibili.
            </p>
          </Link>

          <Link
            href="/admin/promozioni"
            className="rounded-3xl border border-[#DCE8E9] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="text-3xl">🏷️</div>
            <h2 className="mt-4 text-xl font-black">
              Promozioni
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#6D8287]">
              Gestisci le offerte del negozio.
            </p>
          </Link>

          <Link
            href="/admin/catalogo"
            className="rounded-3xl border border-[#DCE8E9] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="text-3xl">👓</div>
            <h2 className="mt-4 text-xl font-black">
              Catalogo
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#6D8287]">
              Aggiungi e modifica i prodotti.
            </p>
          </Link>

          <Link
            href="/admin/ordini-shop"
            className="rounded-3xl border border-[#DCE8E9] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="text-3xl">🛍️</div>
            <h2 className="mt-4 text-xl font-black">
              Ordini Shop
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#6D8287]">
              Gestisci acquisti, pagamenti e consegne.
            </p>
          </Link>

          <Link
            href="/admin/spedizione"
            className="rounded-3xl border border-[#DCE8E9] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="text-3xl">🚚</div>
            <h2 className="mt-4 text-xl font-black">
              Spedizione
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#6D8287]">
              Configura costo e soglia per la spedizione gratuita.
            </p>
          </Link>


          <Link
            href="/admin/negozio"
            className="rounded-3xl border border-[#DCE8E9] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="text-3xl">🏪</div>
            <h2 className="mt-4 text-xl font-black">
              Dati centro ottico
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#6D8287]">
              Configura anagrafica, contatti, WhatsApp e orari del centro ottico.
            </p>
          </Link>
        </div>
      </section>
    </main>
  );
}
