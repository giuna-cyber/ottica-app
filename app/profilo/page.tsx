"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Cliente = {
  id: number;
  nome: string;
  cognome: string | null;
  telefono: string;
  email: string;
  note?: string | null;
};

type Appuntamento = {
  id: number;
  nome_cliente: string;
  telefono: string;
  email: string | null;
  note: string | null;
  data_appuntamento: string;
  ora_inizio: string;
  ora_fine: string | null;
  stato: string;
  tipo_appuntamento: string;
};

type RigaOrdine = {
  id: number;
  articolo_id: number;
  nome_articolo: string;
  marca: string | null;
  modello: string | null;
  descrizione_variante: string | null;
  quantita: number;
  prezzo_unitario: number;
  sconto_percentuale: number;
  prezzo_unitario_finale: number;
  totale_riga: number;
  immagine_url: string | null;
};

type Ordine = {
  id: number;
  numero_ordine: string;
  modalita_consegna: string;
  metodo_pagamento: string;
  stato_pagamento: string;
  stato_ordine: string;
  subtotale: number;
  sconto_totale: number;
  spese_spedizione: number;
  totale: number;
  creato_il: string;
  righe: RigaOrdine[];
};

function dataIt(data: string) {
  const p = data.split("-");
  if (p.length !== 3) return data;
  return `${p[2]}/${p[1]}/${p[0]}`;
}

function ora(oraValue: string | null) {
  return oraValue ? oraValue.slice(0, 5) : "-";
}

function classeStato(stato: string) {
  if (stato === "Confermato") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (stato === "Annullato") {
    return "bg-red-50 text-red-700";
  }

  return "bg-amber-50 text-amber-700";
}

function euro(valore: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(valore);
}

function dataOraIt(valore: string) {
  const data = new Date(valore.replace(" ", "T"));

  if (Number.isNaN(data.getTime())) {
    return valore;
  }

  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(data);
}

function classeStatoOrdine(stato: string) {
  if (stato === "Completato") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (stato === "Annullato") {
    return "bg-red-50 text-red-700";
  }

  if (stato === "Spedito" || stato === "Pronto per il ritiro") {
    return "bg-sky-50 text-sky-700";
  }

  return "bg-amber-50 text-amber-700";
}

