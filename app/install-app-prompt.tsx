"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}

export default function InstallAppPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [visibile, setVisibile] = useState(false);
  const [ios, setIos] = useState(false);
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    const isIos =
      /iphone|ipad|ipod/i.test(window.navigator.userAgent);

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // Safari iOS
      ("standalone" in window.navigator &&
        Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone));

    setIos(isIos);
    setStandalone(isStandalone);

    if (isStandalone) return;

    const handler = (event: Event) => {
      event.preventDefault();
      const installEvent = event as BeforeInstallPromptEvent;
      setDeferredPrompt(installEvent);
      setVisibile(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Su iPhone mostriamo subito l'istruzione breve.
    if (isIos) {
      setVisibile(true);
    }

    const installedHandler = () => {
      setVisibile(false);
      setDeferredPrompt(null);
      setStandalone(true);
    };

    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  async function installa() {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const scelta = await deferredPrompt.userChoice;

    if (scelta.outcome === "accepted") {
      setVisibile(false);
    }

    setDeferredPrompt(null);
  }

  if (standalone || !visibile) return null;

  return (
    <div className="fixed inset-x-0 bottom-[82px] z-[100] px-3 sm:bottom-6">
      <div className="mx-auto max-w-md overflow-hidden rounded-[24px] border border-[#D9E2DF] bg-[#FBFAF7]/97 p-4 text-[#20383B] shadow-[0_18px_45px_rgba(80,108,105,.16)] backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <img
            src="/icons/icon-192.png"
            alt="Ottica App"
            className="h-14 w-14 shrink-0 rounded-2xl border border-[#D9E2DF] bg-white shadow-sm"
          />

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7FA39A]">
              Ottica App
            </p>

            <h2 className="mt-1 font-serif text-lg font-medium leading-tight tracking-[-0.02em]">
              Installa l&apos;app sul telefono
            </h2>

            {ios ? (
              <p className="mt-2 text-xs leading-5 text-[#738682]">
                Tocca <b>Condividi</b> e poi <b>Aggiungi alla schermata Home</b>.
              </p>
            ) : (
              <p className="mt-2 text-xs leading-5 text-[#738682]">
                Un solo tocco per aggiungerla alla schermata Home.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setVisibile(false)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#D9E2DF] bg-white text-lg font-semibold text-[#7E8F8B] transition hover:bg-[#EDF3F0]"
            aria-label="Chiudi"
          >
            ×
          </button>
        </div>

        {!ios && deferredPrompt && (
          <button
            type="button"
            onClick={installa}
            className="mt-4 flex min-h-[52px] w-full items-center justify-center rounded-xl bg-[#7FA39A] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(80,108,105,.12)] transition hover:bg-[#6F918B] active:scale-[0.99]"
          >
            INSTALLA OTTICA APP
          </button>
        )}
      </div>
    </div>
  );
}
