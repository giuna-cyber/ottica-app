"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Articolo } from "../../catalogo/types";

type RispostaCatalogo = {
  ok: boolean;
  articoli?: Articolo[];
  errore?: string;
};

type RispostaOrdine = {
  ok: boolean;
  ordine_id?: number;
  numero_ordine?: string;
  totale?: number;
  sconto_totale?: number;
  in_promozione?: boolean;
  sconto_percentuale?: number;
  totale_prodotti?: number;
  spese_spedizione?: number;
  spedizione_gratuita?: boolean;
  soglia_spedizione_gratuita?: number;
  messaggio?: string;
  errore?: string;
};

function euro(valore: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(valore);
}

export default function AcquistaProdottoPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const prodottoId = Number(params.id);

  const [prodotto, setProdotto] = useState<Articolo | null>(null);
  const [varianteId, setVarianteId] = useState("");
  const [quantita, setQuantita] = useState(1);

  const [nome, setNome] = useState("");
  const [cognome, setCognome] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");

  const [modalitaConsegna, setModalitaConsegna] =
    useState<"Ritiro in negozio" | "Spedizione">("Ritiro in negozio");

  const [indirizzo, setIndirizzo] = useState("");
  const [civico, setCivico] = useState("");
  const [cap, setCap] = useState("");
  const [citta, setCitta] = useState("");
  const [provincia, setProvincia] = useState("");
  const [note, setNote] = useState("");

  const [caricamento, setCaricamento] = useState(true);
  const [invio, setInvio] = useState(false);
  const [errore, setErrore] = useState("");
  const [ordineCreato, setOrdineCreato] =
    useState<RispostaOrdine | null>(null);

  const [costoSpedizione, setCostoSpedizione] = useState(7.9);
  const [sogliaSpedizioneGratuita, setSogliaSpedizioneGratuita] =
    useState(50);

  useEffect(() => {
    if (!Number.isFinite(prodottoId) || prodottoId <= 0) {
      setErrore("Prodotto non valido.");
      setCaricamento(false);
      return;
    }

    caricaProdotto();
    caricaImpostazioniSpedizione();
  }, [prodottoId]);

  async function caricaImpostazioniSpedizione() {
    try {
      const risposta = await fetch("/api/spedizione", {
        cache: "no-store",
      });

      const dati = await risposta.json();

      if (!risposta.ok || !dati.ok) {
        return;
      }

      setCostoSpedizione(
        Number(dati.costo_spedizione ?? 7.9)
      );

      setSogliaSpedizioneGratuita(
        Number(dati.soglia_spedizione_gratuita ?? 50)
      );
    } catch {
      setCostoSpedizione(7.9);
      setSogliaSpedizioneGratuita(50);
    }
  }

  async function caricaProdotto() {
    setCaricamento(true);
    setErrore("");

    try {
      const risposta = await fetch("/api/catalogo", {
        cache: "no-store",
      });

      const testo = await risposta.text();

      let dati: RispostaCatalogo;

      try {
        dati = JSON.parse(testo) as RispostaCatalogo;
      } catch {
        throw new Error("Risposta catalogo non valida.");
      }

      if (!risposta.ok || !dati.ok) {
        throw new Error(
          dati.errore || "Impossibile caricare il prodotto."
        );
      }

      const trovato =
        (dati.articoli ?? []).find(
          (articolo) => Number(articolo.id) === prodottoId
        ) ?? null;

      if (!trovato) {
        throw new Error("Prodotto non trovato.");
      }

      setProdotto(trovato);

      const primaDisponibile = (trovato.varianti ?? []).find(
        (v) => Number(v.quantita ?? 0) > 0
      );

      if (primaDisponibile) {
        setVarianteId(String(primaDisponibile.id));
      }
    } catch (e) {
      setErrore(
        e instanceof Error
          ? e.message
          : "Impossibile caricare il prodotto."
      );
    } finally {
      setCaricamento(false);
    }
  }

  const varianteSelezionata = useMemo(() => {
    if (!prodotto || !varianteId) return null;

    return (
      (prodotto.varianti ?? []).find(
        (v) => String(v.id) === varianteId
      ) ?? null
    );
  }, [prodotto, varianteId]);

  const maxQuantita = varianteSelezionata
    ? Number(varianteSelezionata.quantita ?? 0)
    : 99;

  const inPromo =
    prodotto?.in_promozione === true &&
    prodotto.prezzo_promozionale !== null &&
    prodotto.sconto_percentuale !== null;

  const prezzoUnitario = prodotto
    ? inPromo
      ? Number(prodotto.prezzo_promozionale)
      : Number(prodotto.prezzo)
    : 0;

  const totaleProdotti = prezzoUnitario * quantita;

  const speseSpedizione =
    modalitaConsegna === "Spedizione" &&
    totaleProdotti < sogliaSpedizioneGratuita
      ? costoSpedizione
      : 0;

  const totale = totaleProdotti + speseSpedizione;

  const mancanoPerSpedizioneGratis = Math.max(
    0,
    sogliaSpedizioneGratuita - totaleProdotti
  );

  function descrizioneVariante() {
    if (!varianteSelezionata) return "";

    return [
      varianteSelezionata.colore,
      varianteSelezionata.taglia,
      varianteSelezionata.misura,
    ]
      .filter(Boolean)
      .join(" · ");
  }

  async function confermaOrdine() {
    if (!prodotto) return;

    setErrore("");
    setOrdineCreato(null);

    if (!nome.trim() || !cognome.trim()) {
      setErrore("Inserisci nome e cognome.");
      return;
    }

    if (!email.trim()) {
      setErrore("Inserisci l'email.");
      return;
    }

    if ((prodotto.varianti ?? []).length > 0 && !varianteId) {
      setErrore("Seleziona una variante.");
      return;
    }

    if (modalitaConsegna === "Spedizione") {
      if (
        !indirizzo.trim() ||
        !civico.trim() ||
        !cap.trim() ||
        !citta.trim() ||
        !provincia.trim()
      ) {
        setErrore("Completa tutti i dati per la spedizione.");
        return;
      }
    }

    setInvio(true);

    try {
      const risposta = await fetch("/api/acquisto", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          articolo_id: prodotto.id,
          variante_id: varianteId ? Number(varianteId) : null,
          quantita,
          nome: nome.trim(),
          cognome: cognome.trim(),
          email: email.trim(),
          telefono: telefono.trim(),
          modalita_consegna: modalitaConsegna,
          indirizzo: indirizzo.trim(),
          civico: civico.trim(),
          cap: cap.trim(),
          citta: citta.trim(),
          provincia: provincia.trim(),
          note: note.trim(),
        }),
      });

      const testo = await risposta.text();

      let dati: RispostaOrdine;

      try {
        dati = JSON.parse(testo) as RispostaOrdine;
      } catch {
        throw new Error("Risposta ordine non valida.");
      }

      if (!risposta.ok || !dati.ok) {
        throw new Error(
          dati.errore || "Impossibile registrare l'ordine."
        );
      }

      setOrdineCreato(dati);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setErrore(
        e instanceof Error
          ? e.message
          : "Impossibile registrare l'ordine."
      );
    } finally {
      setInvio(false);
    }
  }

  if (caricamento) {
    return (
      <main className="min-h-screen bg-[#F6F4EF] px-4 py-16 text-center text-[#20383B]">
        <p className="font-semibold">Caricamento prodotto...</p>
      </main>
    );
  }

  if (!prodotto) {
    return (
      <main className="min-h-screen bg-[#F6F4EF] px-4 py-16 text-center text-[#20383B]">
        <p className="text-lg font-semibold">
          {errore || "Prodotto non disponibile."}
        </p>
        <Link
          href="/catalogo"
          className="mt-6 inline-flex rounded-xl bg-[#7FA39A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#6F918B]"
        >
          Torna al catalogo
        </Link>
      </main>
    );
  }

  if (ordineCreato?.ok) {
    return (
      <main className="min-h-screen bg-[#F6F4EF] px-4 py-10 text-[#20383B]">
        <div className="mx-auto max-w-xl rounded-[24px] border border-[#D9E2DF] bg-[#FBFAF7] p-6 text-center shadow-[0_14px_32px_rgba(80,108,105,.08)] sm:p-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#E7F1EC] text-3xl">
            ✓
          </div>

          <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5D7C73]">
            Ordine ricevuto
          </p>

          <h1 className="mt-2 font-serif text-3xl font-medium tracking-[-0.03em]">
            Grazie per il tuo acquisto
          </h1>

          <p className="mt-4 text-sm leading-6 text-[#738682]">
            Il tuo ordine è stato registrato correttamente.
          </p>

          <div className="mt-6 rounded-2xl bg-[#F6F4EF] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8B9C98]">
              Numero ordine
            </p>
            <p className="mt-1 text-xl font-semibold">
              {ordineCreato.numero_ordine}
            </p>

            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#8B9C98]">
              Spedizione
            </p>
            <p className="mt-1 font-semibold">
              {Number(ordineCreato.spese_spedizione ?? 0) > 0
                ? euro(Number(ordineCreato.spese_spedizione))
                : "Gratuita"}
            </p>

            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#8B9C98]">
              Totale
            </p>
            <p className="mt-1 font-serif text-3xl font-medium text-[#506C69]">
              {euro(Number(ordineCreato.totale ?? 0))}
            </p>

            {Number(ordineCreato.sconto_totale ?? 0) > 0 && (
              <p className="mt-2 text-sm font-semibold text-[#A85D55]">
                Risparmio promo:{" "}
                {euro(Number(ordineCreato.sconto_totale))}
              </p>
            )}
          </div>

          <p className="mt-5 text-sm leading-6 text-[#738682]">
            Pagamento previsto: <strong>in negozio</strong>.
          </p>

          <button
            type="button"
            onClick={() => {
              router.push("/catalogo");
              router.refresh();
            }}
            className="mt-6 flex w-full items-center justify-center rounded-xl bg-[#7FA39A] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#6F918B]"
          >
            Torna al catalogo
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F6F4EF] pb-10 text-[#20383B]">
      <header className="border-b border-[#D9E2DF] bg-[#FBFAF7]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 sm:px-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#89A39D]">
              Acquisto
            </p>
            <h1 className="mt-1 font-serif text-3xl font-medium tracking-[-0.03em] text-[#20383B]">
              Completa il tuo ordine
            </h1>
          </div>

          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-full border border-[#D4DFDB] bg-white px-4 py-2 text-[11px] font-semibold text-[#738682]"
          >
            ← Indietro
          </button>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="lg:sticky lg:top-6 lg:self-start">
          <div className="overflow-hidden rounded-[22px] border border-[#D9E2DF] bg-[#FBFAF7] shadow-[0_12px_30px_rgba(80,108,105,.06)]">
            <div className="relative aspect-square bg-[#F3F5F2]">
              {inPromo && (
                <div className="absolute left-4 top-4 z-10 rounded-full border border-[#E8C8C4] bg-[#F4DCD7] px-3 py-1.5 text-xs font-semibold text-[#8C554F]">
                  PROMO -{Number(prodotto.sconto_percentuale)}%
                </div>
              )}

              {prodotto.immagine_url ? (
                <img
                  src={prodotto.immagine_url}
                  alt={prodotto.nome}
                  className="h-full w-full object-contain p-5"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-[#8FB8B2]">
                  <svg
                    viewBox="0 0 32 24"
                    className="h-14 w-16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  >
                    <ellipse cx="9" cy="13" rx="6" ry="5.5" />
                    <ellipse cx="23" cy="13" rx="6" ry="5.5" />
                    <path d="M15 12c1-1.6 2-1.6 3 0M3 11 1.5 5M29 11 30.5 5" />
                  </svg>
                </div>
              )}
            </div>

            <div className="p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#89A39D]">
                {prodotto.marca || prodotto.categoria}
              </p>

              <h2 className="mt-1 font-serif text-2xl font-medium">
                {prodotto.nome}
              </h2>

              {prodotto.modello && (
                <p className="mt-1 text-sm text-[#7E8F8B]">
                  {prodotto.modello}
                </p>
              )}

              {inPromo ? (
                <div className="mt-4 flex items-end gap-2">
                  <span className="text-sm font-bold text-[#8A9A9E] line-through">
                    {euro(Number(prodotto.prezzo))}
                  </span>
                  <span className="font-serif text-2xl font-medium text-[#A85D55]">
                    {euro(Number(prodotto.prezzo_promozionale))}
                  </span>
                </div>
              ) : (
                <p className="mt-4 font-serif text-2xl font-medium text-[#506C69]">
                  {euro(Number(prodotto.prezzo))}
                </p>
              )}

              {(prodotto.varianti ?? []).length > 0 && (
                <label className="mt-5 block">
                  <span className="mb-2 block text-sm font-semibold">
                    Variante
                  </span>

                  <select
                    value={varianteId}
                    onChange={(e) => {
                      setVarianteId(e.target.value);
                      setQuantita(1);
                    }}
                    className="w-full rounded-xl border border-[#D4DFDB] bg-white px-4 py-3 text-[#20383B] outline-none transition focus:border-[#8FB8B2]"
                  >
                    {(prodotto.varianti ?? []).map((v) => (
                      <option
                        key={v.id}
                        value={v.id}
                        disabled={Number(v.quantita ?? 0) <= 0}
                      >
                        {[
                          v.colore,
                          v.taglia,
                          v.misura,
                        ]
                          .filter(Boolean)
                          .join(" · ") || "Variante"}
                        {" — "}
                        {Number(v.quantita ?? 0)} disp.
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <label className="mt-4 block">
                <span className="mb-2 block text-sm font-semibold">
                  Quantità
                </span>

                <input
                  type="number"
                  min="1"
                  max={Math.max(1, maxQuantita)}
                  value={quantita}
                  onChange={(e) => {
                    const valore = Math.max(
                      1,
                      Math.min(
                        Number(e.target.value || 1),
                        Math.max(1, maxQuantita)
                      )
                    );
                    setQuantita(valore);
                  }}
                  className="w-full rounded-xl border border-[#D4DFDB] bg-white px-4 py-3 text-[#20383B] outline-none transition focus:border-[#8FB8B2]"
                />
              </label>

              {varianteSelezionata && (
                <p className="mt-2 text-xs text-[#8B9C98]">
                  Selezione: {descrizioneVariante()}
                </p>
              )}

              <div className="mt-5 rounded-2xl border border-[#D2DEDA] bg-[#EDF3F0] p-4 text-[#20383B]">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-[#738682]">Prodotti</span>
                  <span className="font-semibold">
                    {euro(totaleProdotti)}
                  </span>
                </div>

                {modalitaConsegna === "Spedizione" && (
                  <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                    <span className="text-[#738682]">Spedizione</span>
                    <span className="font-semibold">
                      {speseSpedizione > 0
                        ? euro(speseSpedizione)
                        : "Gratuita"}
                    </span>
                  </div>
                )}

                <div className="mt-3 border-t border-[#D4DFDB] pt-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#89A39D]">
                    Totale ordine
                  </p>
                  <p className="mt-1 text-3xl font-semibold">
                    {euro(totale)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[22px] border border-[#D9E2DF] bg-[#FBFAF7] p-5 shadow-[0_12px_30px_rgba(80,108,105,.06)] sm:p-6">
          {errore && (
            <div className="mb-5 rounded-2xl border border-[#E9D1CD] bg-[#F8ECE9] p-4 text-sm font-semibold text-[#9A615A]">
              {errore}
            </div>
          )}

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#89A39D]">
              Cliente
            </p>
            <h2 className="mt-1 font-serif text-2xl font-medium">
              I tuoi dati
            </h2>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-semibold">
                Nome *
              </span>
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full rounded-xl border border-[#D4DFDB] bg-white px-4 py-3 text-[#20383B] outline-none transition focus:border-[#8FB8B2]"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-semibold">
                Cognome *
              </span>
              <input
                value={cognome}
                onChange={(e) => setCognome(e.target.value)}
                className="w-full rounded-xl border border-[#D4DFDB] bg-white px-4 py-3 text-[#20383B] outline-none transition focus:border-[#8FB8B2]"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-semibold">
                Email *
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-[#D4DFDB] bg-white px-4 py-3 text-[#20383B] outline-none transition focus:border-[#8FB8B2]"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-semibold">
                Telefono
              </span>
              <input
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full rounded-xl border border-[#D4DFDB] bg-white px-4 py-3 text-[#20383B] outline-none transition focus:border-[#8FB8B2]"
              />
            </label>
          </div>

          <div className="mt-7 border-t border-[#E1E7E4] pt-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#89A39D]">
              Consegna
            </p>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() =>
                  setModalitaConsegna("Ritiro in negozio")
                }
                className={`rounded-2xl border px-4 py-4 text-left ${
                  modalitaConsegna === "Ritiro in negozio"
                    ? "border-[#8FB8B2] bg-[#EDF3F0]"
                    : "border-[#D9E2DF] bg-white"
                }`}
              >
                <p className="font-semibold">Ritiro in negozio</p>
                <p className="mt-1 text-xs text-[#7E8F8B]">
                  Pagamento al ritiro.
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  setModalitaConsegna("Spedizione")
                }
                className={`rounded-2xl border px-4 py-4 text-left ${
                  modalitaConsegna === "Spedizione"
                    ? "border-[#8FB8B2] bg-[#EDF3F0]"
                    : "border-[#D9E2DF] bg-white"
                }`}
              >
                <p className="font-semibold">Spedizione</p>
                <p className="mt-1 text-xs text-[#7E8F8B]">
                  {totaleProdotti >= sogliaSpedizioneGratuita
                    ? "Spedizione gratuita."
                    : `Costo ${euro(costoSpedizione)}.`}
                </p>
              </button>
            </div>

            <div className="mt-3 rounded-2xl border border-[#D9E2DF] bg-[#F3F5F2] p-4 text-sm">
              <p className="font-black text-[#506C69]">
                Spedizione gratuita da {euro(sogliaSpedizioneGratuita)}
              </p>

              {modalitaConsegna === "Spedizione" &&
                totaleProdotti < sogliaSpedizioneGratuita && (
                  <p className="mt-1 text-xs leading-5 text-[#7E8F8B]">
                    Aggiungi ancora {euro(mancanoPerSpedizioneGratis)} di prodotti
                    per ottenere la spedizione gratuita.
                  </p>
                )}

              {modalitaConsegna === "Spedizione" &&
                totaleProdotti >= sogliaSpedizioneGratuita && (
                  <p className="mt-1 text-xs font-semibold text-[#5D7C73]">
                    Hai ottenuto la spedizione gratuita.
                  </p>
                )}
            </div>

            {modalitaConsegna === "Spedizione" && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="sm:col-span-2">
                  <span className="mb-2 block text-sm font-semibold">
                    Indirizzo *
                  </span>
                  <input
                    value={indirizzo}
                    onChange={(e) => setIndirizzo(e.target.value)}
                    className="w-full rounded-xl border border-[#D4DFDB] bg-white px-4 py-3 text-[#20383B] outline-none transition focus:border-[#8FB8B2]"
                  />
                </label>

                <label>
                  <span className="mb-2 block text-sm font-semibold">
                    Civico *
                  </span>
                  <input
                    value={civico}
                    onChange={(e) => setCivico(e.target.value)}
                    className="w-full rounded-xl border border-[#D4DFDB] bg-white px-4 py-3 text-[#20383B] outline-none transition focus:border-[#8FB8B2]"
                  />
                </label>

                <label>
                  <span className="mb-2 block text-sm font-semibold">
                    CAP *
                  </span>
                  <input
                    value={cap}
                    onChange={(e) => setCap(e.target.value)}
                    className="w-full rounded-xl border border-[#D4DFDB] bg-white px-4 py-3 text-[#20383B] outline-none transition focus:border-[#8FB8B2]"
                  />
                </label>

                <label>
                  <span className="mb-2 block text-sm font-semibold">
                    Città *
                  </span>
                  <input
                    value={citta}
                    onChange={(e) => setCitta(e.target.value)}
                    className="w-full rounded-xl border border-[#D4DFDB] bg-white px-4 py-3 text-[#20383B] outline-none transition focus:border-[#8FB8B2]"
                  />
                </label>

                <label>
                  <span className="mb-2 block text-sm font-semibold">
                    Provincia *
                  </span>
                  <input
                    maxLength={2}
                    value={provincia}
                    onChange={(e) =>
                      setProvincia(e.target.value.toUpperCase())
                    }
                    placeholder="NA"
                    className="w-full rounded-xl border border-[#D4DFDB] bg-white px-4 py-3 uppercase text-[#20383B] outline-none transition focus:border-[#8FB8B2]"
                  />
                </label>
              </div>
            )}
          </div>

          <div className="mt-7 border-t border-[#E1E7E4] pt-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#89A39D]">
              Pagamento
            </p>

            <div className="mt-3 rounded-2xl border border-[#D9E2DF] bg-[#F3F5F2] p-4">
              <p className="font-semibold">Pagamento in negozio</p>
              <p className="mt-1 text-sm leading-6 text-[#7E8F8B]">
                Per questa prima versione l'ordine viene prenotato
                online e pagato direttamente in negozio.
              </p>
            </div>
          </div>

          <label className="mt-6 block">
            <span className="mb-2 block text-sm font-semibold">
              Note
            </span>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Eventuali richieste..."
              className="w-full rounded-xl border border-[#D4DFDB] bg-white px-4 py-3 text-[#20383B] outline-none transition focus:border-[#8FB8B2]"
            />
          </label>

          <div className="mt-6 rounded-2xl border border-[#D9E2DF] bg-[#F3F5F2] p-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-[#738682]">
                {prodotto.nome} × {quantita}
              </span>
              <span className="font-semibold">
                {euro(totaleProdotti)}
              </span>
            </div>

            {inPromo && (
              <p className="mt-2 text-xs font-semibold text-[#A85D55]">
                Promozione -{Number(prodotto.sconto_percentuale)}%
                già applicata.
              </p>
            )}

            {modalitaConsegna === "Spedizione" && (
              <div className="mt-3 flex items-center justify-between gap-4 text-sm">
                <span className="font-medium text-[#738682]">
                  Spedizione
                </span>
                <span
                  className={`font-semibold ${
                    speseSpedizione === 0
                      ? "text-[#5D7C73]"
                      : "text-[#20383B]"
                  }`}
                >
                  {speseSpedizione > 0
                    ? euro(speseSpedizione)
                    : "Gratuita"}
                </span>
              </div>
            )}

            <div className="mt-4 flex items-end justify-between border-t border-[#D9E2DF] pt-4">
              <span className="font-semibold">Totale</span>
              <span className="font-serif text-2xl font-medium text-[#506C69]">
                {euro(totale)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={confermaOrdine}
            disabled={invio || maxQuantita <= 0}
            className="mt-6 w-full rounded-xl bg-[#7FA39A] px-5 py-4 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(80,108,105,.12)] transition hover:bg-[#6F918B] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {invio
              ? "Registrazione ordine..."
              : inPromo
              ? "CONFERMA ACQUISTO CON PROMO"
              : "CONFERMA ACQUISTO"}
          </button>

          <p className="mt-3 text-center text-[11px] leading-5 text-[#8B9C98]">
            Confermando l'ordine non viene effettuato alcun addebito online.
          </p>
        </div>
      </section>
    </main>
  );
}