function classeStatoPagamento(stato: string) {
  if (stato === "Pagato") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (stato === "Rimborsato") {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-red-50 text-red-700";
}

export default function ProfiloPage() {
  const router = useRouter();

  const [modalita, setModalita] = useState<"login" | "registrazione">("login");
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [appuntamenti, setAppuntamenti] = useState<Appuntamento[]>([]);
  const [ordini, setOrdini] = useState<Ordine[]>([]);

  const [nome, setNome] = useState("");
  const [cognome, setCognome] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mostraPassword, setMostraPassword] = useState(false);

  const [errore, setErrore] = useState("");
  const [messaggio, setMessaggio] = useState("");
  const [caricamento, setCaricamento] = useState(false);

  useEffect(() => {
    const salvato = sessionStorage.getItem("ottica_cliente");

    if (!salvato) {
      return;
    }

    try {
      const dati = JSON.parse(salvato) as Cliente;
      setCliente(dati);
      caricaProfilo(dati.id);
    } catch {
      sessionStorage.removeItem("ottica_cliente");
    }
  }, []);

  async function caricaProfilo(clienteId: number) {
    setErrore("");

    try {
      const risposta = await fetch(
        `/api/cliente/profilo?cliente_id=${clienteId}`,
        {
          cache: "no-store",
        }
      );

      const dati = await risposta.json();

      if (!risposta.ok || !dati.ok) {
        throw new Error(
          dati.errore || "Impossibile caricare il profilo."
        );
      }

      const c = dati.cliente as Cliente;

      setCliente(c);
      setNome(c.nome);
      setCognome(c.cognome ?? "");
      setTelefono(c.telefono);
      setEmail(c.email);
      setAppuntamenti(dati.appuntamenti ?? []);
      await caricaOrdini(c.id);

      sessionStorage.setItem(
        "ottica_cliente",
        JSON.stringify(c)
      );
    } catch (e) {
      setErrore(
        e instanceof Error
          ? e.message
          : "Impossibile caricare il profilo."
      );
    }
  }

  async function caricaOrdini(clienteId: number) {
    try {
      const risposta = await fetch(
        `/api/cliente/ordini?cliente_id=${clienteId}`,
        {
          cache: "no-store",
        }
      );

      const dati = await risposta.json();

      if (!risposta.ok || !dati.ok) {
        throw new Error(
          dati.errore || "Impossibile caricare gli ordini."
        );
      }

      setOrdini(dati.ordini ?? []);
    } catch (e) {
      setErrore(
        e instanceof Error
          ? e.message
          : "Impossibile caricare gli ordini."
      );
    }
  }

  async function login(evento: FormEvent) {
    evento.preventDefault();
    setCaricamento(true);
    setErrore("");
    setMessaggio("");

    try {
      const risposta = await fetch("/api/cliente/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const dati = await risposta.json();

      if (!risposta.ok || !dati.ok) {
        throw new Error(
          dati.errore || "Credenziali non valide."
        );
      }

      sessionStorage.setItem(
        "ottica_cliente",
        JSON.stringify(dati.cliente)
      );

      setCliente(dati.cliente);
      setPassword("");

      await caricaProfilo(dati.cliente.id);
    } catch (e) {
      setErrore(
        e instanceof Error
          ? e.message
          : "Errore durante il login."
      );
    } finally {
      setCaricamento(false);
    }
  }

  async function registra(evento: FormEvent) {
    evento.preventDefault();
    setCaricamento(true);
    setErrore("");
    setMessaggio("");

    try {
      const risposta = await fetch("/api/cliente/registra", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome,
          cognome,
          telefono,
          email,
          password,
        }),
      });

      const dati = await risposta.json();

      if (!risposta.ok || !dati.ok) {
        throw new Error(
          dati.errore || "Registrazione non riuscita."
        );
      }

      sessionStorage.setItem(
        "ottica_cliente",
        JSON.stringify(dati.cliente)
      );

      setCliente(dati.cliente);
      setPassword("");
      setMessaggio("Registrazione completata.");

      await caricaProfilo(dati.cliente.id);
    } catch (e) {
      setErrore(
        e instanceof Error
          ? e.message
          : "Registrazione non riuscita."
      );
    } finally {
      setCaricamento(false);
    }
  }

  async function salvaProfilo() {
    if (!cliente) return;

    setCaricamento(true);
    setErrore("");
    setMessaggio("");

    try {
      const risposta = await fetch("/api/cliente/profilo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cliente_id: cliente.id,
          nome,
          cognome,
          telefono,
          email,
        }),
      });

      const dati = await risposta.json();

      if (!risposta.ok || !dati.ok) {
        throw new Error(
          dati.errore || "Aggiornamento non riuscito."
        );
      }

      setMessaggio("Profilo aggiornato.");
      await caricaProfilo(cliente.id);
    } catch (e) {
      setErrore(
        e instanceof Error
          ? e.message
          : "Aggiornamento non riuscito."
      );
    } finally {
      setCaricamento(false);
    }
  }

  function logout() {
    sessionStorage.removeItem("ottica_cliente");
    setCliente(null);
    setAppuntamenti([]);
    setOrdini([]);
    setNome("");
    setCognome("");
    setTelefono("");
    setEmail("");
    setPassword("");
    setErrore("");
    setMessaggio("");
    setModalita("login");
    router.refresh();
  }

  if (!cliente) {
    return (
      <main className="min-h-screen bg-[#F5F9F9] pb-24 text-[#102A2E]">
        <header className="bg-[linear-gradient(135deg,#083B4C,#1D6E7A)] text-white">
          <div className="mx-auto max-w-xl px-4 py-8">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#D8F4F7]">
              Area cliente
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-[-0.05em]">
              Il tuo profilo
            </h1>
          </div>
        </header>

        <section className="mx-auto max-w-xl px-4 py-6">
          {errore && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-black text-red-700">
              {errore}
            </div>
          )}

          {messaggio && (
            <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-black text-emerald-700">
              {messaggio}
            </div>
          )}

          <div className="rounded-3xl border border-[#DCE8E9] bg-white p-5 shadow-sm">
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[#F1F6F6] p-1">
              <button
                type="button"
                onClick={() => setModalita("login")}
                className={`rounded-xl px-4 py-3 text-sm font-black ${
                  modalita === "login"
                    ? "bg-[#083B4C] text-white"
                    : "text-[#5D858C]"
                }`}
              >
                Accedi
              </button>

              <button
                type="button"
                onClick={() => setModalita("registrazione")}
                className={`rounded-xl px-4 py-3 text-sm font-black ${
                  modalita === "registrazione"
                    ? "bg-[#083B4C] text-white"
                    : "text-[#5D858C]"
                }`}
              >
                Registrati
              </button>
            </div>

            <form
              onSubmit={
                modalita === "login"
                  ? login
                  : registra
              }
              className="mt-5 grid gap-4"
            >
              {modalita === "registrazione" && (
                <>
                  <label>
                    <span className="mb-2 block text-sm font-black">
                      Nome *
                    </span>
                    <input
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="w-full rounded-xl border border-[#C9DADC] px-4 py-3"
                    />
                  </label>

                  <label>
                    <span className="mb-2 block text-sm font-black">
                      Cognome
                    </span>
                    <input
                      value={cognome}
                      onChange={(e) => setCognome(e.target.value)}
                      className="w-full rounded-xl border border-[#C9DADC] px-4 py-3"
                    />
                  </label>

                  <label>
                    <span className="mb-2 block text-sm font-black">
                      Telefono *
                    </span>
                    <input
                      type="tel"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      className="w-full rounded-xl border border-[#C9DADC] px-4 py-3"
                    />
                  </label>
                </>
              )}

              <label>
                <span className="mb-2 block text-sm font-black">
                  Email *
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-[#C9DADC] px-4 py-3"
                />
              </label>

              <label>
                <span className="mb-2 block text-sm font-black">
                  Password *
                </span>

                <div className="relative">
                  <input
                    type={mostraPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-[#C9DADC] px-4 py-3 pr-12"
                  />

                  <button
                    type="button"
                    onClick={() => setMostraPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[#5D858C]"
                    aria-label={
                      mostraPassword
                        ? "Nascondi password"
                        : "Mostra password"
                    }
                    title={
                      mostraPassword
                        ? "Nascondi password"
                        : "Mostra password"
                    }
                  >
                    {mostraPassword ? (
                      <svg
                        viewBox="0 0 24 24"
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M3 3l18 18" />
                        <path d="M10.6 10.7a2 2 0 0 0 2.7 2.7" />
                        <path d="M9.9 4.2A10.5 10.5 0 0 1 12 4c5.5 0 9 5.5 9 5.5a16.5 16.5 0 0 1-3.2 3.8" />
                        <path d="M6.2 6.2C4.2 7.6 3 9.5 3 9.5S6.5 15 12 15c1.2 0 2.3-.3 3.3-.7" />
                      </svg>
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
                        <circle cx="12" cy="12" r="2.5" />
                      </svg>
                    )}
                  </button>
                </div>

                {modalita === "login" && (
                  <div className="mt-2 text-right">
                    <Link
                      href="/recupera-password"
                      className="text-xs font-black text-[#1D6E7A] underline underline-offset-2"
                    >
                      Password dimenticata?
                    </Link>
                  </div>
                )}
              </label>

              <button
                type="submit"
                disabled={caricamento}
                className="rounded-2xl bg-[linear-gradient(135deg,#083B4C,#1D6E7A)] px-5 py-4 text-sm font-black text-white disabled:opacity-50"
              >
                {caricamento
                  ? "Attendere..."
                  : modalita === "login"
                  ? "Accedi"
                  : "Crea account"}
              </button>
            </form>
          </div>
        </section>

        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#DCE6E6] bg-white/95 px-2 py-3 text-center">
          <div className="mx-auto grid max-w-md grid-cols-5">
            <Link href="/" className="text-[10px] font-bold text-[#789095]">
              Home
            </Link>
            <Link href="/catalogo" className="text-[10px] font-bold text-[#789095]">
              Catalogo
            </Link>
            <Link href="/appuntamenti" className="text-[10px] font-bold text-[#789095]">
              Prenota
            </Link>
            <Link href="/promozioni" className="text-[10px] font-bold text-[#789095]">
              Promo
            </Link>
            <Link href="/profilo" className="text-[10px] font-black text-[#0C252B]">
              Profilo
            </Link>
          </div>
        </nav>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F9F9] pb-24 text-[#102A2E]">
      <header className="bg-[linear-gradient(135deg,#083B4C,#1D6E7A)] text-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#D8F4F7]">
              Area cliente
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-[-0.05em]">
              Ciao {cliente.nome}
            </h1>
          </div>

          <button
            type="button"
            onClick={logout}
            className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-black"
          >
            Esci
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-4 py-6">
        {errore && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-black text-red-700">
            {errore}
          </div>
        )}

        {messaggio && (
          <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-black text-emerald-700">
            {messaggio}
          </div>
        )}

        <div className="rounded-3xl border border-[#DCE8E9] bg-white p-5 shadow-sm">
          <h2 className="text-2xl font-black">
            I tuoi dati
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-black">
                Nome
              </span>
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full rounded-xl border border-[#C9DADC] px-4 py-3"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-black">
                Cognome
              </span>
              <input
                value={cognome}
                onChange={(e) => setCognome(e.target.value)}
                className="w-full rounded-xl border border-[#C9DADC] px-4 py-3"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-black">
                Telefono
              </span>
              <input
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full rounded-xl border border-[#C9DADC] px-4 py-3"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-black">
                Email
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-[#C9DADC] px-4 py-3"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={salvaProfilo}
            disabled={caricamento}
            className="mt-5 w-full rounded-2xl bg-[linear-gradient(135deg,#083B4C,#1D6E7A)] px-5 py-4 text-sm font-black text-white disabled:opacity-50"
          >
            Salva modifiche
          </button>
        </div>

        <div className="mt-6">
          <h2 className="text-2xl font-black">
            I tuoi appuntamenti
          </h2>

          <div className="mt-4 grid gap-3">
            {appuntamenti.length === 0 ? (
              <div className="rounded-3xl border border-[#DCE8E9] bg-white p-8 text-center">
                <div className="text-4xl">📅</div>
                <p className="mt-3 font-black">
                  Nessun appuntamento
                </p>
              </div>
            ) : (
              appuntamenti.map((a) => (
                <article
                  key={a.id}
                  className="rounded-2xl border border-[#DCE8E9] bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-black">
                        {a.tipo_appuntamento}
                      </p>

                      <p className="mt-1 text-sm text-[#60777C]">
                        {dataIt(a.data_appuntamento)}
                        {" · "}
                        {ora(a.ora_inizio)}
                        {a.ora_fine
                          ? ` - ${ora(a.ora_fine)}`
                          : ""}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-black ${classeStato(
                        a.stato
                      )}`}
                    >
                      {a.stato}
                    </span>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-black">
            I miei ordini
          </h2>

          <div className="mt-4 grid gap-4">
            {ordini.length === 0 ? (
              <div className="rounded-3xl border border-[#DCE8E9] bg-white p-8 text-center">
                <div className="text-4xl">🛍️</div>
                <p className="mt-3 font-black">
                  Nessun ordine
                </p>
                <p className="mt-1 text-sm text-[#60777C]">
                  I tuoi acquisti compariranno qui.
                </p>
              </div>
            ) : (
              ordini.map((ordine) => (
                <article
                  key={ordine.id}
                  className="overflow-hidden rounded-3xl border border-[#DCE8E9] bg-white shadow-sm"
                >
                  <div className="p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#789095]">
                          Ordine
                        </p>
                        <p className="mt-1 font-black">
                          {ordine.numero_ordine}
                        </p>
                        <p className="mt-1 text-xs text-[#60777C]">
                          {dataOraIt(ordine.creato_il)}
                        </p>
                      </div>

                      <div className="text-right">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black ${classeStatoOrdine(
                            ordine.stato_ordine
                          )}`}
                        >
                          {ordine.stato_ordine}
                        </span>

                        <p className="mt-2 text-xl font-black text-[#083B4C]">
                          {euro(Number(ordine.totale))}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3">
                      {(ordine.righe ?? []).map((riga) => (
                        <div
                          key={riga.id}
                          className="grid grid-cols-[76px_1fr] gap-3 rounded-2xl border border-[#E4EEEE] bg-[#F8FBFB] p-3"
                        >
                          <div className="aspect-square overflow-hidden rounded-xl bg-white">
                            {riga.immagine_url ? (
                              <img
                                src={riga.immagine_url}
                                alt={riga.nome_articolo}
                                className="h-full w-full object-contain p-2"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-3xl">
                                👓
                              </div>
                            )}
                          </div>

                          <div>
                            <p className="font-black">
                              {riga.nome_articolo}
                            </p>

                            <p className="mt-1 text-xs text-[#60777C]">
                              {[riga.marca, riga.modello]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>

                            {riga.descrizione_variante && (
                              <p className="mt-1 text-xs font-bold text-[#4E7F86]">
                                {riga.descrizione_variante}
                              </p>
                            )}

                            <p className="mt-2 text-sm font-black">
                              Q.tà {riga.quantita} ·{" "}
                              {euro(Number(riga.totale_riga))}
                            </p>

                            {Number(riga.sconto_percentuale) > 0 && (
                              <p className="mt-1 text-xs font-black text-red-600">
                                Promo -{Number(riga.sconto_percentuale)}%
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
                      <div className="rounded-xl bg-[#F5F9F9] p-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#789095]">
                          Consegna
                        </p>
                        <p className="mt-1 font-black">
                          {ordine.modalita_consegna}
                        </p>
                      </div>

                      <div className="rounded-xl bg-[#F5F9F9] p-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#789095]">
                          Pagamento
                        </p>
                        <span
                          className={`mt-2 inline-flex rounded-full px-3 py-1 text-[10px] font-black ${classeStatoPagamento(
                            ordine.stato_pagamento
                          )}`}
                        >
                          {ordine.stato_pagamento}
                        </span>
                      </div>

                      <div className="rounded-xl bg-[#F5F9F9] p-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#789095]">
                          Totale
                        </p>
                        <p className="mt-1 font-black text-[#083B4C]">
                          {euro(Number(ordine.totale))}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#DCE6E6] bg-white/95 px-2 py-3 text-center">
        <div className="mx-auto grid max-w-md grid-cols-5">
          <Link href="/" className="text-[10px] font-bold text-[#789095]">
            Home
          </Link>
          <Link href="/catalogo" className="text-[10px] font-bold text-[#789095]">
            Catalogo
          </Link>
          <Link href="/appuntamenti" className="text-[10px] font-bold text-[#789095]">
            Prenota
          </Link>
          <Link href="/promozioni" className="text-[10px] font-bold text-[#789095]">
            Promo
          </Link>
          <Link href="/profilo" className="text-[10px] font-black text-[#0C252B]">
            Profilo
          </Link>
        </div>
      </nav>
    </main>
  );
}
