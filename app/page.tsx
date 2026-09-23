"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import InstallAppPrompt from "./install-app-prompt";
import BottomNav from "./components/bottom-nav";
import {
  IconaHomeOttica,
  IconaCatalogoOttica,
  IconaPrenotaOttica,
  IconaPromoOttica,
  IconaProfiloOttica,
} from "@/app/icone-ottica";

type DatiNegozio = {
  nome_negozio: string;
  logo_url: string;
  indirizzo: string;
  citta: string;
  whatsapp: string;
  slide_1_url: string;
  slide_2_url: string;
  slide_3_url: string;
};

type ClienteSalvato = {
  id: number;
  nome: string;
  cognome?: string | null;
  email?: string;
};

function IconaLogo() {
  return (
    <svg viewBox="0 0 64 40" className="h-7 w-11" fill="none" stroke="currentColor" strokeWidth="2.6">
      <circle cx="20" cy="22" r="10" />
      <circle cx="44" cy="22" r="10" />
      <path d="M30 21c1.8-2.3 5.8-2.3 8 0" />
      <path d="M10 18 7 9M54 18l3-9" />
    </svg>
  );
}






function IconaFreccia() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M5 12h13M13 7l5 5-5 5" />
    </svg>
  );
}

function IconaTelefono() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="6" y="2.5" width="12" height="19" rx="3" />
      <path d="M10 18.5h4" />
      <path d="M9.2 10.8c.7-.9 1.5-.9 2.2 0 .7-.9 1.5-.9 2.2 0" />
    </svg>
  );
}

function IconaWhatsApp() {
  return (
    <svg viewBox="0 0 32 32" className="h-6 w-6" fill="currentColor" aria-hidden="true">
      <path d="M16.02 3C8.85 3 3.03 8.77 3.03 15.88c0 2.27.6 4.48 1.73 6.42L3 29l6.9-1.8a13.03 13.03 0 0 0 6.12 1.55h.01c7.16 0 12.99-5.77 12.99-12.87C29.02 8.77 23.19 3 16.02 3Zm0 23.58h-.01a10.82 10.82 0 0 1-5.52-1.5l-.4-.24-4.09 1.07 1.09-3.95-.26-.41a10.63 10.63 0 0 1-1.66-5.67c0-5.9 4.86-10.7 10.85-10.7 5.98 0 10.85 4.8 10.85 10.7 0 5.9-4.87 10.7-10.85 10.7Zm5.95-8.01c-.33-.16-1.94-.95-2.24-1.06-.3-.11-.52-.16-.74.16-.22.32-.85 1.06-1.04 1.27-.19.22-.38.24-.71.08-.33-.16-1.39-.51-2.65-1.62-.98-.86-1.64-1.93-1.83-2.25-.19-.32-.02-.5.14-.66.15-.14.33-.38.49-.57.16-.19.22-.32.33-.54.11-.22.05-.41-.03-.57-.08-.16-.74-1.76-1.01-2.41-.27-.64-.54-.55-.74-.56h-.63c-.22 0-.57.08-.87.41-.3.32-1.15 1.11-1.15 2.71 0 1.6 1.18 3.14 1.34 3.36.16.22 2.32 3.51 5.62 4.92.79.34 1.4.54 1.88.69.79.25 1.5.21 2.07.13.63-.09 1.94-.78 2.21-1.54.27-.76.27-1.41.19-1.54-.08-.14-.3-.22-.63-.38Z" />
    </svg>
  );
}

function preparaNumeroWhatsApp(numero: string) {
  let pulito = numero.replace(/\D/g, "");
  if (pulito.startsWith("00")) pulito = pulito.slice(2);
  if (pulito.length === 10 && pulito.startsWith("3")) pulito = `39${pulito}`;
  return pulito;
}

