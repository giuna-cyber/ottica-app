"use client";

import Link from "next/link";

function IconaHome() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 10.5V20h13v-9.5" />
    </svg>
  );
}

function IconaOcchiali() {
  return (
    <svg viewBox="0 0 64 64" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="3">
      <circle cx="18" cy="36" r="10" />
      <circle cx="46" cy="36" r="10" />
      <path d="M28 35c2-2 6-2 8 0" />
      <path d="M8 34 12 21" />
      <path d="M56 34 52 21" />
    </svg>
  );
}

function IconaCalendario() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </svg>
  );
}

function IconaPromo() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m20 12-8 8-8-8 8-8 8 8Z" />
      <path d="M9 9h.01M15 15h.01M15 9l-6 6" />
    </svg>
  );
}

function IconaProfilo() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4.5 4.2-6.5 8-6.5s6.5 2 8 6.5" />
    </svg>
  );
}

function Freccia() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#F4F7F6] text-[#102A2E] pb-24">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0C252B]/95 text-white backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#0C252B] shadow-sm">
              <IconaOcchiali />
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#92D8DF]">
                Centro ottico
              </p>
              <h1 className="text-lg font-black tracking-tight">
                OTTICA APP
              </h1>
            </div>
          </div>

          <Link
            href="/login"
            className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-black transition active:scale-95"
          >
            Admin
          </Link>
        </div>
      </header>

      <section
        className="relative min-h-[72vh] overflow-hidden bg-cover bg-center text-white sm:min-h-[680px]"
        style={{ backgroundImage: "url('/images/home-bg.png')" }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,18,22,0.16)_0%,rgba(5,18,22,0.22)_36%,rgba(5,18,22,0.82)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,18,22,0.56)_0%,rgba(5,18,22,0.15)_58%,rgba(5,18,22,0.05)_100%)] sm:bg-[linear-gradient(90deg,rgba(5,18,22,0.76)_0%,rgba(5,18,22,0.36)_46%,rgba(5,18,22,0.08)_100%)]" />

        <div className="relative mx-auto flex min-h-[72vh] max-w-6xl items-end px-4 pb-10 pt-8 sm:min-h-[680px] sm:items-center sm:px-6 sm:pb-16 sm:pt-14">
          <div className="max-w-xl">
            <span className="inline-flex rounded-full border border-white/20 bg-black/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-[#C8EEF1] backdrop-blur-sm">
              Visione • Stile • Benessere
            </span>

            <h2 className="mt-5 text-[2.5rem] font-black leading-[0.95] tracking-[-0.05em] drop-shadow-lg sm:text-6xl">
              Guarda il mondo,
              <span className="block text-[#A7E7EC]">con altri occhi.</span>
            </h2>

            <p className="mt-5 max-w-lg text-[15px] leading-7 text-white/88 drop-shadow sm:text-lg">
              Occhiali, promozioni e servizi pensati per il tuo sguardo.
            </p>

            <div className="mt-7 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
              <Link
                href="/catalogo"
                className="col-span-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm font-black text-[#0C252B] shadow-xl transition active:scale-[0.98] sm:col-span-1"
              >
                Scopri il catalogo
                <Freccia />
              </Link>

              <Link
                href="/appuntamenti"
                className="inline-flex items-center justify-center rounded-2xl bg-[#07181C]/92 px-5 py-3.5 text-sm font-black text-white shadow-xl backdrop-blur transition active:scale-[0.98]"
              >
                Prenota
              </Link>

              <Link
                href="/promozioni"
                className="inline-flex items-center justify-center rounded-2xl border border-white/25 bg-white/12 px-5 py-3.5 text-sm font-black text-white backdrop-blur-md transition active:scale-[0.98]"
              >
                Promozioni
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-2.5">
              <div className="rounded-2xl border border-white/12 bg-black/15 p-3 backdrop-blur-md">
                <p className="text-xl font-black">+200</p>
                <p className="mt-1 text-[11px] leading-4 text-white/70">Montature</p>
              </div>

              <div className="rounded-2xl border border-white/12 bg-black/15 p-3 backdrop-blur-md">
                <p className="text-xl font-black">24/7</p>
                <p className="mt-1 text-[11px] leading-4 text-white/70">Prenotazioni</p>
              </div>

              <div className="rounded-2xl border border-white/12 bg-black/15 p-3 backdrop-blur-md">
                <p className="text-xl font-black">1 click</p>
                <p className="mt-1 text-[11px] leading-4 text-white/70">Per iniziare</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(169,214,222,0.28),transparent_42%),linear-gradient(180deg,#F4F7F6_0%,#EDF4F4_100%)]" />

        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="mb-7 max-w-2xl">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#3D7881]">
              Servizi
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-[-0.045em] sm:text-4xl">
              Servizi pensati
              <span className="block text-[#1D6E7A]">
                per il tuo sguardo.
              </span>
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-[#657B80] sm:text-base">
              Scopri le collezioni, prenota il tuo controllo e approfitta
              delle promozioni dedicate.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Link
              href="/catalogo"
              className="group relative overflow-hidden rounded-[28px] border border-[#D7E5E6] bg-white/95 p-5 shadow-[0_18px_50px_rgba(16,42,46,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(16,42,46,0.13)] active:scale-[0.99]"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-[#0C252B]" />
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#0C252B]/5" />

              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0C252B] text-white shadow-lg shadow-[#0C252B]/15 transition duration-300 group-hover:scale-105">
                  <IconaOcchiali />
                </div>

                <h3 className="mt-5 text-xl font-black tracking-[-0.02em]">
                  Montature
                </h3>

                <p className="mt-2 min-h-[48px] text-sm leading-6 text-[#657B80]">
                  Collezioni da vista e da sole per ogni stile e personalità.
                </p>

                <div className="mt-5 flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-[#0C252B]">
                    Esplora
                  </span>

                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F1F5F5] text-[#0C252B] transition duration-300 group-hover:translate-x-1 group-hover:bg-[#0C252B] group-hover:text-white">
                    <Freccia />
                  </span>
                </div>
              </div>
            </Link>

            <Link
              href="/appuntamenti"
              className="group relative overflow-hidden rounded-[28px] border border-[#D7E5E6] bg-white/95 p-5 shadow-[0_18px_50px_rgba(16,42,46,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(16,42,46,0.13)] active:scale-[0.99]"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-[#1F5963]" />
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#1F5963]/6" />

              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1F5963] text-white shadow-lg shadow-[#1F5963]/15 transition duration-300 group-hover:scale-105">
                  <IconaCalendario />
                </div>

                <h3 className="mt-5 text-xl font-black tracking-[-0.02em]">
                  Controllo visivo
                </h3>

                <p className="mt-2 min-h-[48px] text-sm leading-6 text-[#657B80]">
                  Scegli giorno e orario e prenota il tuo controllo in pochi secondi.
                </p>

                <div className="mt-5 flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-[#1F5963]">
                    Prenota
                  </span>

                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F1F5F5] text-[#1F5963] transition duration-300 group-hover:translate-x-1 group-hover:bg-[#1F5963] group-hover:text-white">
                    <Freccia />
                  </span>
                </div>
              </div>
            </Link>

            <Link
              href="/promozioni"
              className="group relative overflow-hidden rounded-[28px] border border-[#D7E5E6] bg-white/95 p-5 shadow-[0_18px_50px_rgba(16,42,46,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(16,42,46,0.13)] active:scale-[0.99]"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-[#6CAAB2]" />
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#6CAAB2]/10" />

              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6CAAB2] text-white shadow-lg shadow-[#6CAAB2]/20 transition duration-300 group-hover:scale-105">
                  <IconaPromo />
                </div>

                <h3 className="mt-5 text-xl font-black tracking-[-0.02em]">
                  Promozioni
                </h3>

                <p className="mt-2 min-h-[48px] text-sm leading-6 text-[#657B80]">
                  Scopri le offerte attive su montature, prodotti e servizi.
                </p>

                <div className="mt-5 flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-[#4F8F98]">
                    Scopri
                  </span>

                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F1F5F5] text-[#4F8F98] transition duration-300 group-hover:translate-x-1 group-hover:bg-[#6CAAB2] group-hover:text-white">
                    <Freccia />
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#DCE6E6] bg-white/95 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 shadow-[0_-8px_30px_rgba(16,42,46,0.08)] backdrop-blur-xl">
        <div className="mx-auto grid max-w-md grid-cols-5">
          <Link href="/" className="flex flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[#0C252B]">
            <IconaHome />
            <span className="text-[10px] font-black">Home</span>
          </Link>

          <Link href="/catalogo" className="flex flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[#789095]">
            <IconaOcchiali />
            <span className="text-[10px] font-bold">Catalogo</span>
          </Link>

          <Link href="/appuntamenti" className="flex flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[#789095]">
            <IconaCalendario />
            <span className="text-[10px] font-bold">Prenota</span>
          </Link>

          <Link href="/promozioni" className="flex flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[#789095]">
            <IconaPromo />
            <span className="text-[10px] font-bold">Promo</span>
          </Link>

          <Link href="/profilo" className="flex flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[#789095]">
            <IconaProfilo />
            <span className="text-[10px] font-bold">Profilo</span>
          </Link>
        </div>
      </nav>
    </main>
  );
}
