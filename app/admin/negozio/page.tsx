"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type Negozio = {
  nome_negozio: string;
  ragione_sociale: string;
  indirizzo: string;
  cap: string;
  citta: string;
  provincia: string;
  telefono: string;
  whatsapp: string;
  email: string;
  sito_web: string;
  partita_iva: string;
  codice_fiscale: string;
  orari_apertura: string;
  logo_url: string;
};

const vuoto: Negozio = {
  nome_negozio: "",
  ragione_sociale: "",
  indirizzo: "",
  cap: "",
  citta: "",
  provincia: "",
  telefono: "",
  whatsapp: "",
  email: "",
  sito_web: "",
  partita_iva: "",
  codice_fiscale: "",
  orari_apertura: "",
  logo_url: "",
};

export default function AdminNegozioPage() {
  const [dati, setDati] = useState<Negozio>(vuoto);
  const [caricamento, setCaricamento] = useState(true);
  const [salvataggio, setSalvataggio] = useState(false);
  const [errore, setErrore] = useState("");
  const [messaggio, setMessaggio] = useState("");

  useEffect(() => {
    carica();
  }, []);

  async function carica() {
    setCaricamento(true);
    setErrore("");

    try {
      const risposta = await fetch("/api/admin/negozio", {
        cache: "no-store",
      });

      const payload = await risposta.json();

      if (!risposta.ok || !payload.ok) {
        throw new Error(
          payload.errore || "Impossibile caricare i dati del centro ottico."
        );
      }

      setDati({
        ...vuoto,
        ...(payload.negozio ?? {}),
      });
    } catch (e) {
      setErrore(
        e instanceof Error
          ? e.message
          : "Impossibile caricare i dati del centro ottico."
      );
    } finally {
      setCaricamento(false);
    }
  }

  function aggiorna(
    campo: keyof Negozio,
    valore: string
  ) {
    setDati((correnti) => ({
      ...correnti,
      [campo]: valore,
    }));
  }

  async function salva(evento: FormEvent) {
    evento.preventDefault();
    setSalvataggio(true);
    setErrore("");
    setMessaggio("");

    try {
      const risposta = await fetch("/api/admin/negozio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dati),
      });

      const payload = await risposta.json();

      if (!risposta.ok || !payload.ok) {
        throw new Error(
          payload.errore || "Salvataggio non riuscito."
        );
      }

      setMessaggio("Dati del centro ottico aggiornati.");
      await carica();
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

  return (
    <main className="min-h-screen bg-[#F5F9F9] pb-12 text-[#102A2E]">
      <header className="bg-[linear-gradient(135deg,#083B4C,#1D6E7A)] text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-7 sm:px-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#D8F4F7]">
              Impostazioni
            </p>
            <h1 className="mt-1 text-3xl font-black tracking-[-0.04em]">
              Dati centro ottico
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

      <section className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
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

        {caricamento ? (
          <div className="rounded-3xl border border-[#DCE8E9] bg-white p-8 text-center font-black text-[#60777C]">
            Caricamento...
          </div>
        ) : (
          <form
            onSubmit={salva}
            className="rounded-3xl border border-[#DCE8E9] bg-white p-5 shadow-sm sm:p-7"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Campo
                label="Nome centro ottico *"
                value={dati.nome_negozio}
                onChange={(v) => aggiorna("nome_negozio", v)}
              />

              <Campo
                label="Ragione sociale"
                value={dati.ragione_sociale}
                onChange={(v) => aggiorna("ragione_sociale", v)}
              />

              <Campo
                label="Indirizzo"
                value={dati.indirizzo}
                onChange={(v) => aggiorna("indirizzo", v)}
              />

              <div className="grid grid-cols-[120px_1fr] gap-3">
                <Campo
                  label="CAP"
                  value={dati.cap}
                  onChange={(v) => aggiorna("cap", v)}
                />

                <Campo
                  label="Città"
                  value={dati.citta}
                  onChange={(v) => aggiorna("citta", v)}
                />
              </div>

              <Campo
                label="Provincia"
                value={dati.provincia}
                onChange={(v) => aggiorna("provincia", v)}
              />

              <Campo
                label="Telefono"
                type="tel"
                value={dati.telefono}
                onChange={(v) => aggiorna("telefono", v)}
              />

              <Campo
                label="Cellulare / WhatsApp *"
                type="tel"
                value={dati.whatsapp}
                onChange={(v) => aggiorna("whatsapp", v)}
                placeholder="+39 333 1234567"
              />

              <Campo
                label="Email"
                type="email"
                value={dati.email}
                onChange={(v) => aggiorna("email", v)}
              />

              <Campo
                label="Sito web"
                value={dati.sito_web}
                onChange={(v) => aggiorna("sito_web", v)}
                placeholder="https://..."
              />

              <Campo
                label="Partita IVA"
                value={dati.partita_iva}
                onChange={(v) => aggiorna("partita_iva", v)}
              />

              <Campo
                label="Codice fiscale"
                value={dati.codice_fiscale}
                onChange={(v) => aggiorna("codice_fiscale", v)}
              />

              <Campo
                label="URL logo"
                value={dati.logo_url}
                onChange={(v) => aggiorna("logo_url", v)}
                placeholder="https://..."
              />

              <label className="sm:col-span-2">
                <span className="mb-2 block text-sm font-black">
                  Orari di apertura
                </span>
                <textarea
                  value={dati.orari_apertura}
                  onChange={(e) =>
                    aggiorna("orari_apertura", e.target.value)
                  }
                  rows={5}
                  placeholder={"Lun-Ven 09:00-13:00 / 15:30-19:30\nSab 09:00-13:00"}
                  className="w-full resize-y rounded-xl border border-[#C9DADC] px-4 py-3 outline-none focus:border-[#1D6E7A]"
                />
              </label>
            </div>

            {dati.logo_url && (
              <div className="mt-6 rounded-2xl border border-[#DCE8E9] bg-[#F8FBFB] p-4">
                <p className="mb-3 text-xs font-black uppercase tracking-[0.14em] text-[#789095]">
                  Anteprima logo
                </p>
                <div className="flex h-28 items-center justify-center overflow-hidden rounded-xl bg-white">
                  <img
                    src={dati.logo_url}
                    alt="Logo centro ottico"
                    className="max-h-full max-w-full object-contain p-3"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={
                salvataggio ||
                !dati.nome_negozio.trim() ||
                !dati.whatsapp.trim()
              }
              className="mt-7 w-full rounded-2xl bg-[linear-gradient(135deg,#083B4C,#1D6E7A)] px-5 py-4 text-sm font-black text-white disabled:opacity-40"
            >
              {salvataggio
                ? "Salvataggio..."
                : "Salva dati centro ottico"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}

function Campo({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label>
      <span className="mb-2 block text-sm font-black">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#C9DADC] px-4 py-3 outline-none focus:border-[#1D6E7A]"
      />
    </label>
  );
}