export default function HomePage() {
  const [negozio, setNegozio] = useState<DatiNegozio>({
    nome_negozio: "Ottica App",
    logo_url: "",
    indirizzo: "",
    citta: "",
    whatsapp: "",
    slide_1_url: "",
    slide_2_url: "",
    slide_3_url: "",
  });

  const [slideAttiva, setSlideAttiva] = useState(0);
  const [clienteSalvato, setClienteSalvato] = useState<ClienteSalvato | null>(null);

  useEffect(() => {
    const salvato = sessionStorage.getItem("ottica_cliente");

    if (!salvato) {
      setClienteSalvato(null);
      return;
    }

    try {
      const dati = JSON.parse(salvato) as ClienteSalvato;
      setClienteSalvato(dati);
    } catch {
      sessionStorage.removeItem("ottica_cliente");
      setClienteSalvato(null);
    }
  }, []);

  useEffect(() => {
    async function caricaNegozio() {
      try {
        const risposta = await fetch("/api/negozio", { cache: "no-store" });
        const dati = await risposta.json();

        if (risposta.ok && dati.ok && dati.negozio) {
          setNegozio({
            nome_negozio: String(dati.negozio.nome_negozio || "Ottica App"),
            logo_url: String(dati.negozio.logo_url || ""),
            indirizzo: String(dati.negozio.indirizzo || ""),
            citta: String(dati.negozio.citta || ""),
            whatsapp: String(dati.negozio.whatsapp || ""),
            slide_1_url: String(dati.negozio.slide_1_url || ""),
            slide_2_url: String(dati.negozio.slide_2_url || ""),
            slide_3_url: String(dati.negozio.slide_3_url || ""),
          });
        }
      } catch {
        // Manteniamo i valori di fallback.
      }
    }

    caricaNegozio();
  }, []);

  const immaginiSlider = [
    negozio.slide_1_url,
    negozio.slide_2_url,
    negozio.slide_3_url,
  ].filter((url) => url.trim() !== "");

  const immaginiHero =
    immaginiSlider.length > 0 ? immaginiSlider : ["/images/home-bg.png"];

  useEffect(() => {
    if (slideAttiva >= immaginiHero.length) {
      setSlideAttiva(0);
    }
  }, [immaginiHero.length, slideAttiva]);

  useEffect(() => {
    if (immaginiHero.length <= 1) return;

    const timer = window.setInterval(() => {
      setSlideAttiva((corrente) => (corrente + 1) % immaginiHero.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [immaginiHero.length]);

  function apriWhatsApp() {
    const numero = preparaNumeroWhatsApp(negozio.whatsapp);
    if (!numero) return;

    const messaggio = encodeURIComponent("Ciao, vorrei avere informazioni.");
    const appUrl = `whatsapp://send?phone=${numero}&text=${messaggio}`;
    const webUrl = `https://wa.me/${numero}?text=${messaggio}`;

    let fallbackAvviato = false;
    const fallback = window.setTimeout(() => {
      fallbackAvviato = true;
      window.location.href = webUrl;
    }, 900);

    const annullaFallback = () => {
      if (!fallbackAvviato) window.clearTimeout(fallback);
    };

    window.addEventListener("pagehide", annullaFallback, { once: true });
    document.addEventListener(
      "visibilitychange",
      () => {
        if (document.visibilityState === "hidden") annullaFallback();
      },
      { once: true }
    );

    window.location.href = appUrl;
  }

  return (
    <main className="min-h-screen bg-[var(--app-background)] pb-24 text-[var(--app-text-soft)]">
      <InstallAppPrompt />

      <header className="sticky top-0 z-[80] border-b border-[var(--app-border)] bg-[var(--app-surface)]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--app-border-strong)] bg-white text-[var(--app-primary-hover)]">
              {negozio.logo_url ? (
                <img
                  src={negozio.logo_url}
                  alt={negozio.nome_negozio}
                  className="h-full w-full object-contain p-1.5"
                />
              ) : (
                <IconaLogo />
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate text-[9px] font-semibold uppercase tracking-[0.23em] text-[var(--app-primary)]">
                Centro ottico
              </p>
              <h1 className="truncate font-serif text-[19px] font-semibold tracking-[0.01em] text-[var(--app-text-soft)]">
                {negozio.nome_negozio.toUpperCase()}
              </h1>
            </div>
          </Link>

          <Link
            href="/login"
            className="shrink-0 rounded-full border border-[#D2DEDA] bg-white/70 px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--app-primary-hover)]"
          >
            Area riservata negozio
          </Link>
        </div>
      </header>

      <section className="relative mx-auto min-h-[610px] max-w-6xl overflow-hidden text-white sm:min-h-[680px]">
        <div className="absolute inset-0">
          {immaginiHero.map((url, indice) => (
            <img
              key={`${url}-${indice}`}
              src={url}
              alt=""
              aria-hidden="true"
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[3200ms] ease-in-out ${
                indice === slideAttiva ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
        </div>

        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(78,108,105,.82)_0%,rgba(95,133,128,.58)_38%,rgba(143,184,178,.20)_72%,rgba(169,199,207,.08)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(32,56,59,.03)_0%,rgba(32,56,59,.05)_55%,rgba(80,108,105,.30)_100%)]" />

        <div className="pointer-events-none absolute -left-28 top-16 h-80 w-80 rounded-full border border-white/20 sm:h-[430px] sm:w-[430px]" />
        <div className="pointer-events-none absolute left-12 top-32 h-56 w-56 rounded-full border border-white/10 sm:h-72 sm:w-72" />

        <div className="relative flex min-h-[610px] items-end px-5 pb-10 pt-14 sm:min-h-[680px] sm:items-center sm:px-10 sm:pb-16">
          <div className="max-w-[560px]">
            <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#EEF4F1]">
              La tua visione · il nostro impegno
            </p>

            <div className="mt-5 h-px w-10 bg-[#EEF4F1]/85" />

            <h2 className="mt-6 font-serif text-[2.85rem] font-medium leading-[0.9] tracking-[-0.045em] sm:text-6xl">
              Vedere bene.
              <span className="block">Sentirsi bene.</span>
            </h2>

            <p className="mt-5 max-w-md text-[15px] leading-7 text-white/88 sm:text-lg">
              Montature selezionate, assistenza dedicata e prenotazioni rapide.
              Tutto in un unico spazio digitale.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/appuntamenti"
                className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl border border-[#C8D9D4]/60 bg-[var(--app-primary)]/88 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(80,108,105,.12)] backdrop-blur"
              >
                Prenota un appuntamento
                <IconaFreccia />
              </Link>

              <Link
                href="/catalogo"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/45 bg-white/8 px-5 py-3 text-sm font-semibold text-white backdrop-blur"
              >
                Scopri il catalogo
              </Link>
            </div>

            {(negozio.indirizzo || negozio.citta) && (
              <p className="mt-6 text-xs tracking-wide text-white/66">
                {[negozio.indirizzo, negozio.citta].filter(Boolean).join(" · ")}
              </p>
            )}

            {immaginiHero.length > 1 && (
              <div className="mt-7 flex items-center gap-2">
                {immaginiHero.map((_, indice) => (
                  <button
                    key={indice}
                    type="button"
                    onClick={() => setSlideAttiva(indice)}
                    aria-label={`Vai alla slide ${indice + 1}`}
                    className={`h-2.5 w-2.5 rounded-full transition ${
                      indice === slideAttiva
                        ? "bg-white"
                        : "border border-white/70 bg-transparent"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>


      <section className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 sm:pt-10">
        <div className="overflow-hidden rounded-[22px] border border-[var(--app-border)] bg-[var(--app-surface)] shadow-[0_12px_30px_rgba(80,108,105,.05)]">
          <div className="grid gap-5 p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--app-primary)]">
                Area cliente
              </p>

              {clienteSalvato ? (
                <>
                  <h2 className="mt-2 font-serif text-2xl font-medium tracking-[-0.03em] text-[var(--app-text)] sm:text-3xl">
                    Ciao {clienteSalvato.nome}.
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--app-muted)]">
                    Gestisci appuntamenti, ordini e dati personali dal tuo profilo.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="mt-2 font-serif text-2xl font-medium tracking-[-0.03em] text-[var(--app-text)] sm:text-3xl">
                    Entra in Ottica App.
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--app-muted)]">
                    Crea il tuo profilo per ritrovare appuntamenti, ordini e dati personali
                    ogni volta che apri l&apos;app.
                  </p>
                </>
              )}
            </div>

            {clienteSalvato ? (
              <Link
                href="/profilo"
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--app-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--app-primary-hover)]"
              >
                Vai al profilo
              </Link>
            ) : (
              <div className="flex flex-col gap-3 sm:min-w-[220px]">
                <Link
                  href="/profilo?modalita=registrazione"
                  className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--app-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--app-primary-hover)]"
                >
                  Registrati
                </Link>

                <Link
                  href="/profilo?modalita=login"
                  className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--app-border-strong)] bg-white px-5 py-3 text-sm font-semibold text-[var(--app-primary-hover)] transition hover:bg-[var(--app-surface-soft)]"
                >
                  Accedi
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--app-primary)]">
              I nostri servizi
            </p>
            <h2 className="mt-3 max-w-2xl font-serif text-[2rem] font-medium leading-[1.02] tracking-[-0.035em] text-[var(--app-text)] sm:text-4xl">
              Dalla scelta della montatura alla tua visione nel tempo.
            </h2>
          </div>

          <p className="max-w-md text-sm leading-6 text-[var(--app-muted)] lg:justify-self-end">
            Consulenza, tecnologia e cura in un unico spazio pensato per il tuo benessere visivo.
          </p>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-3">
          <Link
            href="/catalogo"
            className="group relative min-h-[240px] overflow-hidden rounded-[22px] border border-[var(--app-border-strong)] shadow-[0_14px_34px_rgba(42,78,75,.08)]"
          >
            <img
              src="/images/catalogo-bg.jpg"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="relative flex h-full min-h-[240px] flex-col">
              <div className="p-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#6F918B]/20 bg-white/95 text-[var(--app-primary-hover)] shadow-sm">
                  <IconaCatalogoOttica />
                </div>
              </div>

              <div className="mt-auto bg-white/95 p-5 backdrop-blur-[1px]">
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#879B96]">01</p>
                <h3 className="mt-2 font-serif text-2xl font-medium text-[var(--app-text)]">Catalogo</h3>
                <p className="mt-2 max-w-[220px] text-sm leading-5 text-[#738682]">
                  Scopri modelli, colori e disponibilità.
                </p>
                <div className="mt-4 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--app-surface)] text-[var(--app-primary-hover)] transition group-active:translate-x-1">
                  <IconaFreccia />
                </div>
              </div>
            </div>
          </Link>

          <Link
            href="/appuntamenti"
            className="group relative min-h-[240px] overflow-hidden rounded-[22px] border border-[#D7E0DD] shadow-[0_14px_34px_rgba(42,78,75,.08)]"
          >
            <img
              src="/images/visita-bg.jpg"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="relative flex h-full min-h-[240px] flex-col">
              <div className="p-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#6F918B]/20 bg-white/95 text-[var(--app-primary-hover)] shadow-sm">
                  <IconaPrenotaOttica />
                </div>
              </div>

              <div className="mt-auto bg-white/95 p-5 backdrop-blur-[1px]">
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#879B96]">02</p>
                <h3 className="mt-2 font-serif text-2xl font-medium text-[var(--app-text)]">Prenota visita</h3>
                <p className="mt-2 max-w-[220px] text-sm leading-5 text-[#738682]">
                  Scegli il servizio, il giorno e l’orario.
                </p>
                <div className="mt-4 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--app-surface)] text-[var(--app-primary-hover)] transition group-active:translate-x-1">
                  <IconaFreccia />
                </div>
              </div>
            </div>
          </Link>

          <Link
            href="/promozioni"
            className="group relative min-h-[240px] overflow-hidden rounded-[22px] border border-[#DEDCD4] shadow-[0_14px_34px_rgba(42,78,75,.08)]"
          >
            <img
              src="/images/promozioni-bg.jpg"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="relative flex h-full min-h-[240px] flex-col">
              <div className="p-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#7E8F89]/20 bg-white/95 text-[#6E8C86] shadow-sm">
                  <IconaPromoOttica />
                </div>
              </div>

              <div className="mt-auto bg-white/95 p-5 backdrop-blur-[1px]">
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#89938F]">03</p>
                <h3 className="mt-2 font-serif text-2xl font-medium text-[#425B5B]">Promozioni</h3>
                <p className="mt-2 max-w-[220px] text-sm leading-5 text-[#7A8986]">
                  Consulta le offerte attive del centro.
                </p>
                <div className="mt-4 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--app-surface)] text-[#6E8C86] transition group-active:translate-x-1">
                  <IconaFreccia />
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
        <div className="overflow-hidden rounded-[22px] border border-[#DDE4E1] bg-[#FCFBF8] shadow-[0_12px_34px_rgba(42,78,75,.06)]">
          <div className="grid gap-5 p-5 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--app-surface-soft)] text-[var(--app-primary-hover)]">
                <IconaTelefono />
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-[#8FA39E]">
                  Ottica App sempre con te
                </p>
                <h3 className="mt-1 font-serif text-xl font-medium text-[var(--app-text)]">
                  Installa l’app sul tuo dispositivo.
                </h3>
                <p className="mt-1 text-xs leading-5 text-[#84928F]">
                  Accesso rapido da iPhone, iPad o Android.
                </p>
              </div>
            </div>

            <div className="hidden h-20 w-px bg-[#E1E6E3] sm:block" />

            <div className="grid grid-cols-2 gap-3 sm:max-w-[330px] sm:justify-self-end">
              <a
                href="https://appottica.xcodelab.it"
                className="rounded-xl border border-[#DCE5E1] bg-white p-3 text-center"
              >
                <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAXIAAAFyAQAAAADAX2ykAAACjUlEQVR4nO2bQW7cMAxFHysDWWqAOUCOIt+gZ+0N7KP0AAGsZQAZvwtJ42mCNg3qMWKAWnhhvwWBP58iKY2Jz6z526dwcN5555133nnn/8RbWwPMl9VszAOQzSD3b+OB8Ti/M58kSQuQliCIBbNLEBAkSfqdf3Q8zu/M55tDAU3ZTFMs2AhUYx8bj/P78MO7N/lamL8LSz8NkY+Nx/l9+Xf6ziOmtIDmSyiHx+P8vnzXNwrIYEnrYGlaB9JyMQHcj0C+WvzO/xM/m5nZBSA/qT0IspG1ls/HxuP8Tnz17+ZQQUHz86sxP79aM/Zx8Ti/L09tfpIKmggiLSAtob+LpSJ1TV8tfuc/WE23WO6bYGIBokRagjRFqX51fU/Gcz+8qLOM0j8sNP9O3H4HXy1+5z9YW+6FWNAU1Q3bJ1ktZ7u+J+S7vgu0XAxN0CmqzSe37O36nozvvuwy1tKqrm1P9vrqrPytvmqb8J1rdbMz4P49J3/Lz61MrvXV1hptD/fvGfm7/nfrhdpjy9lyfU/K3/m3Nry1oAKgitxztufnM/Ldvwvca7lAm29s7nZ9T8j3+XMGI74MwDoAoTB/XwfIFz8/OjF/23/7hquF24bbj3/TErw/OjPfphoq2BglyP1cONXp5er3687JVx376W4oLRdHYenHVUa+Fohl0DHxOP8QPvUhZTvLz2aaWK0OsWZ78vuT5+b7/UlNBNkYJbNnidnMSHr1+xvn5N/erzMAwTpoHg2Rr8VmC7I0HRGP84/lJfVbz7XSiuWv/KPjcf7/+Lf3J5nHUDRbkNVOOC4IVvP66pR803eu+2volXR8MZGfZOShGPHlqHic35c3fczcLf9/t/POO++8887vwP8CkjL70D2MLcsAAAAASUVORK5CYII=" alt="QR Apple" className="mx-auto h-20 w-20 object-contain" />
                <p className="mt-2 text-[10px] font-semibold text-[var(--app-primary-hover)]">Apple / Web</p>
              </a>

              <a
                href="/downloads/OtticaApp.apk"
                download
                className="rounded-xl border border-[#DCE5E1] bg-white p-3 text-center"
              >
                <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZoAAAGaAQAAAAAefbjOAAAC/klEQVR4nO2cTW6kMBBG3zcg9RKkOUAfBW6QI+Vq+Cg5QEt4GcmoZmGbJpmRRqNkoBPKqwb8RKF2189XpmX88wg//p0BhxxyyCGHHHLoe0Iqo4UgiaAWjbGF0APEOmE8xDyHdoQwMzMGMzObG4POypgohwxzY5t504M/k0OfAcXVAbBIY5T0bK+C2GITkD3IUeY5dCAUL9U9xBboEhr/z50cekSofXdsxF4AqmeW1oifcCeHvgZUV0RnkL/4LuVzBgbEi9XDA8xz6CgoSJJ60BgvOZXUGFs0AhpZcqlxlHkO7e0jNg4g9MiIi+qFRPEgR5jn0O7Qb9XnMAOw1qEz2ERjNtXJXn2eA1okXROQv/1FNsUaJgZLaKSx99B+5jm0F1R/9p1lL5AlKe6fqmDFMLuPOANEVSgTNXTAfYHUqFGHa5YngSRdqiR1Dw5dgnA100hVsY8xz6EjMstUPENOL6u3gC5VR9El9xEngLYrwubGbKpLgMFKHlHnJc8jzgQ1Jl1fpeeZHCvy6WEu7kHSxTQeZZ5De0HFR9ClLDvUkuJNEKEGDI8a3x+qmmW8GHQ3AU0iPN3Q8CIYplflq2HtfT36Mzn0EWirR9jMJpnYjJx30riPOAG0Ro03MtWwkSca416R+or49tAaNdoEsU0aDBTUGMQ+t8AsPN0E3a22zh/8mRz6OCRdXwVd2UaXfUS4JvK54aVIV0W9/BLP5NDH9Ii5qXvpeLP9dtsZ9b7GGaB1RUBJJrJinbIUUZbKvc3hK+K7QzWz3HQzSo5ZPIOtVUfnesQZoLX3uUaI+U3Hc606GGavPs8A5fKhik9NMuJ62M0Q+hsQfyZgke1tnkO7Q+931RXPMK9XZ2rPyxWqU0DbzDK/zDfXK2s/tBx33vs8KVSrzymur/dUUVvjp97Joa8AhX4Rw4tE6EHqF1UP8gjmOfS/oT+803VrLfRNYjDIUnYQkJXtnc1zaHdo1SOAEjDu2+i2eoT5HqpzQLK/z3k//J/JHHLIIYcccsghgF9igY5XnkDYfAAAAABJRU5ErkJggg==" alt="QR Android" className="mx-auto h-20 w-20 object-contain" />
                <p className="mt-2 text-[10px] font-semibold text-[var(--app-primary-hover)]">Android APK</p>
              </a>
            </div>
          </div>
        </div>
      </section>

      {negozio.whatsapp && (
        <button
          type="button"
          onClick={apriWhatsApp}
          aria-label="Chatta con noi su WhatsApp"
          className="fixed bottom-[94px] right-4 z-[70] flex h-13 w-13 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_12px_30px_rgba(37,211,102,.28)] ring-2 ring-[#F8F5EF] transition active:scale-95 sm:bottom-6 sm:right-6"
        >
          <IconaWhatsApp />
        </button>
      )}
      <BottomNav active="home" />
    </main>
  );
}
