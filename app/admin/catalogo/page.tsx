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
    <main className="min-h-screen bg-[#F5F9F9] pb-10 text-[#102A2E]">
      <header className="bg-[linear-gradient(135deg,#083B4C,#1D6E7A)] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#CBEDEF]">
              Area amministrativa
            </p>
            <h1 className="mt-1 text-3xl font-black">
              Gestione Catalogo
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

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
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

        <div className="rounded-3xl border border-[#DCE8E9] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#5D858C]">
                Prodotto
              </p>
              <h2 className="mt-1 text-2xl font-black">
                {id > 0
                  ? "Modifica prodotto"
                  : "Nuovo prodotto"}
              </h2>
            </div>

            {id > 0 && (
              <button
                type="button"
                onClick={nuovoProdotto}
                className="rounded-xl border border-[#1D6E7A] px-4 py-2 text-xs font-black text-[#1D6E7A]"
              >
                Nuovo prodotto
              </button>
            )}
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                Marca
              </span>
              <input
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                className="w-full rounded-xl border border-[#C9DADC] px-4 py-3"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-black">
                Modello
              </span>
              <input
                value={modello}
                onChange={(e) => setModello(e.target.value)}
                className="w-full rounded-xl border border-[#C9DADC] px-4 py-3"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-black">
                Codice articolo
              </span>
              <input
                value={codiceArticolo}
                onChange={(e) =>
                  setCodiceArticolo(e.target.value)
                }
                className="w-full rounded-xl border border-[#C9DADC] px-4 py-3"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-black">
                Categoria
              </span>
              <select
                value={categoria}
                onChange={(e) =>
                  setCategoria(e.target.value)
                }
                className="w-full rounded-xl border border-[#C9DADC] bg-white px-4 py-3"
              >
                <option value="Vista">Vista</option>
                <option value="Sole">Sole</option>
                <option value="Accessori">Accessori</option>
              </select>
            </label>

            <label>
              <span className="mb-2 block text-sm font-black">
                Genere
              </span>
              <select
                value={genere}
                onChange={(e) => setGenere(e.target.value)}
                className="w-full rounded-xl border border-[#C9DADC] bg-white px-4 py-3"
              >
                <option value="">Non specificato</option>
                <option value="Uomo">Uomo</option>
                <option value="Donna">Donna</option>
                <option value="Unisex">Unisex</option>
                <option value="Bambino">Bambino</option>
              </select>
            </label>

            <label>
              <span className="mb-2 block text-sm font-black">
                Prezzo €
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={prezzo}
                onChange={(e) => setPrezzo(e.target.value)}
                className="w-full rounded-xl border border-[#C9DADC] px-4 py-3"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-black">
                Materiale
              </span>
              <input
                value={materiale}
                onChange={(e) =>
                  setMateriale(e.target.value)
                }
                className="w-full rounded-xl border border-[#C9DADC] px-4 py-3"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-black">
                Forma
              </span>
              <input
                value={forma}
                onChange={(e) => setForma(e.target.value)}
                className="w-full rounded-xl border border-[#C9DADC] px-4 py-3"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-black">
                Tipo lente
              </span>
              <input
                value={tipoLente}
                onChange={(e) =>
                  setTipoLente(e.target.value)
                }
                className="w-full rounded-xl border border-[#C9DADC] px-4 py-3"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-black">
                Colore lente
              </span>
              <input
                value={coloreLente}
                onChange={(e) =>
                  setColoreLente(e.target.value)
                }
                className="w-full rounded-xl border border-[#C9DADC] px-4 py-3"
              />
            </label>

            <div className="sm:col-span-2 lg:col-span-3">
              <span className="mb-2 block text-sm font-black">
                Immagine prodotto
              </span>

              <div className="grid gap-4 rounded-2xl border border-[#DCE8E9] bg-[#F8FBFB] p-4 sm:grid-cols-[180px_1fr]">
                <div className="aspect-square overflow-hidden rounded-2xl border border-[#C9DADC] bg-white">
                  {immagineUrl ? (
                    <img
                      src={immagineUrl}
                      alt="Anteprima prodotto"
                      className="h-full w-full object-contain p-3"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-5xl">
                      👓
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-center gap-3">
                  <label className="block">
                    <span className="mb-2 block text-xs font-black text-[#5D858C]">
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
                      className="block w-full rounded-xl border border-[#C9DADC] bg-white px-3 py-3 text-sm"
                    />
                  </label>

                  <p className="text-xs leading-5 text-[#789095]">
                    JPG, PNG o WEBP. Dimensione massima 5 MB.
                  </p>

                  {uploadInCorso && (
                    <p className="text-sm font-black text-[#1D6E7A]">
                      Caricamento immagine...
                    </p>
                  )}

                  {immagineUrl && (
                    <button
                      type="button"
                      onClick={() => setImmagineUrl("")}
                      className="w-fit rounded-xl border border-red-200 bg-white px-4 py-2 text-xs font-black text-red-600"
                    >
                      Rimuovi immagine dal prodotto
                    </button>
                  )}
                </div>
              </div>
            </div>

            <label className="flex items-center gap-3 rounded-xl border border-[#DCE8E9] bg-[#F7FAFA] p-4">
              <input
                type="checkbox"
                checked={disponibile}
                onChange={(e) =>
                  setDisponibile(e.target.checked)
                }
              />
              <span className="font-black">
                Visibile nel catalogo
              </span>
            </label>

            <label className="sm:col-span-2 lg:col-span-3">
              <span className="mb-2 block text-sm font-black">
                Descrizione
              </span>
              <textarea
                rows={4}
                value={descrizione}
                onChange={(e) =>
                  setDescrizione(e.target.value)
                }
                className="w-full rounded-xl border border-[#C9DADC] px-4 py-3"
              />
            </label>
          </div>

          <div className="mt-7 border-t border-[#E4EEEE] pt-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#5D858C]">
                  Magazzino
                </p>
                <h3 className="mt-1 text-xl font-black">
                  Varianti
                </h3>
              </div>

              <button
                type="button"
                onClick={aggiungiVariante}
                className="rounded-xl bg-[#083B4C] px-4 py-2 text-xs font-black text-white"
              >
                + Variante
              </button>
            </div>

            <div className="mt-4 grid gap-3">
              {varianti.map((v, indice) => (
                <div
                  key={indice}
                  className="grid gap-3 rounded-2xl border border-[#DCE8E9] bg-[#F8FBFB] p-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_120px_auto]"
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
                    className="rounded-xl border border-[#C9DADC] bg-white px-3 py-2"
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
                    className="rounded-xl border border-[#C9DADC] bg-white px-3 py-2"
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
                    className="rounded-xl border border-[#C9DADC] bg-white px-3 py-2"
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
                    className="rounded-xl border border-[#C9DADC] bg-white px-3 py-2"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      eliminaVariante(indice)
                    }
                    className="rounded-xl bg-red-600 px-3 py-2 text-xs font-black text-white"
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
            className="mt-6 w-full rounded-2xl bg-[linear-gradient(135deg,#083B4C,#1D6E7A)] px-5 py-4 text-sm font-black text-white shadow-lg disabled:opacity-50"
          >
            {salvataggio
              ? "Salvataggio..."
              : id > 0
              ? "Salva modifiche"
              : "Aggiungi prodotto"}
          </button>
        </div>

        <div className="mt-6 rounded-3xl border border-[#DCE8E9] bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#5D858C]">
                Catalogo
              </p>
              <h2 className="mt-1 text-2xl font-black">
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
              className="rounded-xl border border-[#C9DADC] px-4 py-3 text-sm"
            />
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {caricamento ? (
            <div className="rounded-3xl border border-[#DCE8E9] bg-white p-8 text-center font-black text-[#6D8287] sm:col-span-2 lg:col-span-3">
              Caricamento catalogo...
            </div>
          ) : (
            prodottiFiltrati.map((p) => (
              <article
                key={p.id}
                className="overflow-hidden rounded-3xl border border-[#DCE8E9] bg-white shadow-sm"
              >
                <div className="aspect-square bg-[#F7FAFA]">
                  {p.immagine_url ? (
                    <img
                      src={p.immagine_url}
                      alt={p.nome}
                      className="h-full w-full object-contain p-4"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-6xl">
                      👓
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#5D858C]">
                        {p.marca || "Senza marca"}
                      </p>
                      <h3 className="mt-1 text-lg font-black">
                        {p.nome}
                      </h3>
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-black ${
                        p.disponibile === 1
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {p.disponibile === 1
                        ? "Visibile"
                        : "Nascosto"}
                    </span>
                  </div>

                  <p className="mt-3 text-xl font-black text-[#083B4C]">
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
                      className="rounded-xl border border-[#1D6E7A] px-3 py-2 text-xs font-black text-[#1D6E7A]"
                    >
                      Modifica
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        cambiaDisponibilita(p)
                      }
                      className="rounded-xl bg-amber-500 px-3 py-2 text-xs font-black text-white"
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
                      className="rounded-xl bg-red-600 px-3 py-2 text-xs font-black text-white"
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
