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
    <main className="min-h-screen bg-[#F6F4EF] text-[#20383B]">
      <header className="border-b border-[#D9E2DF] bg-[linear-gradient(135deg,#EEF3F0_0%,#FBFAF7_52%,#F5F2EC_100%)] text-[#20383B]">
        <div className="mx-auto max-w-xl px-4 py-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#89A39D]">
            Area cliente
          </p>
          <h1 className="mt-2 font-serif text-4xl font-medium tracking-[-0.05em]">
            Recupera password
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#7E8F8B]">
            Inserisci l&apos;email usata per il tuo account.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-xl px-4 py-8">
        <div className="rounded-[24px] border border-[#D9E2DF] bg-[#FBFAF7] p-5 shadow-[0_12px_30px_rgba(80,108,105,.05)] sm:p-6">
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

          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#D9E2DF] bg-[#EDF3F0] text-[#6F918B]">
            <svg
              viewBox="0 0 24 24"
              className="h-7 w-7"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
            >
              <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
              <path d="m4.5 7 7.5 6 7.5-6" />
            </svg>
          </div>

          <h2 className="font-serif text-2xl font-medium tracking-[-0.025em]">
            Ricevi una nuova password
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#738682]">
            Ti invieremo una password temporanea all&apos;indirizzo email
            associato al tuo account. Dopo l&apos;accesso potrai cambiarla
            dal profilo.
          </p>

          <form onSubmit={invia} className="mt-6 grid gap-4">
            <label>
              <span className="mb-2 block text-sm font-semibold">
                Email *
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@email.it"
                autoComplete="email"
                className="w-full rounded-xl border border-[#D4DFDB] bg-white px-4 py-3 text-[#20383B] outline-none transition placeholder:text-[#9AA9A5] focus:border-[#8FB8B2]"
              />
            </label>

            <button
              type="submit"
              disabled={caricamento}
              className="rounded-xl bg-[#7FA39A] px-5 py-4 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(80,108,105,.12)] transition hover:bg-[#6F918B] disabled:opacity-50"
            >
              {caricamento
                ? "Invio in corso..."
                : "Invia password temporanea"}
            </button>
          </form>

          <Link
            href="/profilo"
            className="mt-4 flex w-full items-center justify-center rounded-xl border border-[#D4DFDB] bg-white px-5 py-4 text-sm font-semibold text-[#6F918B] transition hover:bg-[#EDF3F0]"
          >
            ← Torna all&apos;accesso
          </Link>
        </div>
      </section>
    </main>
  );
}
