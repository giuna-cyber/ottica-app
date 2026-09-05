"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Promozione = {
  id: number;
  titolo: string;
  descrizione: string | null;
  immagine_url: string | null;
  sconto_percentuale: number | null;
  articolo_id: number | null;
  data_inizio: string | null;
  data_fine: string | null;
  attiva: number;
  articolo_nome: string | null;
  articolo_immagine: string | null;
  articolo_prezzo: number | null;
};

function euro(valore: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(valore);
}

function IconaHome() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 10.5V20h13v-9.5" />
    </svg>
  );
}

function IconaOcchiali() {
  return (
    <svg viewBox="0 0 64 64" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="3">
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
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </svg>
  );
}

function IconaPromo() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m20 12-8 8-8-8 8-8 8 8Z" />
      <path d="M9 9h.01M15 15h.01M15 9l-6 6" />
    </svg>
  );
}

function IconaProfilo() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4.5 4.2-6.5 8-6.5s6.5 2 8 6.5" />
    </svg>
  );
}

function IconaCuore() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.8 4.6a5.4 5.4 0 0 0-7.6 0L12 5.8l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 21l8.8-8.8a5.4 5.4 0 0 0 0-7.6Z" />
    </svg>
  );
}

function OcchialiDecorativi({
  style,
  opacity = 0.24,
}: {
  style?: React.CSSProperties;
  opacity?: number;
}) {
  return (
    <svg
      viewBox="0 0 150 76"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.15"
      aria-hidden="true"
      style={{
        position: "absolute",
        width: 165,
        height: 84,
        color: "#FFFFFF",
        opacity,
        ...style,
      }}
    >
      <path d="M8 33c4-12 16-20 29-20 16 0 29 12 29 27 0 14-11 25-26 25-16 0-29-10-32-25-1-3-1-5 0-7Z" />
      <path d="M142 33c-4-12-16-20-29-20-16 0-29 12-29 27 0 14 11 25 26 25 16 0 29-10 32-25 1-3 1-5 0-7Z" />
      <path d="M66 34c4-5 14-5 18 0" />
      <path d="M8 33 1 25M142 33l7-8" />
      <path d="M17 24c8-7 18-11 29-8M133 24c-8-7-18-11-29-8" />
    </svg>
  );
}

