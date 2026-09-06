"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import InstallAppPrompt from "./install-app-prompt";

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

function IconaTelefono() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="6.5" y="2.5" width="11" height="19" rx="2.5" />
      <path d="M10 18.5h4" />
    </svg>
  );
}


function IconaWhatsApp() {
  return (
    <svg
      viewBox="0 0 32 32"
      className="h-6 w-6"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M16.02 3C8.85 3 3.03 8.77 3.03 15.88c0 2.27.6 4.48 1.73 6.42L3 29l6.9-1.8a13.03 13.03 0 0 0 6.12 1.55h.01c7.16 0 12.99-5.77 12.99-12.87C29.02 8.77 23.19 3 16.02 3Zm0 23.58h-.01a10.82 10.82 0 0 1-5.52-1.5l-.4-.24-4.09 1.07 1.09-3.95-.26-.41a10.63 10.63 0 0 1-1.66-5.67c0-5.9 4.86-10.7 10.85-10.7 5.98 0 10.85 4.8 10.85 10.7 0 5.9-4.87 10.7-10.85 10.7Zm5.95-8.01c-.33-.16-1.94-.95-2.24-1.06-.3-.11-.52-.16-.74.16-.22.32-.85 1.06-1.04 1.27-.19.22-.38.24-.71.08-.33-.16-1.39-.51-2.65-1.62-.98-.86-1.64-1.93-1.83-2.25-.19-.32-.02-.5.14-.66.15-.14.33-.38.49-.57.16-.19.22-.32.33-.54.11-.22.05-.41-.03-.57-.08-.16-.74-1.76-1.01-2.41-.27-.64-.54-.55-.74-.56h-.63c-.22 0-.57.08-.87.41-.3.32-1.15 1.11-1.15 2.71 0 1.6 1.18 3.14 1.34 3.36.16.22 2.32 3.51 5.62 4.92.79.34 1.4.54 1.88.69.79.25 1.5.21 2.07.13.63-.09 1.94-.78 2.21-1.54.27-.76.27-1.41.19-1.54-.08-.14-.3-.22-.63-.38Z" />
    </svg>
  );
}

function preparaNumeroWhatsApp(numero: string) {
  let pulito = numero.replace(/\D/g, "");

  if (pulito.startsWith("00")) {
    pulito = pulito.slice(2);
  }

  if (pulito.length === 10 && pulito.startsWith("3")) {
    pulito = `39${pulito}`;
  }

  return pulito;
}

