"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";

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
  const router = useRouter();
  const [dati, setDati] = useState<Negozio>(vuoto);
  const [caricamento, setCaricamento] = useState(true);
  const [salvataggio, setSalvataggio] = useState(false);
  const [errore, setErrore] = useState("");
  const [messaggio, setMessaggio] = useState("");
  const [caricamentoLogo, setCaricamentoLogo] = useState(false);
  const [erroreLogo, setErroreLogo] = useState("");
  const inputLogoRef = useRef<HTMLInputElement | null>(null);

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


  async function ridimensionaLogo(file: File): Promise<Blob> {
    const MAX_LARGHEZZA = 1200;
    const MAX_ALTEZZA = 500;

    const urlTemporaneo = URL.createObjectURL(file);

    try {
      const immagine = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Immagine non valida."));
        img.src = urlTemporaneo;
      });

      const rapporto = Math.min(
        1,
        MAX_LARGHEZZA / immagine.naturalWidth,
        MAX_ALTEZZA / immagine.naturalHeight
      );

      const larghezza = Math.max(1, Math.round(immagine.naturalWidth * rapporto));
      const altezza = Math.max(1, Math.round(immagine.naturalHeight * rapporto));

      const canvas = document.createElement("canvas");
      canvas.width = larghezza;
      canvas.height = altezza;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Impossibile elaborare l'immagine.");
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.clearRect(0, 0, larghezza, altezza);
      ctx.drawImage(immagine, 0, 0, larghezza, altezza);

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/webp", 0.9);
      });

      if (!blob) {
        throw new Error("Impossibile creare il logo ridimensionato.");
      }

      return blob;
    } finally {
      URL.revokeObjectURL(urlTemporaneo);
    }
  }

  async function selezionaLogo(evento: ChangeEvent<HTMLInputElement>) {
    const file = evento.target.files?.[0];

    if (!file) return;

    setErroreLogo("");
    setMessaggio("");

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setErroreLogo("Formato non supportato. Usa JPG, PNG o WEBP.");
      evento.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErroreLogo("Il file è troppo grande. Dimensione massima: 10 MB.");
      evento.target.value = "";
      return;
    }

    setCaricamentoLogo(true);

    try {
      const logoRidimensionato = await ridimensionaLogo(file);

      const formData = new FormData();
      formData.append(
        "logo",
        new File([logoRidimensionato], "logo.webp", {
          type: "image/webp",
        })
      );

      const risposta = await fetch("/api/admin/logo", {
        method: "POST",
        body: formData,
      });

      const payload = await risposta.json();

      if (!risposta.ok || !payload.ok || !payload.url) {
        throw new Error(payload.errore || "Caricamento del logo non riuscito.");
      }

      aggiorna("logo_url", String(payload.url));
      setMessaggio(
        "Logo caricato. Premi “Salva dati centro ottico” per confermare."
      );
    } catch (e) {
      setErroreLogo(
        e instanceof Error ? e.message : "Caricamento del logo non riuscito."
      );
    } finally {
      setCaricamentoLogo(false);
      evento.target.value = "";
    }
  }

  function rimuoviLogo() {
    aggiorna("logo_url", "");
    setErroreLogo("");
    setMessaggio(
      "Logo rimosso. Premi “Salva dati centro ottico” per confermare."
    );
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
      router.push("/admin");
      router.refresh();
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
    <main className="min-h-screen bg-[#F6F4EF] pb-12 text-[#20383B]">
      <header className="bg-[linear-gradient(135deg,#506C69,#7FA39A)] text-white">
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
          <div className="mb-4 rounded-2xl border border-[#E9D1CD] bg-[#F8ECE9] p-4 text-sm font-semibold text-[#9A615A]">
            {errore}
          </div>
        )}

        {messaggio && (
          <div className="mb-4 rounded-2xl border border-[#CFE0D8] bg-[#EDF5F0] p-4 text-sm font-semibold text-[#55766D]">
            {messaggio}
          </div>
        )}

        {caricamento ? (
          <div className="rounded-[22px] border border-[#D9E2DF] bg-[#FBFAF7] p-8 text-center font-medium text-[#738682]">
            Caricamento...
          </div>
        ) : (
          <form
            onSubmit={salva}
            className="rounded-[24px] border border-[#D9E2DF] bg-[#FBFAF7] p-5 shadow-[0_12px_30px_rgba(80,108,105,.05)] sm:p-7"
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

              <div className="sm:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-[#20383B]">
                  Logo del centro ottico
                </span>

                <input
                  ref={inputLogoRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={selezionaLogo}
                  className="hidden"
                />

                <div className="rounded-[20px] border border-[#D9E2DF] bg-[#F3F5F2] p-4">
                  <div className="grid gap-4 sm:grid-cols-[180px_1fr] sm:items-center">
                    <div className="flex h-32 items-center justify-center overflow-hidden rounded-xl border border-[#D9E2DF] bg-white">
                      {dati.logo_url ? (
                        <img
                          src={dati.logo_url}
                          alt="Logo centro ottico"
                          className="max-h-full max-w-full object-contain p-3"
                        />
                      ) : (
                        <div className="px-4 text-center text-xs font-medium text-[#879B96]">
                          Nessun logo caricato
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="text-sm leading-6 text-[#738682]">
                        Carica JPG, PNG o WEBP. L&apos;immagine viene ridimensionata
                        automaticamente mantenendo le proporzioni.
                      </p>
                      <p className="mt-1 text-xs text-[#94A29E]">
                        Dimensione massima originale: 10 MB. Output massimo: 1200 × 500 px.
                      </p>

                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          type="button"
                          disabled={caricamentoLogo}
                          onClick={() => inputLogoRef.current?.click()}
                          className="rounded-xl bg-[#7FA39A] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6F918B] disabled:opacity-50"
                        >
                          {caricamentoLogo ? "Caricamento..." : "Carica logo"}
                        </button>

                        {dati.logo_url && (
                          <button
                            type="button"
                            disabled={caricamentoLogo}
                            onClick={rimuoviLogo}
                            className="rounded-xl border border-[#D4DFDB] bg-white px-4 py-2.5 text-sm font-semibold text-[#6F918B] transition hover:bg-[#EDF3F0] disabled:opacity-50"
                          >
                            Rimuovi logo
                          </button>
                        )}
                      </div>

                      {erroreLogo && (
                        <p className="mt-3 text-sm font-semibold text-[#9A615A]">
                          {erroreLogo}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <label className="sm:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-[#20383B]">
                  Orari di apertura
                </span>
                <textarea
                  value={dati.orari_apertura}
                  onChange={(e) =>
                    aggiorna("orari_apertura", e.target.value)
                  }
                  rows={5}
                  placeholder={"Lun-Ven 09:00-13:00 / 15:30-19:30\nSab 09:00-13:00"}
                  className="w-full resize-y rounded-xl border border-[#D4DFDB] bg-white px-4 py-3 text-[#20383B] outline-none transition focus:border-[#8FB8B2]"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={
                salvataggio ||
                !dati.nome_negozio.trim() ||
                !dati.whatsapp.trim()
              }
              className="mt-7 w-full rounded-xl bg-[#7FA39A] px-5 py-4 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(80,108,105,.12)] transition hover:bg-[#6F918B] disabled:opacity-40"
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
      <span className="mb-2 block text-sm font-semibold text-[#20383B]">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#D4DFDB] bg-white px-4 py-3 text-[#20383B] outline-none transition focus:border-[#8FB8B2]"
      />
    </label>
  );
}
