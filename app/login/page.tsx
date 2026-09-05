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
    <main className="min-h-screen bg-[linear-gradient(135deg,#083B4C_0%,#1D6E7A_60%,#A9D6DE_100%)] px-4 py-10 text-[#102A2E]">
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center">
        <div className="w-full rounded-[28px] bg-white p-6 shadow-2xl sm:p-8">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#083B4C] text-3xl text-white">
              👓
            </div>

            <p className="mt-5 text-[10px] font-black uppercase tracking-[0.24em] text-[#5D858C]">
              Area riservata
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-[-0.04em]">
              Accesso Admin
            </h1>

            <p className="mt-2 text-sm leading-6 text-[#6D8287]">
              Accedi per gestire appuntamenti, disponibilità e promozioni.
            </p>
          </div>

          {errore && (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-700">
              {errore}
            </div>
          )}

          <form onSubmit={eseguiLogin} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-black">
                Username
              </span>

              <input
                type="text"
                value={username}
                onChange={(evento) =>
                  setUsername(evento.target.value)
                }
                autoComplete="username"
                className="w-full rounded-xl border border-[#C9DADC] px-4 py-3 outline-none focus:border-[#1D6E7A]"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-black">
                Password
              </span>

              <input
                type="password"
                value={password}
                onChange={(evento) =>
                  setPassword(evento.target.value)
                }
                autoComplete="current-password"
                className="w-full rounded-xl border border-[#C9DADC] px-4 py-3 outline-none focus:border-[#1D6E7A]"
              />
            </label>

            <button
              type="submit"
              disabled={caricamento}
              className="w-full rounded-2xl bg-[linear-gradient(135deg,#083B4C,#1D6E7A)] px-5 py-4 text-sm font-black text-white shadow-lg disabled:opacity-50"
            >
              {caricamento
                ? "Accesso in corso..."
                : "Accedi"}
            </button>
          </form>

          <Link
            href="/"
            className="mt-5 block text-center text-sm font-black text-[#1D6E7A]"
          >
            Torna alla Home
          </Link>
        </div>
      </div>
    </main>
  );
}
