"use client";

import Link from "next/link";
import {
  IconaHomeOttica,
  IconaCatalogoOttica,
  IconaPrenotaOttica,
  IconaPromoOttica,
  IconaProfiloOttica,
} from "@/app/icone-ottica";

type VoceNav = "home" | "catalogo" | "prenota" | "promo" | "profilo";

type BottomNavProps = {
  active: VoceNav;
};

const voci = [
  {
    id: "home" as const,
    label: "Home",
    href: "/",
    Icona: IconaHomeOttica,
  },
  {
    id: "catalogo" as const,
    label: "Catalogo",
    href: "/catalogo",
    Icona: IconaCatalogoOttica,
  },
  {
    id: "prenota" as const,
    label: "Prenota",
    href: "/appuntamenti",
    Icona: IconaPrenotaOttica,
  },
  {
    id: "promo" as const,
    label: "Promo",
    href: "/promozioni",
    Icona: IconaPromoOttica,
  },
  {
    id: "profilo" as const,
    label: "Profilo",
    href: "/profilo",
    Icona: IconaProfiloOttica,
  },
];

export default function BottomNav({ active }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[60] border-t border-[var(--app-border)] bg-[var(--app-surface)]/96 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 backdrop-blur-xl">
      <div className="mx-auto grid max-w-md grid-cols-5">
        {voci.map(({ id, label, href, Icona }) => {
          const attiva = active === id;

          return (
            <Link
              key={id}
              href={href}
              className={`flex flex-col items-center gap-1 px-2 py-1.5 ${
                attiva
                  ? "text-[var(--app-nav-active)]"
                  : "text-[var(--app-nav-inactive)]"
              }`}
            >
              <Icona className="h-[23px] w-[23px]" />

              <span
                className={`text-[10px] ${
                  attiva ? "font-semibold" : "font-medium"
                }`}
              >
                {label}
              </span>

              {attiva && (
                <span className="h-1 w-1 rounded-full bg-[var(--app-primary)]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
