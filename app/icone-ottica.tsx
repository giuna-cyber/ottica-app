"use client";

type IconProps = {
  className?: string;
};

const common = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconaHomeOttica({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...common}>
      <path d="M4.2 10.3 12 4l7.8 6.3v8.9a.8.8 0 0 1-.8.8H5a.8.8 0 0 1-.8-.8Z" />
      <path d="M8.2 20v-5.3c0-.6.5-1 1-1h5.6c.6 0 1 .4 1 1V20" />
      <path d="M8.6 9.5c.7-1 1.9-1.6 3.4-1.6s2.7.6 3.4 1.6" />
      <path d="M9.1 9.5c.2 1.1 1 1.9 2 1.9.5 0 .8-.2.9-.5.1.3.5.5.9.5 1 0 1.8-.8 2-1.9" />
    </svg>
  );
}

export function IconaCatalogoOttica({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...common}>
      <path d="M3.2 10.2c.4-2 2-3.4 4.2-3.4 2.5 0 4.3 1.6 4.6 3.8.3-2.2 2.1-3.8 4.6-3.8 2.2 0 3.8 1.4 4.2 3.4" />
      <path d="M3.4 10.4c.2 2.7 1.7 4.5 4 4.5 2.5 0 4.2-1.9 4.3-4.7" />
      <path d="M20.6 10.4c-.2 2.7-1.7 4.5-4 4.5-2.5 0-4.2-1.9-4.3-4.7" />
      <path d="M11.7 10.1c.2-.5.5-.8.9-.8.4 0 .7.3.9.8" />
      <path d="M3.4 10.1 2.2 7.7M20.6 10.1l1.2-2.4" />
      <path d="M5.3 8.3c.8-.5 1.6-.7 2.4-.7M18.7 8.3c-.8-.5-1.6-.7-2.4-.7" opacity=".55" />
    </svg>
  );
}

export function IconaPrenotaOttica({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...common}>
      <rect x="3.5" y="5.2" width="17" height="15.1" rx="2.6" />
      <path d="M7.8 3.3v3.6M16.2 3.3v3.6M3.5 9.2h17" />
      <path d="M7.2 14.6c.8-1.1 1.8-1.6 3-1.6 1 0 1.6.3 1.8.8.2-.5.8-.8 1.8-.8 1.2 0 2.2.5 3 1.6" />
      <path d="M7.2 14.6c.2 1.4 1.1 2.3 2.5 2.3 1.2 0 2-.8 2.1-2.1M16.8 14.6c-.2 1.4-1.1 2.3-2.5 2.3-1.2 0-2-.8-2.1-2.1" />
    </svg>
  );
}

export function IconaPromoOttica({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...common}>
      <path d="M4.2 8.8 10.1 3h7.6a2 2 0 0 1 2 2v7.6l-5.9 5.9a2 2 0 0 1-2.8 0l-6.8-6.8a2 2 0 0 1 0-2.9Z" />
      <circle cx="15.8" cy="6.8" r="1.1" />
      <path d="m8.1 11 7.8 0" opacity=".45" />
      <path d="M9.2 9.8c.3-.7.9-1.1 1.6-1.1.9 0 1.6.6 1.7 1.5.1-.9.8-1.5 1.7-1.5.7 0 1.3.4 1.6 1.1" />
      <path d="m17.7 17.3.6 1.3 1.3.6-1.3.6-.6 1.3-.6-1.3-1.3-.6 1.3-.6.6-1.3Z" />
    </svg>
  );
}

export function IconaProfiloOttica({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...common}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c1.1-4.1 3.5-6.1 7-6.1s5.9 2 7 6.1" />
      <path d="M8.8 8c.2-.8.9-1.3 1.8-1.3.8 0 1.3.3 1.4.8.1-.5.6-.8 1.4-.8.9 0 1.6.5 1.8 1.3" />
      <path d="M8.8 8c.1 1 .8 1.7 1.7 1.7.8 0 1.4-.6 1.5-1.5M15.2 8c-.1 1-.8 1.7-1.7 1.7-.8 0-1.4-.6-1.5-1.5" />
    </svg>
  );
}
