"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errore, setErrore] = useState("");
  const [caricamento, setCaricamento] = useState(false);

  async function eseguiLogin(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    setErrore("");
    setCaricamento(true);

    try {
      const risposta = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const dati = await risposta.json();

      if (!risposta.ok || !dati.ok) {
        throw new Error(
          dati.errore || "Credenziali non valide."
        );
      }

      // Manteniamo questo dato solo per compatibilità con
      // alcune pagine Admin già create. La sicurezza vera
      // è nel cookie HttpOnly impostato dal server.
      sessionStorage.setItem(
        "ottica_admin",
        JSON.stringify(dati.utente)
      );

      router.push("/admin");
      router.refresh();
    } catch (erroreLogin) {
      setErrore(
        erroreLogin instanceof Error
          ? erroreLogin.message
          : "Errore durante il login."
      );
    } finally {
      setCaricamento(false);
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#EEF3F0_0%,#FBFAF7_52%,#F5F2EC_100%)] px-4 py-10 text-[#20383B]">
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center">
        <div className="w-full rounded-[28px] border border-[#D9E2DF] bg-[#FBFAF7] p-6 shadow-[0_18px_50px_rgba(80,108,105,.08)] sm:p-8">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#D4DFDB] bg-white text-[#6F918B] shadow-sm">
              <svg
                viewBox="0 0 32 24"
                className="h-9 w-11"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <ellipse cx="9" cy="13" rx="6" ry="5.5" />
                <ellipse cx="23" cy="13" rx="6" ry="5.5" />
                <path d="M15 12c1-1.6 2-1.6 3 0M3 11 1.5 5M29 11 30.5 5" />
              </svg>
            </div>

            <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#89A39D]">
              Area riservata
            </p>

            <h1 className="mt-2 font-serif text-3xl font-medium tracking-[-0.04em]">
              Accesso Admin
            </h1>

            <p className="mt-2 text-sm leading-6 text-[#7E8F8B]">
              Accedi per gestire appuntamenti, disponibilità e promozioni.
            </p>
          </div>

          {errore && (
            <div className="mt-5 rounded-2xl border border-[#E9D1CD] bg-[#F8ECE9] px-4 py-3 text-sm font-semibold text-[#9A615A]">
              {errore}
            </div>
          )}

          <form onSubmit={eseguiLogin} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">
                Username
              </span>

              <input
                type="text"
                value={username}
                onChange={(evento) =>
                  setUsername(evento.target.value)
                }
                autoComplete="username"
                className="w-full rounded-xl border border-[#D4DFDB] bg-white px-4 py-3 text-[#20383B] outline-none transition focus:border-[#8FB8B2]"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold">
                Password
              </span>

              <input
                type="password"
                value={password}
                onChange={(evento) =>
                  setPassword(evento.target.value)
                }
                autoComplete="current-password"
                className="w-full rounded-xl border border-[#D4DFDB] bg-white px-4 py-3 text-[#20383B] outline-none transition focus:border-[#8FB8B2]"
              />
            </label>

            <button
              type="submit"
              disabled={caricamento}
              className="w-full rounded-xl bg-[#7FA39A] px-5 py-4 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(80,108,105,.12)] transition hover:bg-[#6F918B] disabled:opacity-50"
            >
              {caricamento
                ? "Accesso in corso..."
                : "Accedi"}
            </button>
          </form>

          <Link
            href="/"
            className="mt-5 block text-center text-sm font-semibold text-[#6F918B]"
          >
            Torna alla Home
          </Link>
        </div>
      </div>
    </main>
  );
}
