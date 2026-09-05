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
    <div className="fixed inset-x-0 bottom-[74px] z-[100] px-3 sm:bottom-5">
      <div className="mx-auto max-w-md overflow-hidden rounded-[24px] border border-white/15 bg-[#071E26]/96 p-4 text-white shadow-[0_18px_45px_rgba(0,0,0,0.28)] backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <img
            src="/icons/icon-192.png"
            alt="Ottica App"
            className="h-14 w-14 shrink-0 rounded-2xl"
          />

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8ED7DF]">
              Ottica App
            </p>

            <h2 className="mt-1 text-lg font-black leading-tight">
              Installa l&apos;app sul telefono
            </h2>

            {ios ? (
              <p className="mt-2 text-xs leading-5 text-white/70">
                Tocca <b>Condividi</b> e poi <b>Aggiungi alla schermata Home</b>.
              </p>
            ) : (
              <p className="mt-2 text-xs leading-5 text-white/70">
                Un solo tocco per aggiungerla alla schermata Home.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setVisibile(false)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-lg font-bold text-white/70"
            aria-label="Chiudi"
          >
            ×
          </button>
        </div>

        {!ios && deferredPrompt && (
          <button
            type="button"
            onClick={installa}
            className="mt-4 flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-black text-[#082E38] shadow-lg transition active:scale-[0.99]"
          >
            INSTALLA OTTICA APP
          </button>
        )}
      </div>
    </div>
  );
}