export default function PromozioniPage() {
  const [promozioni, setPromozioni] = useState<Promozione[]>([]);
  const [errore, setErrore] = useState("");
  const [caricamento, setCaricamento] = useState(true);

  useEffect(() => {
    async function carica() {
      try {
        const risposta = await fetch("/api/promozioni", {
          cache: "no-store",
        });

        const dati = await risposta.json();

        if (!risposta.ok || !dati.ok) {
          throw new Error(
            dati.errore || "Impossibile caricare le promozioni."
          );
        }

        setPromozioni(dati.promozioni ?? []);
      } catch (e) {
        setErrore(
          e instanceof Error
            ? e.message
            : "Impossibile caricare le promozioni."
        );
      } finally {
        setCaricamento(false);
      }
    }

    carica();
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#FFFFFF",
        color: "#102A2E",
        paddingBottom: 92,
      }}
    >
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(12,37,43,.97)",
          color: "#FFFFFF",
          borderBottom: "1px solid rgba(255,255,255,.08)",
        }}
      >
        <div
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              color: "#FFFFFF",
              textDecoration: "none",
              fontWeight: 900,
              fontSize: 18,
            }}
          >
            <span
              style={{
                width: 42,
                height: 42,
                borderRadius: 14,
                background: "#FFFFFF",
                color: "#0C252B",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconaOcchiali />
            </span>
            OTTICA APP
          </Link>

          <Link
            href="/login"
            style={{
              color: "#FFFFFF",
              textDecoration: "none",
              fontWeight: 900,
              fontSize: 12,
              border: "1px solid rgba(255,255,255,.22)",
              background: "rgba(255,255,255,.08)",
              padding: "9px 14px",
              borderRadius: 12,
            }}
          >
            Admin
          </Link>
        </div>
      </header>

      <section
        style={{
          position: "relative",
          overflow: "hidden",
          minHeight: 330,
          color: "#FFFFFF",
          background:
            "linear-gradient(125deg, #073743 0%, #0C6877 54%, #7BC9D2 100%)",
        }}
      >
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <OcchialiDecorativi style={{ left: -26, top: 16, transform: "rotate(14deg)" }} opacity={0.34} />
          <OcchialiDecorativi style={{ left: 34, bottom: 0, transform: "rotate(-12deg)" }} opacity={0.25} />
          <OcchialiDecorativi style={{ left: "36%", top: 12, transform: "rotate(-7deg)" }} opacity={0.3} />
          <OcchialiDecorativi style={{ left: "47%", bottom: -8, transform: "rotate(13deg)" }} opacity={0.24} />
          <OcchialiDecorativi style={{ left: "58%", top: 64, transform: "rotate(10deg)" }} opacity={0.25} />
          <OcchialiDecorativi style={{ right: "21%", top: 10, transform: "rotate(-10deg)" }} opacity={0.34} />
          <OcchialiDecorativi style={{ right: "9%", bottom: 0, transform: "rotate(13deg)" }} opacity={0.28} />
          <OcchialiDecorativi style={{ right: -48, top: 42, transform: "rotate(-6deg)" }} opacity={0.24} />
        </div>

        <div
          style={{
            position: "absolute",
            right: "3%",
            top: "18%",
            width: 170,
            height: 170,
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,.18)",
            background:
              "radial-gradient(circle at 35% 25%, rgba(255,255,255,.13), rgba(255,255,255,.03) 45%, rgba(255,255,255,.015) 100%)",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: 1180,
            margin: "0 auto",
            padding: "46px 20px 50px",
          }}
        >
          <div style={{ maxWidth: 620 }}>
            <p
              style={{
                margin: 0,
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: ".22em",
                textTransform: "uppercase",
                color: "#D9F5F7",
              }}
            >
              Promozioni
            </p>

            <h1
              style={{
                margin: "12px 0 0",
                fontSize: "clamp(42px, 5vw, 68px)",
                lineHeight: 0.96,
                letterSpacing: "-.045em",
                fontWeight: 950,
              }}
            >
              Promozioni pensate
              <span style={{ display: "block", color: "#D8F6F8" }}>
                per il tuo stile.
              </span>
            </h1>

            <p
              style={{
                margin: "18px 0 0",
                maxWidth: 570,
                fontSize: 17,
                lineHeight: 1.55,
                color: "rgba(255,255,255,.9)",
              }}
            >
              Occhiali di qualità, design e convenienza per accompagnarti
              ogni giorno. Scopri le offerte esclusive del nostro centro ottico.
            </p>

            <a
              href="#offerte"
              style={{
                marginTop: 22,
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                color: "#FFFFFF",
                textDecoration: "none",
                border: "1px solid rgba(255,255,255,.75)",
                background: "rgba(4,40,48,.18)",
                borderRadius: 18,
                padding: "12px 18px",
                fontWeight: 900,
                fontSize: 14,
              }}
            >
              Scopri le promozioni <span>→</span>
            </a>
          </div>
        </div>
      </section>

      <section id="offerte" style={{ background: "#FFFFFF" }}>
        <div
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            padding: "34px 20px 44px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 20,
              flexWrap: "wrap",
              marginBottom: 22,
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  color: "#2F6F78",
                  fontSize: 11,
                  fontWeight: 900,
                  letterSpacing: ".19em",
                  textTransform: "uppercase",
                }}
              >
                — Le nostre promozioni
              </p>

              <h2
                style={{
                  margin: "6px 0 0",
                  fontSize: 34,
                  lineHeight: 1,
                  letterSpacing: "-.035em",
                  fontWeight: 950,
                }}
              >
                Offerte in evidenza
              </h2>

              <p
                style={{
                  margin: "8px 0 0",
                  color: "#657B80",
                  fontSize: 15,
                }}
              >
                Brand selezionati, prezzi speciali. Il tuo prossimo occhiale ti aspetta.
              </p>
            </div>

          </div>

          {errore && (
            <div
              style={{
                marginBottom: 18,
                padding: 14,
                borderRadius: 16,
                border: "1px solid #F3B7BC",
                background: "#FFF4F5",
                color: "#A10E1B",
                fontWeight: 900,
                fontSize: 14,
              }}
            >
              {errore}
            </div>
          )}

          {caricamento ? (
            <div
              style={{
                padding: 30,
                border: "1px solid #DCE8E9",
                borderRadius: 22,
                textAlign: "center",
                fontWeight: 900,
                color: "#6D8287",
              }}
            >
              Caricamento promozioni...
            </div>
          ) : promozioni.length === 0 ? (
            <div
              style={{
                padding: 30,
                border: "1px solid #DCE8E9",
                borderRadius: 22,
                textAlign: "center",
                background: "#F7FAFA",
              }}
            >
              <div style={{ fontSize: 36 }}>🏷️</div>
              <h3 style={{ margin: "10px 0 0", fontSize: 22 }}>
                Nessuna promozione attiva
              </h3>
              <p style={{ margin: "8px 0 0", color: "#6D8287" }}>
                Torna presto per scoprire le prossime offerte.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 340px))",
                gap: 18,
                alignItems: "stretch",
              }}
            >
              {promozioni.map((promo) => {
                const immagine =
                  promo.immagine_url ||
                  promo.articolo_immagine ||
                  null;

                const prezzoScontato =
                  promo.articolo_prezzo !== null &&
                  promo.sconto_percentuale !== null
                    ? promo.articolo_prezzo *
                      (1 - promo.sconto_percentuale / 100)
                    : null;

                return (
                  <article
                    key={promo.id}
                    style={{
                      overflow: "hidden",
                      borderRadius: 22,
                      border: "1.5px solid #6F858A",
                      background: "#FFFFFF",
                      boxShadow: "0 14px 32px rgba(8,59,76,.08)",
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        height: 200,
                        background: "#FFFFFF",
                        borderBottom: "1.5px solid #6F858A",
                      }}
                    >
                      {promo.sconto_percentuale !== null && (
                        <div
                          style={{
                            position: "absolute",
                            zIndex: 2,
                            left: 14,
                            top: 14,
                            minWidth: 88,
                            padding: "8px 12px",
                            borderRadius: 14,
                            background: "#99111E",
                            border: "1px solid #730812",
                            color: "#FFFFFF",
                            textAlign: "center",
                            boxShadow: "0 6px 14px rgba(153,17,30,.22)",
                          }}
                        >
                          <div
                            style={{
                              fontSize: 9,
                              lineHeight: 1,
                              fontWeight: 900,
                              letterSpacing: ".14em",
                            }}
                          >
                            PROMO
                          </div>
                          <div
                            style={{
                              marginTop: 3,
                              fontSize: 20,
                              lineHeight: 1,
                              fontWeight: 950,
                            }}
                          >
                            -{promo.sconto_percentuale}%
                          </div>
                        </div>
                      )}

                      <div
                        style={{
                          position: "absolute",
                          zIndex: 2,
                          right: 14,
                          top: 17,
                          fontSize: 9,
                          fontWeight: 900,
                          letterSpacing: ".16em",
                          textTransform: "uppercase",
                          color: "#48656B",
                        }}
                      >
                        Offerta speciale
                      </div>

                      {immagine ? (
                        <img
                          src={immagine}
                          alt={promo.titolo}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            padding: "48px 18px 12px",
                            boxSizing: "border-box",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 54,
                          }}
                        >
                          🏷️
                        </div>
                      )}
                    </div>

                    <div
                      style={{
                        padding: "16px 16px 17px",
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                      }}
                    >
                      <h3
                        style={{
                          margin: 0,
                          fontSize: 24,
                          lineHeight: 1.05,
                          letterSpacing: "-.025em",
                          fontWeight: 950,
                        }}
                      >
                        {promo.titolo}
                      </h3>

                      {promo.articolo_nome && (
                        <p
                          style={{
                            margin: "5px 0 0",
                            color: "#0D6877",
                            fontSize: 14,
                            fontWeight: 900,
                          }}
                        >
                          {promo.articolo_nome}
                        </p>
                      )}

                      {promo.descrizione && (
                        <p
                          style={{
                            margin: "8px 0 0",
                            color: "#60777C",
                            fontSize: 13,
                            lineHeight: 1.45,
                            minHeight: 42,
                          }}
                        >
                          {promo.descrizione}
                        </p>
                      )}

                      {promo.articolo_prezzo !== null && (
                        <div
                          style={{
                            marginTop: "auto",
                            paddingTop: 12,
                            display: "flex",
                            alignItems: "flex-end",
                            justifyContent: "space-between",
                            gap: 12,
                          }}
                        >
                          <div>
                            {prezzoScontato !== null && (
                              <p
                                style={{
                                  margin: 0,
                                  color: "#B4232F",
                                  fontSize: 13,
                                  fontWeight: 800,
                                  textDecoration: "line-through",
                                  textDecorationColor: "#B4232F",
                                  textDecorationThickness: "1.5px",
                                }}
                              >
                                {euro(promo.articolo_prezzo)}
                              </p>
                            )}

                            <p
                              style={{
                                margin: "2px 0 0",
                                color: "#083B4C",
                                fontSize: 27,
                                lineHeight: 1,
                                fontWeight: 950,
                              }}
                            >
                              {euro(
                                prezzoScontato !== null
                                  ? prezzoScontato
                                  : promo.articolo_prezzo
                              )}
                            </p>
                          </div>

                          <span
                            style={{
                              width: 38,
                              height: 38,
                              flexShrink: 0,
                              borderRadius: "50%",
                              border: "1px solid #DCE8E9",
                              color: "#083B4C",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <IconaCuore />
                          </span>
                        </div>
                      )}

                      {promo.articolo_id && (
                        <Link
                          href={`/catalogo/${promo.articolo_id}`}
                          style={{
                            marginTop: 14,
                            width: "100%",
                            minHeight: 44,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                            borderRadius: 16,
                            background: "#086270",
                            color: "#FFFFFF",
                            textDecoration: "none",
                            fontWeight: 900,
                            fontSize: 14,
                          }}
                        >
                          Approfitta ora <span>→</span>
                        </Link>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <div
            style={{
              marginTop: 22,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              border: "1px solid #DCE8E9",
              borderRadius: 20,
              background: "#FFFFFF",
              boxShadow: "0 8px 22px rgba(8,59,76,.04)",
              overflow: "hidden",
            }}
          >
            {[
              ["🚚", "Spedizione gratuita", "Per ordini superiori a € 50"],
              ["🛡️", "Garanzia ufficiale", "Su tutti i prodotti"],
              ["↩", "Reso facile", "Entro 30 giorni"],
              ["🏬", "Consulenza personalizzata", "Nel nostro centro ottico"],
            ].map(([icona, titolo, testo], indice) => (
              <div
                key={titolo}
                style={{
                  minHeight: 76,
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  borderLeft:
                    indice === 0 ? "none" : "1px solid #E5EEEE",
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    flexShrink: 0,
                    borderRadius: "50%",
                    background: "#EEF7F8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                  }}
                >
                  {icona}
                </div>

                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 950 }}>
                    {titolo}
                  </p>
                  <p
                    style={{
                      margin: "3px 0 0",
                      color: "#6D8287",
                      fontSize: 11,
                    }}
                  >
                    {testo}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <nav
        style={{
          position: "fixed",
          zIndex: 50,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(255,255,255,.97)",
          borderTop: "1px solid #DCE6E6",
          boxShadow: "0 -8px 30px rgba(16,42,46,.07)",
        }}
      >
        <div
          style={{
            maxWidth: 470,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(5,1fr)",
            padding: "7px 4px 9px",
          }}
        >
          {[
            ["/", "Home", <IconaHome key="i1" />],
            ["/catalogo", "Catalogo", <IconaOcchiali key="i2" />],
            ["/appuntamenti", "Prenota", <IconaCalendario key="i3" />],
            ["/promozioni", "Promo", <IconaPromo key="i4" />],
            ["/profilo", "Profilo", <IconaProfilo key="i5" />],
          ].map(([href, label, icona]) => {
            const attivo = label === "Promo";

            return (
              <Link
                key={String(href)}
                href={String(href)}
                style={{
                  color: attivo ? "#0C4E58" : "#789095",
                  textDecoration: "none",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 3,
                  fontSize: 10,
                  fontWeight: attivo ? 950 : 800,
                }}
              >
                {icona}
                <span>{String(label)}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </main>
  );
}
