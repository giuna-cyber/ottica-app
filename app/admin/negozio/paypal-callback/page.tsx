"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Stato = "elaborazione" | "successo" | "errore";

export default function PayPalCallbackPage() {
  const searchParams = useSearchParams();

  const [stato, setStato] = useState<Stato>("elaborazione");
  const [messaggio, setMessaggio] = useState(
    "Verifica del collegamento PayPal in corso..."
  );

  useEffect(() => {
    async function completaCollegamento() {
      try {
        /*
         * PayPal restituisce i parametri dell'onboarding
         * nella query string del return_url.
         *
         * Li inoltriamo al nostro endpoint server-side,
         * che verificherà il merchant direttamente
         * tramite PayPal prima di salvarlo.
         */
        const parametri = new URLSearchParams(
          searchParams.toString()
        );

        const merchantId =
          parametri.get("merchantIdInPayPal");

        if (!merchantId) {
          throw new Error(
            "PayPal non ha restituito l'identificativo del conto del negozio."
          );
        }

        const risposta = await fetch(
          "/api/paypal/onboarding/callback",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              merchantIdInPayPal: merchantId,
              merchantId:
                parametri.get("merchantId"),
              permissionsGranted:
                parametri.get("permissionsGranted"),
              consentStatus:
                parametri.get("consentStatus"),
              accountStatus:
                parametri.get("accountStatus"),
              isEmailConfirmed:
                parametri.get("isEmailConfirmed"),
            }),
          }
        );

        const testo = await risposta.text();

        let payload: {
          ok?: boolean;
          errore?: string;
          messaggio?: string;
        };

        try {
          payload = JSON.parse(testo);
        } catch {
          throw new Error(
            "Il server ha restituito una risposta non valida."
          );
        }

        if (!risposta.ok || !payload.ok) {
          throw new Error(
            payload.errore ||
              "Impossibile completare il collegamento PayPal."
          );
        }

        setStato("successo");
        setMessaggio(
          payload.messaggio ||
            "Account PayPal collegato correttamente."
        );
      } catch (errore) {
        setStato("errore");

        setMessaggio(
          errore instanceof Error
            ? errore.message
            : "Impossibile completare il collegamento PayPal."
        );
      }
    }

    completaCollegamento();
  }, [searchParams]);

  return (
    <main className="min-h-screen bg-[#F6F4EF] px-4 py-10 text-[#20383B]">
      <div className="mx-auto max-w-xl">
        <div className="rounded-[24px] border border-[#D9E2DF] bg-[#FBFAF7] p-6 shadow-[0_12px_30px_rgba(80,108,105,.05)] sm:p-8">
          <div className="text-center">
            {stato === "elaborazione" && (
              <>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EDF3F0]">
                  <div className="h-7 w-7 animate-spin rounded-full border-4 border-[#C7D8D3] border-t-[#7FA39A]" />
                </div>

                <h1 className="mt-5 text-2xl font-black tracking-[-0.03em]">
                  Collegamento PayPal
                </h1>

                <p className="mt-3 text-sm leading-6 text-[#738682]">
                  {messaggio}
                </p>
              </>
            )}

            {stato === "successo" && (
              <>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#E7F3EC] text-3xl font-black text-[#55766D]">
                  ✓
                </div>

                <h1 className="mt-5 text-2xl font-black tracking-[-0.03em]">
                  PayPal collegato
                </h1>

                <p className="mt-3 text-sm leading-6 text-[#738682]">
                  {messaggio}
                </p>

                <p className="mt-2 text-sm leading-6 text-[#738682]">
                  Il centro ottico potrà ricevere direttamente
                  i pagamenti dei propri clienti tramite PayPal.
                </p>

                <Link
                  href="/admin/negozio"
                  className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-[#7FA39A] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#6F918B]"
                >
                  Torna ai dati del centro ottico
                </Link>
              </>
            )}

            {stato === "errore" && (
              <>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F8ECE9] text-3xl font-black text-[#9A615A]">
                  !
                </div>

                <h1 className="mt-5 text-2xl font-black tracking-[-0.03em]">
                  Collegamento non completato
                </h1>

                <p className="mt-3 text-sm leading-6 text-[#9A615A]">
                  {messaggio}
                </p>

                <Link
                  href="/admin/negozio"
                  className="mt-6 inline-flex w-full items-center justify-center rounded-xl border border-[#D4DFDB] bg-white px-5 py-3.5 text-sm font-semibold text-[#55766D] transition hover:bg-[#EDF3F0]"
                >
                  Torna ai dati del centro ottico
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}