"use client";

import { useEffect } from "react";
import { TEMA_DEFAULT, type TemaApp } from "./tema-default";

const CSS_VARIABLES: Record<keyof TemaApp, string> = {
  primary: "--app-primary",
  primaryHover: "--app-primary-hover",
  secondary: "--app-secondary",

  background: "--app-background",
  surface: "--app-surface",
  surfaceSoft: "--app-surface-soft",

  text: "--app-text",
  textSoft: "--app-text-soft",
  muted: "--app-muted",

  border: "--app-border",
  borderStrong: "--app-border-strong",

  success: "--app-success",
  danger: "--app-danger",
  warning: "--app-warning",

  navInactive: "--app-nav-inactive",
  navActive: "--app-nav-active",
};

export function applicaTema(tema: TemaApp) {
  const root = document.documentElement;

  (Object.keys(CSS_VARIABLES) as Array<keyof TemaApp>).forEach((chiave) => {
    root.style.setProperty(CSS_VARIABLES[chiave], tema[chiave]);
  });

  root.style.setProperty("--background", tema.background);
  root.style.setProperty("--foreground", tema.text);
}

function unisciTema(valore: unknown): TemaApp {
  if (!valore || typeof valore !== "object") {
    return TEMA_DEFAULT;
  }

  return {
    ...TEMA_DEFAULT,
    ...(valore as Partial<TemaApp>),
  };
}

export default function ThemeProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    let annullato = false;

    applicaTema(TEMA_DEFAULT);

    async function caricaTema() {
      try {
        const risposta = await fetch("/api/tema", {
          cache: "no-store",
        });

        const dati = await risposta.json();

        if (!annullato && risposta.ok && dati.ok && dati.tema) {
          applicaTema(unisciTema(dati.tema));
        }
      } catch {
        // Se il server non risponde, rimane attivo il tema di default.
      }
    }

    caricaTema();

    return () => {
      annullato = true;
    };
  }, []);

  return children;
}
