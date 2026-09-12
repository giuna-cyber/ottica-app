"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Variante = {
  id?: number;
  taglia: string;
  misura: string;
  colore: string;
  quantita: number;
};

type Prodotto = {
  id: number;
  nome: string;
  descrizione: string | null;
  categoria: string;
  prezzo: number;
  disponibile: number;
  immagine_url: string | null;
  marca: string | null;
  modello: string | null;
  codice_articolo: string | null;
  materiale: string | null;
  forma: string | null;
  genere: string | null;
  tipo_lente: string | null;
  colore_lente: string | null;
  varianti: Variante[];
};

const varianteVuota = (): Variante => ({
  taglia: "",
  misura: "",
  colore: "",
  quantita: 0,
});

export default function AdminCatalogoPage() {
  const router = useRouter();

  const [prodotti, setProdotti] = useState<Prodotto[]>([]);
  const [id, setId] = useState(0);

  const [nome, setNome] = useState("");
  const [descrizione, setDescrizione] = useState("");
  const [categoria, setCategoria] = useState("Vista");
  const [prezzo, setPrezzo] = useState("");
  const [disponibile, setDisponibile] = useState(true);
  const [immagineUrl, setImmagineUrl] = useState("");
  const [marca, setMarca] = useState("");
  const [modello, setModello] = useState("");
  const [codiceArticolo, setCodiceArticolo] = useState("");
  const [materiale, setMateriale] = useState("");
  const [forma, setForma] = useState("");
  const [genere, setGenere] = useState("");
  const [tipoLente, setTipoLente] = useState("");
  const [coloreLente, setColoreLente] = useState("");
  const [varianti, setVarianti] = useState<Variante[]>([
    varianteVuota(),
  ]);

  const [ricerca, setRicerca] = useState("");
  const [errore, setErrore] = useState("");
  const [messaggio, setMessaggio] = useState("");
  const [caricamento, setCaricamento] = useState(true);
  const [salvataggio, setSalvataggio] = useState(false);
  const [uploadInCorso, setUploadInCorso] = useState(false);

  useEffect(() => {
    caricaCatalogo();
  }, []);

  async function caricaCatalogo() {
    setCaricamento(true);
    setErrore("");

    try {
      const risposta = await fetch("/api/admin/catalogo", {
        cache: "no-store",
      });

      if (risposta.status === 401) {
        router.replace("/login");
        return;
      }

      const dati = await risposta.json();

      if (!risposta.ok || !dati.ok) {
        throw new Error(
          dati.errore || "Impossibile caricare il catalogo."
        );
      }

      setProdotti(dati.articoli ?? []);
    } catch (e) {
      setErrore(
        e instanceof Error
          ? e.message
          : "Impossibile caricare il catalogo."
      );
    } finally {
      setCaricamento(false);
    }
  }

  function nuovoProdotto() {
    setId(0);
    setNome("");
    setDescrizione("");
    setCategoria("Vista");
    setPrezzo("");
    setDisponibile(true);
    setImmagineUrl("");
    setMarca("");
    setModello("");
    setCodiceArticolo("");
    setMateriale("");
    setForma("");
    setGenere("");
    setTipoLente("");
    setColoreLente("");
    setVarianti([varianteVuota()]);
    setErrore("");
    setMessaggio("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function modificaProdotto(p: Prodotto) {
    setId(p.id);
    setNome(p.nome);
    setDescrizione(p.descrizione ?? "");
    setCategoria(p.categoria || "Vista");
    setPrezzo(String(p.prezzo ?? ""));
    setDisponibile(p.disponibile === 1);
    setImmagineUrl(p.immagine_url ?? "");
    setMarca(p.marca ?? "");
    setModello(p.modello ?? "");
    setCodiceArticolo(p.codice_articolo ?? "");
    setMateriale(p.materiale ?? "");
    setForma(p.forma ?? "");
    setGenere(p.genere ?? "");
    setTipoLente(p.tipo_lente ?? "");
    setColoreLente(p.colore_lente ?? "");
    setVarianti(
      p.varianti?.length
        ? p.varianti.map((v) => ({
            id: v.id,
            taglia: v.taglia ?? "",
            misura: v.misura ?? "",
            colore: v.colore ?? "",
            quantita: Number(v.quantita ?? 0),
          }))
        : [varianteVuota()]
    );
    setErrore("");
    setMessaggio("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function caricaImmagine(file: File) {
    setUploadInCorso(true);
    setErrore("");
    setMessaggio("");

    try {
      const formData = new FormData();
      formData.append("immagine", file);

      const risposta = await fetch(
        "/api/admin/catalogo/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      if (risposta.status === 401) {
        router.replace("/login");
        return;
      }

      const dati = await risposta.json();

      if (!risposta.ok || !dati.ok) {
        throw new Error(
          dati.errore || "Upload immagine non riuscito."
        );
      }

      setImmagineUrl(dati.url);
      setMessaggio("Immagine caricata correttamente.");
    } catch (e) {
      setErrore(
        e instanceof Error
          ? e.message
          : "Upload immagine non riuscito."
      );
    } finally {
      setUploadInCorso(false);
    }
  }

  function aggiornaVariante(
    indice: number,
    campo: keyof Variante,
    valore: string | number
  ) {
    setVarianti((correnti) =>
      correnti.map((v, i) =>
        i === indice
          ? {
              ...v,
              [campo]:
                campo === "quantita"
                  ? Number(valore)
                  : valore,
            }
          : v
      )
    );
  }

  function aggiungiVariante() {
    setVarianti((correnti) => [
      ...correnti,
      varianteVuota(),
    ]);
  }

  function eliminaVariante(indice: number) {
    setVarianti((correnti) => {
      const nuove = correnti.filter(
        (_, i) => i !== indice
      );

      return nuove.length > 0
        ? nuove
        : [varianteVuota()];
    });
  }

  async function inviaAzione(
    corpo: Record<string, unknown>
  ) {
    const risposta = await fetch("/api/admin/catalogo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(corpo),
    });

    if (risposta.status === 401) {
      router.replace("/login");
      return null;
    }

    const dati = await risposta.json();

    if (!risposta.ok || !dati.ok) {
      throw new Error(
        dati.errore || "Operazione non riuscita."
      );
    }

    return dati;
  }

  async function salvaProdotto() {
    setSalvataggio(true);
    setErrore("");
    setMessaggio("");

    try {
      const dati = await inviaAzione({
        azione: "salva",
        id,
        nome,
        descrizione,
        categoria,
        prezzo: Number(prezzo || 0),
        disponibile: disponibile ? 1 : 0,
        immagine_url: immagineUrl,
        marca,
        modello,
        codice_articolo: codiceArticolo,
        materiale,
        forma,
        genere,
        tipo_lente: tipoLente,
        colore_lente: coloreLente,
        varianti,
      });

      if (!dati) return;

      setMessaggio("Prodotto salvato correttamente.");
      await caricaCatalogo();

      if (id === 0) {
        const urlSalvata = immagineUrl;
        nuovoProdotto();
        setMessaggio(
          urlSalvata
            ? "Prodotto e immagine salvati correttamente."
            : "Prodotto creato correttamente."
        );
      }
    } catch (e) {
      setErrore(
        e instanceof Error
          ? e.message
          : "Errore durante il salvataggio."
      );
    } finally {
      setSalvataggio(false);
    }
  }

  async function cambiaDisponibilita(p: Prodotto) {
    setErrore("");
    setMessaggio("");

    try {
      await inviaAzione({
        azione: "disponibile",
        id: p.id,
        disponibile: p.disponibile === 1 ? 0 : 1,
      });

      await caricaCatalogo();
    } catch (e) {
      setErrore(
        e instanceof Error
          ? e.message
          : "Errore durante l'aggiornamento."
      );
    }
  }

  async function eliminaProdotto(p: Prodotto) {
    if (
      !window.confirm(
        `Eliminare definitivamente "${p.nome}"?`
      )
    ) {
      return;
    }

    setErrore("");
    setMessaggio("");

    try {
      await inviaAzione({
        azione: "elimina",
        id: p.id,
      });

      if (id === p.id) {
        nuovoProdotto();
      }

      setMessaggio("Prodotto eliminato.");
      await caricaCatalogo();
    } catch (e) {
      setErrore(
        e instanceof Error
          ? e.message
          : "Errore durante l'eliminazione."
      );
    }
  }

  const prodottiFiltrati = useMemo(() => {
    const testo = ricerca.trim().toLowerCase();

    if (!testo) return prodotti;

    return prodotti.filter((p) =>
      [
        p.nome,
        p.marca,
        p.modello,
        p.codice_articolo,
        p.categoria,
        p.genere,
      ].some((valore) =>
        (valore ?? "").toLowerCase().includes(testo)
      )
    );
  }, [prodotti, ricerca]);

  return (
    <main className="min-h-screen bg-[#F6F4EF] pb-10 text-[#20383B]">
      <header className="border-b border-[#D9E2DF] bg-[#FBFAF7]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-7 sm:flex-row sm:items-end sm:justify-between sm:px-6 sm:py-9">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#89A39D]">
              Area amministrativa
            </p>
            <h1 className="mt-2 font-serif text-4xl font-medium tracking-[-0.04em] text-[#20383B] sm:text-5xl">
              Gestione Catalogo
            </h1>
            <p className="mt-2 text-sm text-[#7E8F8B]">
              Prodotti, immagini, varianti e disponibilità.
            </p>
          </div>

          <Link
            href="/admin"
            className="w-fit rounded-full border border-[#D4DFDB] bg-white px-4 py-2 text-[11px] font-semibold text-[#738682] transition hover:bg-[#F3F5F2]"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
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

        <div className="rounded-[24px] border border-[#D9E2DF] bg-[#FBFAF7] p-5 shadow-[0_12px_30px_rgba(80,108,105,.05)] sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#89A39D]">
                Prodotto
              </p>
              <h2 className="mt-1 font-serif text-2xl font-medium tracking-[-0.025em]">
                {id > 0
                  ? "Modifica prodotto"
                  : "Nuovo prodotto"}
              </h2>
            </div>

            {id > 0 && (
              <button
                type="button"
                onClick={nuovoProdotto}
                className="rounded-full border border-[#8FB8B2] bg-white px-4 py-2 text-xs font-semibold text-[#6F918B] transition hover:bg-[#EDF3F0]"
              >
                Nuovo prodotto
              </button>
            )}
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                Marca
              </span>
              <input
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                className="w-full rounded-xl border border-[#D4DFDB] bg-white px-4 py-3 text-[#20383B] outline-none transition focus:border-[#8FB8B2]"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-semibold">
                Modello
              </span>
              <input
                value={modello}
                onChange={(e) => setModello(e.target.value)}
                className="w-full rounded-xl border border-[#D4DFDB] bg-white px-4 py-3 text-[#20383B] outline-none transition focus:border-[#8FB8B2]"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-semibold">
                Codice articolo
              </span>
              <input
                value={codiceArticolo}
                onChange={(e) =>
                  setCodiceArticolo(e.target.value)
                }
                className="w-full rounded-xl border border-[#D4DFDB] bg-white px-4 py-3 text-[#20383B] outline-none transition focus:border-[#8FB8B2]"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-semibold">
                Categoria
              </span>
              <select
                value={categoria}
                onChange={(e) =>
                  setCategoria(e.target.value)
                }
                className="w-full rounded-xl border border-[#D4DFDB] bg-white px-4 py-3 text-[#20383B] outline-none transition focus:border-[#8FB8B2]"
              >
                <option value="Vista">Vista</option>
                <option value="Sole">Sole</option>
                <option value="Accessori">Accessori</option>
              </select>
            </label>

            <label>
              <span className="mb-2 block text-sm font-semibold">
                Genere
              </span>
              <select
                value={genere}
                onChange={(e) => setGenere(e.target.value)}
                className="w-full rounded-xl border border-[#D4DFDB] bg-white px-4 py-3 text-[#20383B] outline-none transition focus:border-[#8FB8B2]"
              >
                <option value="">Non specificato</option>
                <option value="Uomo">Uomo</option>
                <option value="Donna">Donna</option>
                <option value="Unisex">Unisex</option>
                <option value="Bambino">Bambino</option>
              </select>
            </label>

            <label>
              <span className="mb-2 block text-sm font-semibold">
                Prezzo €
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={prezzo}
                onChange={(e) => setPrezzo(e.target.value)}
                className="w-full rounded-xl border border-[#D4DFDB] bg-white px-4 py-3 text-[#20383B] outline-none transition focus:border-[#8FB8B2]"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-semibold">
                Materiale
              </span>
              <input
                value={materiale}
                onChange={(e) =>
                  setMateriale(e.target.value)
                }
                className="w-full rounded-xl border border-[#D4DFDB] bg-white px-4 py-3 text-[#20383B] outline-none transition focus:border-[#8FB8B2]"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-semibold">
                Forma
              </span>
              <input
                value={forma}
                onChange={(e) => setForma(e.target.value)}
                className="w-full rounded-xl border border-[#D4DFDB] bg-white px-4 py-3 text-[#20383B] outline-none transition focus:border-[#8FB8B2]"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-semibold">
                Tipo lente
              </span>
              <input
                value={tipoLente}
                onChange={(e) =>
                  setTipoLente(e.target.value)
                }
                className="w-full rounded-xl border border-[#D4DFDB] bg-white px-4 py-3 text-[#20383B] outline-none transition focus:border-[#8FB8B2]"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-semibold">
                Colore lente
              </span>
              <input
                value={coloreLente}
                onChange={(e) =>
                  setColoreLente(e.target.value)
                }
                className="w-full rounded-xl border border-[#D4DFDB] bg-white px-4 py-3 text-[#20383B] outline-none transition focus:border-[#8FB8B2]"
              />
            </label>

            <div className="sm:col-span-2 lg:col-span-3">
              <span className="mb-2 block text-sm font-semibold">
                Immagine prodotto
              </span>

              <div className="grid gap-4 rounded-[20px] border border-[#D9E2DF] bg-[#F3F5F2] p-4 sm:grid-cols-[180px_1fr]">
                <div className="aspect-square overflow-hidden rounded-2xl border border-[#D4DFDB] bg-white">
                  {immagineUrl ? (
                    <img
                      src={immagineUrl}
                      alt="Anteprima prodotto"
                      className="h-full w-full object-contain p-3"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[#8FB8B2]">
                      <svg viewBox="0 0 32 24" className="h-10 w-12" fill="none" stroke="currentColor" strokeWidth="1.7">
                        <ellipse cx="9" cy="13" rx="6" ry="5.5" />
                        <ellipse cx="23" cy="13" rx="6" ry="5.5" />
                        <path d="M15 12c1-1.6 2-1.6 3 0M3 11 1.5 5M29 11 30.5 5" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-center gap-3">
                  <label className="block">
                    <span className="mb-2 block text-xs font-semibold text-[#89A39D]">
                      Carica dal computer
                    </span>

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      disabled={uploadInCorso}
                      onChange={(e) => {
                        const file = e.target.files?.[0];

                        if (file) {
                          caricaImmagine(file);
                        }

                        e.target.value = "";
                      }}
                      className="block w-full rounded-xl border border-[#D4DFDB] bg-white px-3 py-3 text-sm"
                    />
                  </label>

                  <p className="text-xs leading-5 text-[#8B9C98]">
                    JPG, PNG o WEBP. Dimensione massima 5 MB.
                  </p>

                  {uploadInCorso && (
                    <p className="text-sm font-black text-[#7FA39A]">
                      Caricamento immagine...
                    </p>
                  )}

                  {immagineUrl && (
                    <button
                      type="button"
                      onClick={() => setImmagineUrl("")}
                      className="w-fit rounded-xl border border-[#E7C9C5] bg-white px-4 py-2 text-xs font-semibold text-[#9A615A]"
                    >
                      Rimuovi immagine dal prodotto
                    </button>
                  )}
                </div>
              </div>
            </div>

            <label className="flex items-center gap-3 rounded-xl border border-[#D9E2DF] bg-[#F3F5F2] p-4">
              <input
                type="checkbox"
                checked={disponibile}
                onChange={(e) =>
                  setDisponibile(e.target.checked)
                }
              />
              <span className="font-semibold">
                Visibile nel catalogo
              </span>
            </label>

            <label className="sm:col-span-2 lg:col-span-3">
              <span className="mb-2 block text-sm font-semibold">
                Descrizione
              </span>
              <textarea
                rows={4}
                value={descrizione}
                onChange={(e) =>
                  setDescrizione(e.target.value)
                }
                className="w-full rounded-xl border border-[#D4DFDB] bg-white px-4 py-3 text-[#20383B] outline-none transition focus:border-[#8FB8B2]"
              />
            </label>
          </div>

          <div className="mt-7 border-t border-[#E1E7E4] pt-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#89A39D]">
                  Magazzino
                </p>
                <h3 className="mt-1 font-serif text-xl font-medium">
                  Varianti
                </h3>
              </div>

              <button
                type="button"
                onClick={aggiungiVariante}
                className="rounded-xl bg-[#7FA39A] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#6F918B]"
              >
                + Variante
              </button>
            </div>

            <div className="mt-4 grid gap-3">
              {varianti.map((v, indice) => (
                <div
                  key={indice}
                  className="grid gap-3 rounded-2xl border border-[#D9E2DF] bg-[#F3F5F2] p-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_120px_auto]"
                >
                  <input
                    value={v.taglia}
                    onChange={(e) =>
                      aggiornaVariante(
                        indice,
                        "taglia",
                        e.target.value
                      )
                    }
                    placeholder="Taglia"
                    className="rounded-xl border border-[#D4DFDB] bg-white px-3 py-2 text-[#20383B] outline-none transition focus:border-[#8FB8B2]"
                  />

                  <input
                    value={v.misura}
                    onChange={(e) =>
                      aggiornaVariante(
                        indice,
                        "misura",
                        e.target.value
                      )
                    }
                    placeholder="Misura"
                    className="rounded-xl border border-[#D4DFDB] bg-white px-3 py-2 text-[#20383B] outline-none transition focus:border-[#8FB8B2]"
                  />

                  <input
                    value={v.colore}
                    onChange={(e) =>
                      aggiornaVariante(
                        indice,
                        "colore",
                        e.target.value
                      )
                    }
                    placeholder="Colore"
                    className="rounded-xl border border-[#D4DFDB] bg-white px-3 py-2 text-[#20383B] outline-none transition focus:border-[#8FB8B2]"
                  />

                  <input
                    type="number"
                    min="0"
                    value={v.quantita}
                    onChange={(e) =>
                      aggiornaVariante(
                        indice,
                        "quantita",
                        e.target.value
                      )
                    }
                    placeholder="Q.tà"
                    className="rounded-xl border border-[#D4DFDB] bg-white px-3 py-2 text-[#20383B] outline-none transition focus:border-[#8FB8B2]"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      eliminaVariante(indice)
                    }
                    className="rounded-xl border border-[#E7C9C5] bg-[#F6E7E4] px-3 py-2 text-xs font-semibold text-[#9A615A]"
                  >
                    Elimina
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={salvaProdotto}
            disabled={salvataggio || uploadInCorso}
            className="mt-6 w-full rounded-xl bg-[#7FA39A] px-5 py-4 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(80,108,105,.12)] transition hover:bg-[#6F918B] disabled:opacity-50"
          >
            {salvataggio
              ? "Salvataggio..."
              : id > 0
              ? "Salva modifiche"
              : "Aggiungi prodotto"}
          </button>
        </div>

        <div className="mt-6 rounded-[24px] border border-[#D9E2DF] bg-[#FBFAF7] p-5 shadow-[0_12px_30px_rgba(80,108,105,.05)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#89A39D]">
                Catalogo
              </p>
              <h2 className="mt-1 font-serif text-2xl font-medium tracking-[-0.025em]">
                Prodotti esistenti
              </h2>
            </div>

            <input
              type="search"
              value={ricerca}
              onChange={(e) =>
                setRicerca(e.target.value)
              }
              placeholder="Cerca prodotto..."
              className="rounded-xl border border-[#D4DFDB] px-4 py-3 text-sm"
            />
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {caricamento ? (
            <div className="rounded-[22px] border border-[#D9E2DF] bg-[#FBFAF7] p-8 text-center font-medium text-[#7E8F8B] sm:col-span-2 lg:col-span-3">
              Caricamento catalogo...
            </div>
          ) : (
            prodottiFiltrati.map((p) => (
              <article
                key={p.id}
                className="overflow-hidden rounded-[22px] border border-[#D9E2DF] bg-[#FBFAF7] shadow-[0_10px_24px_rgba(80,108,105,.05)]"
              >
                <div className="aspect-square bg-[#F3F5F2]">
                  {p.immagine_url ? (
                    <img
                      src={p.immagine_url}
                      alt={p.nome}
                      className="h-full w-full object-contain p-4"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[#8FB8B2]">
                      <svg viewBox="0 0 32 24" className="h-12 w-14" fill="none" stroke="currentColor" strokeWidth="1.7">
                        <ellipse cx="9" cy="13" rx="6" ry="5.5" />
                        <ellipse cx="23" cy="13" rx="6" ry="5.5" />
                        <path d="M15 12c1-1.6 2-1.6 3 0M3 11 1.5 5M29 11 30.5 5" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#89A39D]">
                        {p.marca || "Senza marca"}
                      </p>
                      <h3 className="mt-1 font-serif text-lg font-medium">
                        {p.nome}
                      </h3>
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                        p.disponibile === 1
                          ? "border border-[#CFE0D8] bg-[#EDF5F0] text-[#55766D]"
                          : "border border-[#E9D1CD] bg-[#F8ECE9] text-[#9A615A]"
                      }`}
                    >
                      {p.disponibile === 1
                        ? "Visibile"
                        : "Nascosto"}
                    </span>
                  </div>

                  <p className="mt-3 text-xl font-semibold text-[#506C69]">
                    €{" "}
                    {Number(p.prezzo)
                      .toFixed(2)
                      .replace(".", ",")}
                  </p>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        modificaProdotto(p)
                      }
                      className="rounded-xl border border-[#8FB8B2] bg-white px-3 py-2 text-xs font-semibold text-[#6F918B]"
                    >
                      Modifica
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        cambiaDisponibilita(p)
                      }
                      className="rounded-xl border border-[#E1D6B8] bg-[#F6EEDB] px-3 py-2 text-xs font-semibold text-[#8A6E35]"
                    >
                      {p.disponibile === 1
                        ? "Nascondi"
                        : "Mostra"}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        eliminaProdotto(p)
                      }
                      className="rounded-xl border border-[#E7C9C5] bg-[#F6E7E4] px-3 py-2 text-xs font-semibold text-[#9A615A]"
                    >
                      Elimina
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
