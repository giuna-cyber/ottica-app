"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type UtenteAdmin = {
  id: number;
  username: string;
};

function IconaCalendario() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.8" />
      <path d="M8 3v4M16 3v4M3.5 9.5h17" />
      <path d="M8.5 14c1.1-1.3 2.2-1.3 3.3 0 1.1-1.3 2.2-1.3 3.3 0" />
    </svg>
  );
}

function IconaOrologio() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

function IconaPromo() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M4 8.5 10.5 2H19v8.5L12.5 17 4 8.5Z" />
      <circle cx="15.7" cy="5.7" r="1.2" />
      <path d="m17.5 15.5.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z" />
    </svg>
  );
}

function IconaOcchiali() {
  return (
    <svg viewBox="0 0 32 24" className="h-7 w-8" fill="none" stroke="currentColor" strokeWidth="1.7">
      <ellipse cx="9" cy="13" rx="6" ry="5.5" />
      <ellipse cx="23" cy="13" rx="6" ry="5.5" />
      <path d="M15 12c1-1.6 2-1.6 3 0M3 11 1.5 5M29 11 30.5 5" />
    </svg>
  );
}

function IconaBorsa() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M5 8h14l-1 11H6L5 8Z" />
      <path d="M9 9V6.5A3 3 0 0 1 12 3.5a3 3 0 0 1 3 3V9" />
    </svg>
  );
}

function IconaSpedizione() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M3 6h11v10H3zM14 9h3.5L21 12.5V16h-7z" />
      <circle cx="7" cy="17.5" r="1.5" />
      <circle cx="18" cy="17.5" r="1.5" />
    </svg>
  );
}

function IconaNegozio() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M4 10h16v10H4z" />
      <path d="M3 10 5 4h14l2 6" />
      <path d="M9 20v-5h6v5" />
    </svg>
  );
}


function IconaPalette() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M12 3.5c-4.9 0-8.5 3.3-8.5 7.7 0 4.6 3.7 8.3 8.4 8.3h1.2c1.2 0 1.8-.7 1.8-1.5 0-.7-.4-1.1-.4-1.8 0-1.1.9-1.8 2-1.8h1.3c1.7 0 2.7-1.3 2.7-3.2 0-4.4-3.7-7.7-8.5-7.7Z" />
      <circle cx="7.5" cy="10" r=".9" />
      <circle cx="10.2" cy="7.2" r=".9" />
      <circle cx="14.1" cy="7" r=".9" />
      <circle cx="17" cy="9.5" r=".9" />
    </svg>
  );
}


function IconaStatistiche() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M4 19.5V13h4v6.5M10 19.5V8h4v11.5M16 19.5V4.5h4v15" />
      <path d="M3 19.5h18" />
    </svg>
  );
}

function IconaFreccia() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M5 12h13M14 7l5 5-5 5" />
    </svg>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [utente, setUtente] = useState<UtenteAdmin | null>(null);

  useEffect(() => {
    const salvato = sessionStorage.getItem("ottica_admin");

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

  const voci = [
    {
      href: "/admin/appuntamenti",
      titolo: "Appuntamenti",
      descrizione: "Visualizza e gestisci le prenotazioni.",
      icona: <IconaCalendario />,
      tono: "bg-[#EDF3F0] text-[#6F918B]",
    },
    {
      href: "/admin/slot",
      titolo: "Disponibilità",
      descrizione: "Gestisci giorni e orari disponibili.",
      icona: <IconaOrologio />,
      tono: "bg-[#EEF2F5] text-[#7896A0]",
    },
    {
      href: "/admin/promozioni",
      titolo: "Promozioni",
      descrizione: "Gestisci le offerte del negozio.",
      icona: <IconaPromo />,
      tono: "bg-[#F6ECE8] text-[#A87972]",
    },
    {
      href: "/admin/catalogo",
      titolo: "Catalogo",
      descrizione: "Aggiungi e modifica i prodotti.",
      icona: <IconaOcchiali />,
      tono: "bg-[#EDF3F0] text-[#6F918B]",
    },
    {
      href: "/admin/statistiche",
      titolo: "Statistiche vendite",
      descrizione: "Report di ordini, incassi, prodotti e clienti generati dall’app.",
      icona: <IconaStatistiche />,
      tono: "bg-[#E9F1ED] text-[#66877F]",
    },
    {
      href: "/admin/ordini-shop",
      titolo: "Ordini Shop",
      descrizione: "Gestisci acquisti, pagamenti e consegne.",
      icona: <IconaBorsa />,
      tono: "bg-[#EEF2F5] text-[#7896A0]",
    },
    {
      href: "/admin/spedizione",
      titolo: "Spedizione",
      descrizione: "Configura costo e soglia per la spedizione gratuita.",
      icona: <IconaSpedizione />,
      tono: "bg-[#F0F3ED] text-[#7D9278]",
    },
    {
      href: "/admin/personalizza",
      titolo: "Personalizza App",
      descrizione: "Modifica colori e identità grafica della tua app.",
      icona: <IconaPalette />,
      tono: "bg-[#EEEAF2] text-[#81728D]",
    },
    {
      href: "/admin/negozio",
      titolo: "Dati centro ottico",
      descrizione: "Configura anagrafica, contatti, WhatsApp e orari del centro ottico.",
      icona: <IconaNegozio />,
      tono: "bg-[#F4EFE7] text-[#987F68]",
    },
  ];

  return (
    <main className="min-h-screen bg-[#F6F4EF] pb-10 text-[#20383B]">
      <header className="border-b border-[#D9E2DF] bg-[#FBFAF7]">
        <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-9">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#89A39D]">
                Area amministrativa
              </p>

              <h1 className="mt-2 font-serif text-4xl font-medium tracking-[-0.04em] text-[#20383B] sm:text-5xl">
                Dashboard
              </h1>

              {utente && (
                <p className="mt-2 text-sm text-[#7E8F8B]">
                  Accesso:{" "}
                  <span className="font-semibold text-[#506C69]">
                    {utente.username}
                  </span>
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={esci}
              className="w-fit rounded-full border border-[#D4DFDB] bg-white px-4 py-2 text-[11px] font-semibold text-[#738682] transition hover:border-[#BFCFCA] hover:bg-[#F3F5F2]"
            >
              Esci
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#89A39D]">
              Gestione centro ottico
            </p>
            <h2 className="mt-1 font-serif text-2xl font-medium tracking-[-0.025em]">
              Seleziona un’area
            </h2>
          </div>

          <Link
            href="/"
            className="rounded-full border border-[#D4DFDB] bg-white px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#738682]"
          >
            Vai al sito
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {voci.map((voce) => (
            <Link
              key={voce.href}
              href={voce.href}
              className="group rounded-[22px] border border-[#D9E2DF] bg-[#FBFAF7] p-5 shadow-[0_10px_24px_rgba(80,108,105,.05)] transition duration-300 hover:-translate-y-0.5 hover:border-[#BFD0CB] hover:shadow-[0_14px_30px_rgba(80,108,105,.09)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${voce.tono}`}>
                  {voce.icona}
                </div>

                <div className="mt-1 text-[#9AA9A5] transition group-hover:translate-x-0.5 group-hover:text-[#6F918B]">
                  <IconaFreccia />
                </div>
              </div>

              <h3 className="mt-5 font-serif text-xl font-medium">
                {voce.titolo}
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#7E8F8B]">
                {voce.descrizione}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
