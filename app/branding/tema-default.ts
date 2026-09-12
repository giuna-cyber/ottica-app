export type TemaApp = {
  primary: string;
  primaryHover: string;
  secondary: string;

  background: string;
  surface: string;
  surfaceSoft: string;

  text: string;
  textSoft: string;
  muted: string;

  border: string;
  borderStrong: string;

  success: string;
  danger: string;
  warning: string;

  navInactive: string;
  navActive: string;
};

export const TEMA_DEFAULT: TemaApp = {
  primary: "#7FA39A",
  primaryHover: "#6F918B",
  secondary: "#A9C7CF",

  background: "#F6F4EF",
  surface: "#FBFAF7",
  surfaceSoft: "#EDF3F0",

  text: "#20383B",
  textSoft: "#506C69",
  muted: "#7E8F8B",

  border: "#D9E2DF",
  borderStrong: "#D4DFDB",

  success: "#6F918B",
  danger: "#B86C6C",
  warning: "#B79A65",

  navInactive: "#86928F",
  navActive: "#6F918B",
};
