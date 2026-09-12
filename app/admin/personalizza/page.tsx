"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  TEMA_DEFAULT,
  type TemaApp,
} from "@/app/branding/tema-default";
import { applicaTema } from "@/app/branding/theme-provider";

type CampoColore = {
  chiave: keyof TemaApp;
  titolo: string;
  descrizione: string;
};

const CAMPI: CampoColore[] = [
  {
    chiave: "primary",
    titolo: "Colore principale",
    descrizione: "Pulsanti, elementi attivi e dettagli principali.",
  },
  {
    chiave: "primaryHover",
    titolo: "Colore principale scuro",
    descrizione: "Usato per hover e accenti più marcati.",
  },
  {
    chiave: "secondary",
    titolo: "Colore secondario",
    descrizione: "Accenti complementari e sezioni decorative.",
  },
  {
    chiave: "background",
    titolo: "Sfondo app",
    descrizione: "Sfondo generale delle pagine.",
  },
  {
    chiave: "surface",
    titolo: "Sfondo card",
    descrizione: "Schede, pannelli e barra inferiore.",
  },
  {
    chiave: "surfaceSoft",
    titolo: "Sfondo delicato",
    descrizione: "Box secondari e aree evidenziate.",
  },
  {
    chiave: "text",
    titolo: "Testo principale",
    descrizione: "Titoli e testi con maggiore contrasto.",
  },
  {
    chiave: "textSoft",
    titolo: "Testo secondario",
    descrizione: "Sottotitoli e testi meno importanti.",
  },
  {
    chiave: "muted",
    titolo: "Testo attenuato",
    descrizione: "Note, descrizioni e informazioni di supporto.",
  },
  {
    chiave: "border",
    titolo: "Bordi",
    descrizione: "Bordi principali di card e controlli.",
  },
  {
    chiave: "borderStrong",
    titolo: "Bordi evidenziati",
    descrizione: "Bordi con contrasto leggermente maggiore.",
  },
  {
    chiave: "navActive",
    titolo: "Icona menu attiva",
    descrizione: "Colore della voce attiva nella barra inferiore.",
  },
  {
    chiave: "navInactive",
    titolo: "Icone menu inattive",
    descrizione: "Colore delle altre voci della barra inferiore.",
  },
];

function validoHex(valore: string) {
  return /^#[0-9A-Fa-f]{6}$/.test(valore);
}

function IconaPalette() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3.5c-4.9 0-8.5 3.3-8.5 7.7 0 4.6 3.7 8.3 8.4 8.3h1.2c1.2 0 1.8-.7 1.8-1.5 0-.7-.4-1.1-.4-1.8 0-1.1.9-1.8 2-1.8h1.3c1.7 0 2.7-1.3 2.7-3.2 0-4.4-3.7-7.7-8.5-7.7Z" />
      <circle cx="7.5" cy="10" r=".9" />
      <circle cx="10.2" cy="7.2" r=".9" />
      <circle cx="14.1" cy="7" r=".9" />
      <circle cx="17" cy="9.5" r=".9" />
    </svg>
  );
}