export default function HomePage() {
  const [whatsapp, setWhatsapp] = useState("");

  useEffect(() => {
    async function caricaWhatsapp() {
      try {
        const risposta = await fetch("/api/negozio", {
          cache: "no-store",
        });

        const dati = await risposta.json();

        if (
          risposta.ok &&
          dati.ok &&
          dati.negozio?.whatsapp
        ) {
          setWhatsapp(String(dati.negozio.whatsapp));
        }
      } catch {
        setWhatsapp("");
      }
    }

    caricaWhatsapp();
  }, []);

  function apriWhatsApp() {
    const numero = preparaNumeroWhatsApp(whatsapp);

    if (!numero) return;

    const messaggio = encodeURIComponent(
      "Ciao, vorrei avere informazioni."
    );

    const appUrl = `whatsapp://send?phone=${numero}&text=${messaggio}`;
    const webUrl = `https://wa.me/${numero}?text=${messaggio}`;

    let fallbackAvviato = false;

    const fallback = window.setTimeout(() => {
      fallbackAvviato = true;
      window.location.href = webUrl;
    }, 900);

    const annullaFallback = () => {
      if (!fallbackAvviato) {
        window.clearTimeout(fallback);
      }
    };

    window.addEventListener("pagehide", annullaFallback, { once: true });
    document.addEventListener(
      "visibilitychange",
      () => {
        if (document.visibilityState === "hidden") {
          annullaFallback();
        }
      },
      { once: true }
    );

    window.location.href = appUrl;
  }

  return (
    <main className="min-h-screen bg-[#F4F7F6] text-[#102A2E] pb-24">
      <InstallAppPrompt />
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

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-6">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#4E7F86]">
            Servizi
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.04em]">
            Tutto per la tua vista.
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            href="/catalogo"
            className="rounded-3xl border border-[#D9E5E5] bg-white p-5 shadow-[0_12px_28px_rgba(16,42,46,0.07)] transition active:scale-[0.99]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0C252B] text-white">
              <IconaOcchiali />
            </div>
            <h3 className="mt-4 text-xl font-black">Montature</h3>
            <p className="mt-2 text-sm leading-6 text-[#657B80]">
              Vista, sole, uomo, donna e bambino.
            </p>
          </Link>

          <Link
            href="/appuntamenti"
            className="rounded-3xl border border-[#D9E5E5] bg-white p-5 shadow-[0_12px_28px_rgba(16,42,46,0.07)] transition active:scale-[0.99]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1F5963] text-white">
              <IconaCalendario />
            </div>
            <h3 className="mt-4 text-xl font-black">Controllo visivo</h3>
            <p className="mt-2 text-sm leading-6 text-[#657B80]">
              Prenota giorno e orario in pochi secondi.
            </p>
          </Link>

          <Link
            href="/promozioni"
            className="rounded-3xl border border-[#D9E5E5] bg-white p-5 shadow-[0_12px_28px_rgba(16,42,46,0.07)] transition active:scale-[0.99]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#6CAAB2] text-white">
              <IconaPromo />
            </div>
            <h3 className="mt-4 text-xl font-black">Promozioni</h3>
            <p className="mt-2 text-sm leading-6 text-[#657B80]">
              Offerte dedicate su prodotti e servizi.
            </p>
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6 sm:pb-14">
        <div className="relative overflow-hidden rounded-[32px] border border-[#B7CED1] bg-[#0C252B] p-5 text-white shadow-[0_20px_50px_rgba(12,37,43,0.16)] sm:p-8">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-28 left-1/3 h-72 w-72 rounded-full border border-[#78C4CC]/15" />

          <div className="relative">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#A7E7EC] ring-1 ring-white/15">
                <IconaTelefono />
              </div>

              <p className="mt-5 text-[10px] font-black uppercase tracking-[0.22em] text-[#92D8DF]">
                Ottica App sul tuo smartphone
              </p>

              <h2 className="mt-2 max-w-xl text-3xl font-black tracking-[-0.04em] sm:text-4xl">
                Installa Ottica App.
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/72 sm:text-base">
                Scegli il QR code in base al tuo dispositivo.
              </p>
            </div>

            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <div className="rounded-[28px] bg-white p-5 text-[#0C252B] shadow-[0_18px_45px_rgba(0,0,0,0.22)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#789095]">
                      Apple
                    </p>
                    <h3 className="mt-1 text-xl font-black">
                      iPhone / iPad
                    </h3>
                  </div>
                  <div className="rounded-xl bg-[#0C252B] px-3 py-2 text-xs font-black text-white">iOS</div>
                </div>

                <img
                  src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAXIAAAFyAQAAAADAX2ykAAACjUlEQVR4nO2bQW7cMAxFHysDWWqAOUCOIt+gZ+0N7KP0AAGsZQAZvwtJ42mCNg3qMWKAWnhhvwWBP58iKY2Jz6z526dwcN5555133nnn/8RbWwPMl9VszAOQzSD3b+OB8Ti/M58kSQuQliCIBbNLEBAkSfqdf3Q8zu/M55tDAU3ZTFMs2AhUYx8bj/P78MO7N/lamL8LSz8NkY+Nx/l9+Xf6ziOmtIDmSyiHx+P8vnzXNwrIYEnrYGlaB9JyMQHcj0C+WvzO/xM/m5nZBSA/qT0IspG1ls/HxuP8Tnz17+ZQQUHz86sxP79aM/Zx8Ti/L09tfpIKmggiLSAtob+LpSJ1TV8tfuc/WE23WO6bYGIBokRagjRFqX51fU/Gcz+8qLOM0j8sNP9O3H4HXy1+5z9YW+6FWNAU1Q3bJ1ktZ7u+J+S7vgu0XAxN0CmqzSe37O36nozvvuwy1tKqrm1P9vrqrPytvmqb8J1rdbMz4P49J3/Lz61MrvXV1hptD/fvGfm7/nfrhdpjy9lyfU/K3/m3Nry1oAKgitxztufnM/Ldvwvca7lAm29s7nZ9T8j3+XMGI74MwDoAoTB/XwfIFz8/OjF/23/7hquF24bbj3/TErw/OjPfphoq2BglyP1cONXp5er3687JVx376W4oLRdHYenHVUa+Fohl0DHxOP8QPvUhZTvLz2aaWK0OsWZ78vuT5+b7/UlNBNkYJbNnidnMSHr1+xvn5N/erzMAwTpoHg2Rr8VmC7I0HRGP84/lJfVbz7XSiuWv/KPjcf7/+Lf3J5nHUDRbkNVOOC4IVvP66pR803eu+2volXR8MZGfZOShGPHlqHic35c3fczcLf9/t/POO++8887vwP8CkjL70D2MLcsAAAAASUVORK5CYII="
                  alt="QR code Apple per aprire Ottica App"
                  className="mx-auto mt-4 aspect-square w-full max-w-[230px] object-contain"
                />

                <p className="mt-4 text-center text-sm font-black">
                  Apri la versione web
                </p>
                <p className="mt-1 text-center text-[11px] leading-5 text-[#789095]">
                  Da Safari puoi usare “Aggiungi alla schermata Home”.
                </p>

                <a
                  href="https://appottica.xcodelab.it"
                  className="mt-4 flex w-full items-center justify-center rounded-2xl bg-[#0C252B] px-4 py-3 text-sm font-black text-white"
                >
                  Apri su Apple
                </a>
              </div>

              <div className="rounded-[28px] bg-white p-5 text-[#0C252B] shadow-[0_18px_45px_rgba(0,0,0,0.22)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#789095]">
                      Android
                    </p>
                    <h3 className="mt-1 text-xl font-black">
                      Scarica APK
                    </h3>
                  </div>
                  <div className="text-3xl">🤖</div>
                </div>

                <img
                  src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZoAAAGaAQAAAAAefbjOAAAC/klEQVR4nO2cTW6kMBBG3zcg9RKkOUAfBW6QI+Vq+Cg5QEt4GcmoZmGbJpmRRqNkoBPKqwb8RKF2189XpmX88wg//p0BhxxyyCGHHHLoe0Iqo4UgiaAWjbGF0APEOmE8xDyHdoQwMzMGMzObG4POypgohwxzY5t504M/k0OfAcXVAbBIY5T0bK+C2GITkD3IUeY5dCAUL9U9xBboEhr/z50cekSofXdsxF4AqmeW1oifcCeHvgZUV0RnkL/4LuVzBgbEi9XDA8xz6CgoSJJ60BgvOZXUGFs0AhpZcqlxlHkO7e0jNg4g9MiIi+qFRPEgR5jn0O7Qb9XnMAOw1qEz2ERjNtXJXn2eA1okXROQv/1FNsUaJgZLaKSx99B+5jm0F1R/9p1lL5AlKe6fqmDFMLuPOANEVSgTNXTAfYHUqFGHa5YngSRdqiR1Dw5dgnA100hVsY8xz6EjMstUPENOL6u3gC5VR9El9xEngLYrwubGbKpLgMFKHlHnJc8jzgQ1Jl1fpeeZHCvy6WEu7kHSxTQeZZ5De0HFR9ClLDvUkuJNEKEGDI8a3x+qmmW8GHQ3AU0iPN3Q8CIYplflq2HtfT36Mzn0EWirR9jMJpnYjJx30riPOAG0Ro03MtWwkSca416R+or49tAaNdoEsU0aDBTUGMQ+t8AsPN0E3a22zh/8mRz6OCRdXwVd2UaXfUS4JvK54aVIV0W9/BLP5NDH9Ii5qXvpeLP9dtsZ9b7GGaB1RUBJJrJinbIUUZbKvc3hK+K7QzWz3HQzSo5ZPIOtVUfnesQZoLX3uUaI+U3Hc606GGavPs8A5fKhik9NMuJ62M0Q+hsQfyZgke1tnkO7Q+931RXPMK9XZ2rPyxWqU0DbzDK/zDfXK2s/tBx33vs8KVSrzymur/dUUVvjp97Joa8AhX4Rw4tE6EHqF1UP8gjmOfS/oT+803VrLfRNYjDIUnYQkJXtnc1zaHdo1SOAEjDu2+i2eoT5HqpzQLK/z3k//J/JHHLIIYcccsghgF9igY5XnkDYfAAAAABJRU5ErkJggg=="
                  alt="QR code Android per scaricare Ottica App APK"
                  className="mx-auto mt-4 aspect-square w-full max-w-[230px] object-contain"
                />

                <p className="mt-4 text-center text-sm font-black">
                  Download diretto APK
                </p>
                <p className="mt-1 text-center text-[11px] leading-5 text-[#789095]">
                  Scansiona il QR e installa Ottica App sul dispositivo Android.
                </p>

                <a
                  href="/downloads/OtticaApp.apk"
                  download
                  className="mt-4 flex w-full items-center justify-center rounded-2xl bg-[#1D6E7A] px-4 py-3 text-sm font-black text-white"
                >
                  Scarica APK
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {whatsapp && (
        <button
          type="button"
          onClick={apriWhatsApp}
          aria-label="Chatta con noi su WhatsApp"
          className="fixed bottom-[92px] right-4 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_12px_28px_rgba(37,211,102,0.35)] ring-4 ring-white transition active:scale-95 sm:bottom-6 sm:right-6"
        >
          <IconaWhatsApp />
        </button>
      )}

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
