// Central theme registry for the page design-system kit.
// Each entry holds COMPLETE Tailwind class strings (never concatenated fragments)
// so the JIT compiler keeps them. Pick a theme per page/category for a consistent,
// color-coded identity across headers, hero cards, step badges and submit buttons.

export type ThemeName =
  | "blue" // general CRUD (domains, channels, policies, tickers), profile
  | "indigo" // accounts
  | "violet" // users
  | "emerald" // XRPL trustset / genesis
  | "teal" // invitations
  | "rose" // destructive (clawback, mpt destroy)
  | "amber" // MPT issuance ops
  | "sky" // payments / transfers
  | "slate"; // tools / config

export interface PageThemeTokens {
  /** Hero card background gradient. */
  hero: string;
  /** Submit-button gradient incl. hover. */
  button: string;
  /** Numbered step-badge background + text. */
  stepBadge: string;
  /** Input focus ring + border (for pages that adopt the shared field styles). */
  focus: string;
}

export const PAGE_THEMES: Record<ThemeName, PageThemeTokens> = {
  blue: {
    hero: "bg-gradient-to-r from-blue-600 to-indigo-600",
    button:
      "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700",
    stepBadge: "bg-blue-100 text-blue-600",
    focus: "focus:ring-blue-500 focus:border-blue-500",
  },
  indigo: {
    hero: "bg-gradient-to-r from-indigo-500 to-purple-600",
    button:
      "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700",
    stepBadge: "bg-indigo-100 text-indigo-600",
    focus: "focus:ring-indigo-500 focus:border-indigo-500",
  },
  violet: {
    hero: "bg-gradient-to-r from-violet-600 to-purple-600",
    button:
      "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700",
    stepBadge: "bg-violet-100 text-violet-600",
    focus: "focus:ring-violet-500 focus:border-violet-500",
  },
  emerald: {
    hero: "bg-gradient-to-r from-emerald-600 to-teal-600",
    button:
      "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700",
    stepBadge: "bg-emerald-100 text-emerald-600",
    focus: "focus:ring-emerald-500 focus:border-emerald-500",
  },
  teal: {
    hero: "bg-gradient-to-r from-teal-500 to-cyan-600",
    button:
      "bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700",
    stepBadge: "bg-teal-100 text-teal-600",
    focus: "focus:ring-teal-500 focus:border-teal-500",
  },
  rose: {
    hero: "bg-gradient-to-r from-rose-600 to-red-600",
    button:
      "bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700",
    stepBadge: "bg-rose-100 text-rose-600",
    focus: "focus:ring-rose-500 focus:border-rose-500",
  },
  amber: {
    hero: "bg-gradient-to-r from-amber-500 to-orange-600",
    button:
      "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700",
    stepBadge: "bg-amber-100 text-amber-600",
    focus: "focus:ring-amber-500 focus:border-amber-500",
  },
  sky: {
    hero: "bg-gradient-to-r from-sky-500 to-blue-600",
    button:
      "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700",
    stepBadge: "bg-sky-100 text-sky-600",
    focus: "focus:ring-sky-500 focus:border-sky-500",
  },
  slate: {
    hero: "bg-gradient-to-r from-slate-600 to-gray-700",
    button:
      "bg-gradient-to-r from-slate-600 to-gray-700 hover:from-slate-700 hover:to-gray-800",
    stepBadge: "bg-slate-100 text-slate-600",
    focus: "focus:ring-slate-500 focus:border-slate-500",
  },
};

export const getTheme = (name: ThemeName): PageThemeTokens => PAGE_THEMES[name];