export default function PersonalizzaAppPage() {
  const [tema, setTema] = useState<TemaApp>(TEMA_DEFAULT);
  const [temaSalvato, setTemaSalvato] = useState<TemaApp>(TEMA_DEFAULT);
  const [caricamento, setCaricamento] = useState(true);
  const [salvataggio, setSalvataggio] = useState(false);
  const [messaggio, setMessaggio] = useState("");
  const [errore, setErrore] = useState("");

  useEffect(() => {
    async function carica() {
      setCaricamento(true);
      setErrore("");

      try {
        const risposta = await fetch("/api/admin/tema", {
          cache: "no-store",
        });

        const dati = await risposta.json();

        if (!risposta.ok || !dati.ok) {
          throw new Error(
            dati.errore || "Impossibile caricare la personalizzazione."
          );
        }

        const ricevuto: TemaApp = {
          ...TEMA_DEFAULT,
          ...(dati.tema || {}),
        };

        setTema(ricevuto);
        setTemaSalvato(ricevuto);
        applicaTema(ricevuto);
      } catch (e) {
        setErrore(
          e instanceof Error
            ? e.message
            : "Impossibile caricare la personalizzazione."
        );
      } finally {
        setCaricamento(false);
      }
    }

    carica();

    return () => {
      applicaTema(temaSalvato);
    };
    // Il ripristino reale viene gestito nei pulsanti/nel salvataggio.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const modificato = useMemo(
    () => JSON.stringify(tema) !== JSON.stringify(temaSalvato),
    [tema, temaSalvato]
  );

  function cambia(chiave: keyof TemaApp, valore: string) {
    const nuovo = {
      ...tema,
      [chiave]: valore.toUpperCase(),
    };

    setTema(nuovo);
    applicaTema(nuovo);
    setMessaggio("");
    setErrore("");
  }

  function ripristinaDefault() {
    const nuovo = { ...TEMA_DEFAULT };
    setTema(nuovo);
    applicaTema(nuovo);
    setMessaggio("");
    setErrore("");
  }

  function annullaModifiche() {
    setTema(temaSalvato);
    applicaTema(temaSalvato);
    setMessaggio("");
    setErrore("");
  }

  async function salva() {
    const nonValido = Object.entries(tema).find(
      ([, valore]) => !validoHex(String(valore))
    );

    if (nonValido) {
      setErrore("Uno dei colori inseriti non è valido.");
      return;
    }

    setSalvataggio(true);
    setErrore("");
    setMessaggio("");

    try {
      const risposta = await fetch("/api/admin/tema", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tema),
      });

      const dati = await risposta.json();

      if (!risposta.ok || !dati.ok) {
        throw new Error(
          dati.errore || "Impossibile salvare la personalizzazione."
        );
      }

      const salvato: TemaApp = {
        ...TEMA_DEFAULT,
        ...(dati.tema || tema),
      };

      setTema(salvato);
      setTemaSalvato(salvato);
      applicaTema(salvato);
      setMessaggio("Colori dell’app aggiornati.");
    } catch (e) {
      setErrore(
        e instanceof Error
          ? e.message
          : "Impossibile salvare la personalizzazione."
      );
    } finally {
      setSalvataggio(false);
    }
  }

  if (caricamento) {
    return (
      <main className="min-h-screen bg-[var(--app-background)] px-4 py-12 text-[var(--app-text)]">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm text-[var(--app-muted)]">
            Caricamento personalizzazione...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--app-background)] pb-12 text-[var(--app-text)]">
      <header className="border-b border-[var(--app-border)] bg-[var(--app-surface)]">
        <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-9">
          <Link
            href="/admin"
            className="text-xs font-semibold text-[var(--app-primary)]"
          >
            ← Dashboard
          </Link>

          <div className="mt-5 flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--app-surface-soft)] text-[var(--app-primary)]">
              <IconaPalette />
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.23em] text-[var(--app-primary)]">
                White label
              </p>
              <h1 className="mt-1 font-serif text-3xl font-medium tracking-[-0.035em] sm:text-4xl">
                Personalizza la tua app
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--app-muted)]">
                Scegli i colori del tuo centro ottico. L’anteprima viene
                aggiornata immediatamente; il cambiamento diventa definitivo
                quando premi Salva colori.
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_380px]">
        <div>
          {errore && (
            <div className="mb-5 rounded-2xl border border-[#E2C1BC] bg-[#F8ECE9] px-4 py-3 text-sm font-medium text-[#8E5D57]">
              {errore}
            </div>
          )}

          {messaggio && (
            <div className="mb-5 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-4 py-3 text-sm font-medium text-[var(--app-text-soft)]">
              {messaggio}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {CAMPI.map((campo) => (
              <div
                key={campo.chiave}
                className="rounded-[20px] border border-[var(--app-border)] bg-[var(--app-surface)] p-4"
              >
                <div className="flex items-start gap-3">
                  <input
                    type="color"
                    value={tema[campo.chiave]}
                    onChange={(e) =>
                      cambia(campo.chiave, e.target.value)
                    }
                    className="h-12 w-14 shrink-0 cursor-pointer rounded-xl border border-[var(--app-border)] bg-transparent p-1"
                    aria-label={campo.titolo}
                  />

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">
                      {campo.titolo}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[var(--app-muted)]">
                      {campo.descrizione}
                    </p>

                    <input
                      type="text"
                      value={tema[campo.chiave]}
                      maxLength={7}
                      onChange={(e) =>
                        cambia(campo.chiave, e.target.value)
                      }
                      className="mt-3 w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-background)] px-3 py-2 font-mono text-xs uppercase outline-none focus:border-[var(--app-primary)]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="lg:sticky lg:top-5 lg:self-start">
          <div className="overflow-hidden rounded-[24px] border border-[var(--app-border)] bg-[var(--app-surface)] shadow-[0_16px_40px_rgba(32,56,59,.08)]">
            <div className="border-b border-[var(--app-border)] px-5 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--app-primary)]">
                Anteprima live
              </p>
            </div>

            <div className="bg-[var(--app-background)] p-5">
              <div className="rounded-[22px] border border-[var(--app-border)] bg-[var(--app-surface)] p-4">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-[var(--app-primary)]" />
                  <div>
                    <p className="font-serif text-xl font-medium">
                      Il tuo centro ottico
                    </p>
                    <p className="text-xs text-[var(--app-muted)]">
                      Anteprima colori
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl bg-[var(--app-surface-soft)] p-4">
                  <p className="text-sm font-semibold">
                    Scopri il catalogo
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[var(--app-muted)]">
                    Montature, servizi e promozioni con i colori del tuo brand.
                  </p>
                </div>

                <button
                  type="button"
                  className="mt-4 w-full rounded-xl bg-[var(--app-primary)] px-4 py-3 text-sm font-semibold text-white"
                >
                  Prenota appuntamento
                </button>

                <div className="mt-5 flex items-center justify-around border-t border-[var(--app-border)] pt-4">
                  <span className="text-xs font-semibold text-[var(--app-nav-active)]">
                    ● Home
                  </span>
                  <span className="text-xs font-medium text-[var(--app-nav-inactive)]">
                    Catalogo
                  </span>
                  <span className="text-xs font-medium text-[var(--app-nav-inactive)]">
                    Profilo
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 border-t border-[var(--app-border)] p-5">
              <button
                type="button"
                onClick={salva}
                disabled={salvataggio || !modificato}
                className="w-full rounded-xl bg-[var(--app-primary)] px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-45"
              >
                {salvataggio ? "Salvataggio..." : "Salva colori"}
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={annullaModifiche}
                  disabled={!modificato}
                  className="rounded-xl border border-[var(--app-border)] bg-white px-3 py-2.5 text-xs font-semibold text-[var(--app-text-soft)] disabled:opacity-40"
                >
                  Annulla
                </button>

                <button
                  type="button"
                  onClick={ripristinaDefault}
                  className="rounded-xl border border-[var(--app-border)] bg-white px-3 py-2.5 text-xs font-semibold text-[var(--app-text-soft)]"
                >
                  Colori originali
                </button>
              </div>

              {modificato && (
                <p className="text-center text-xs text-[var(--app-muted)]">
                  Hai modifiche non ancora salvate.
                </p>
              )}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
