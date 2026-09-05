"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function RecuperaPasswordPage() {
  const [email, setEmail] = useState("");
  const [errore, setErrore] = useState("");
  const [messaggio, setMessaggio] = useState("");
  const [caricamento, setCaricamento] = useState(false);

  async function invia(evento: FormEvent) {
    evento.preventDefault();
    setErrore("");
    setMessaggio("");

    if (!email.trim()) {
      setErrore("Inserisci la tua email.");
      return;
    }

    setCaricamento(true);

    try {
      const risposta = await fetch("/api/cliente/recupera-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
        }),
      });

      const dati = await risposta.json();

      if (!risposta.ok || !dati.ok) {
        throw new Error(
          dati.errore || "Impossibile recuperare la password."
        );
      }

      setMessaggio(
        dati.messaggio ||
          "Ti abbiamo inviato una password temporanea via email."
      );
      setEmail("");
    } catch (e) {
      setErrore(
        e instanceof Error
          ? e.message
          : "Impossibile recuperare la password."
      );
    } finally {
      setCaricamento(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F5F9F9] text-[#102A2E]">
      <header className="bg-[linear-gradient(135deg,#083B4C,#1D6E7A)] text-white">
        <div className="mx-auto max-w-xl px-4 py-8">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#D8F4F7]">
            Area cliente
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.05em]">
            Recupera password
          </h1>
          <p className="mt-3 text-sm leading-6 text-white/75">
            Inserisci l&apos;email usata per il tuo account.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-xl px-4 py-8">
        <div className="rounded-3xl border border-[#DCE8E9] bg-white p-5 shadow-sm sm:p-6">
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

          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEF6F6] text-2xl">
            ✉️
          </div>

          <h2 className="text-2xl font-black">
            Ricevi una nuova password
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#60777C]">
            Ti invieremo una password temporanea all&apos;indirizzo email
            associato al tuo account. Dopo l&apos;accesso potrai cambiarla
            dal profilo.
          </p>

          <form onSubmit={invia} className="mt-6 grid gap-4">
            <label>
              <span className="mb-2 block text-sm font-black">
                Email *
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@email.it"
                autoComplete="email"
                className="w-full rounded-xl border border-[#C9DADC] px-4 py-3 outline-none focus:border-[#1D6E7A]"
              />
            </label>

            <button
              type="submit"
              disabled={caricamento}
              className="rounded-2xl bg-[linear-gradient(135deg,#083B4C,#1D6E7A)] px-5 py-4 text-sm font-black text-white disabled:opacity-50"
            >
              {caricamento
                ? "Invio in corso..."
                : "Invia password temporanea"}
            </button>
          </form>

          <Link
            href="/profilo"
            className="mt-4 flex w-full items-center justify-center rounded-2xl border border-[#BFD9DD] bg-white px-5 py-4 text-sm font-black text-[#1D6E7A]"
          >
            ← Torna all&apos;accesso
          </Link>
        </div>
      </section>
    </main>
  );
}
