import { SITE } from "@/config/site";
import { getEntreprise } from "@/config/entreprise";

const env = import.meta.env as Record<string, string | undefined>;
const read = (key: string, fallback: string) => env[key]?.trim() || fallback;

export const colorThemes = {
  showroom: { primary: "#B42332", primaryDark: "#861B27", secondary: "#18324B", secondaryDark: "#101F30", surface: "#F7F5F2", accent: "#D9A441" },
  electric: { primary: "#087E8B", primaryDark: "#05636D", secondary: "#172B3A", secondaryDark: "#0C1821", surface: "#F2F7F7", accent: "#8BC34A" },
  luxury: { primary: "#B48A4A", primaryDark: "#8A6735", secondary: "#24211D", secondaryDark: "#151310", surface: "#F6F3ED", accent: "#E1C58B" },
  sport: { primary: "#E34234", primaryDark: "#AD2B22", secondary: "#20252D", secondaryDark: "#111419", surface: "#F4F5F6", accent: "#F3C623" },
  ocean: { primary: "#2764A5", primaryDark: "#1D4B7D", secondary: "#19344A", secondaryDark: "#102333", surface: "#F3F6F8", accent: "#41B3A3" },
} as const;

export type ColorTheme = keyof typeof colorThemes;
export const typographyPresets = {
  modern: { heading: "Manrope", body: "Inter" },
  technical: { heading: "Barlow Condensed", body: "Barlow" },
  classic: { heading: "Cormorant Garamond", body: "Montserrat" },
} as const;
export type TypographyPreset = keyof typeof typographyPresets;
export const layoutPresets = { compact: "12px", balanced: "18px", spacious: "26px" } as const;
export type LayoutPreset = keyof typeof layoutPresets;
/**
 * Trois identités visuelles complètes — chacune change la barre de navigation,
 * le pied de page, la composition de l'accueil, les formes et la typographie
 * d'affichage. Ce ne sont pas des variantes de couleur : ce sont trois sites.
 */
export const siteLayouts = {
  signature: {
    label: "Signature",
    description: "Showroom nocturne : hero cinématique plein écran, sections centrées, cartes arrondies et ombres.",
    display: "preset" as const,
  },
  atelier: {
    label: "Atelier",
    description: "Atelier technique : barre en haut, hero coupé, cartes de services et fiches véhicules horizontales, béton et filets d'acier.",
    display: "Barlow" as const,
  },
  catalogue: {
    label: "Catalogue",
    description: "Inventaire : barre utilitaire et moteur de recherche, grille dense, angles nets, titres condensés.",
    display: "Barlow Condensed" as const,
  },
} as const;
export type SiteLayout = keyof typeof siteLayouts;

/**
 * Pile de polices d'affichage (titres) par composition.
 * « Signature » suit la typographie choisie par l'administrateur ; « Atelier »
 * et « Catalogue » imposent leur propre caractère.
 */
export const layoutDisplayStacks: Record<SiteLayout, (preset: TypographyPreset) => string> = {
  signature: (preset) => `'${typographyPresets[preset].heading}', sans-serif`,
  atelier: () => "'Barlow', 'Arial Narrow', sans-serif",
  catalogue: () => "'Barlow Condensed', 'Arial Narrow', sans-serif",
};
export type ThemeSettings = { color: ColorTheme; typography: TypographyPreset; layout: LayoutPreset; siteLayout: SiteLayout; radius: "rounded" | "soft" | "sharp"; navbarStyle?: SiteLayout; footerStyle?: SiteLayout; modalStyle?: SiteLayout; customPrimary?: string };
export const THEME_STORAGE_KEY = "autoprime:theme-settings";

const isKey = <T extends Record<string, unknown>>(value: string, map: T): value is Extract<keyof T, string> => value in map;

export const themeConfig = {
  color: (isKey(read("VITE_THEME_COLOR", "showroom"), colorThemes) ? read("VITE_THEME_COLOR", "showroom") : "showroom") as ColorTheme,
  typography: (isKey(read("VITE_THEME_TYPOGRAPHY", "modern"), typographyPresets) ? read("VITE_THEME_TYPOGRAPHY", "modern") : "modern") as TypographyPreset,
  layout: (isKey(read("VITE_THEME_LAYOUT", "balanced"), layoutPresets) ? read("VITE_THEME_LAYOUT", "balanced") : "balanced") as LayoutPreset,
  radius: read("VITE_THEME_RADIUS", "rounded"),
};

export function getThemeSettings(): ThemeSettings {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved) {
      const value = JSON.parse(saved) as Partial<ThemeSettings>;
      return {
        color: value.color && isKey(value.color, colorThemes) ? value.color : themeConfig.color,
        typography: value.typography && isKey(value.typography, typographyPresets) ? value.typography : themeConfig.typography,
        layout: value.layout && isKey(value.layout, layoutPresets) ? value.layout : themeConfig.layout,
        siteLayout: value.siteLayout && isKey(value.siteLayout, siteLayouts) ? value.siteLayout : "signature",
        navbarStyle: value.navbarStyle && isKey(value.navbarStyle, siteLayouts) ? value.navbarStyle : undefined,
        footerStyle: value.footerStyle && isKey(value.footerStyle, siteLayouts) ? value.footerStyle : undefined,
        modalStyle: value.modalStyle && isKey(value.modalStyle, siteLayouts) ? value.modalStyle : undefined,
        radius: value.radius && ["rounded", "soft", "sharp"].includes(value.radius) ? value.radius : themeConfig.radius as ThemeSettings["radius"],
        customPrimary: value.customPrimary && /^#[0-9a-fA-F]{6}$/.test(value.customPrimary) ? value.customPrimary : undefined,
      };
    }
  } catch { /* stockage inaccessible ou invalide : utiliser les valeurs de configuration */ }
  return { ...themeConfig, siteLayout: "signature", radius: themeConfig.radius as ThemeSettings["radius"] };
}

export function applyTheme(settings: ThemeSettings = getThemeSettings()) {
  const root = document.documentElement;
  const baseColors = colorThemes[settings.color];
  const colors = settings.customPrimary ? { ...baseColors, primary: settings.customPrimary } : baseColors;
  const fonts = typographyPresets[settings.typography];
  root.style.setProperty("--color-brand-red", colors.primary);
  root.style.setProperty("--theme-primary", colors.primary);
  root.style.setProperty("--theme-primary-dark", colors.primaryDark);
  root.style.setProperty("--color-brand-red-dark", colors.primaryDark);
  root.style.setProperty("--color-brand-blue", colors.secondary);
  root.style.setProperty("--color-brand-blue-dark", colors.secondaryDark);
  root.style.setProperty("--theme-secondary", colors.secondary);
  root.style.setProperty("--theme-secondary-dark", colors.secondaryDark);
  root.style.setProperty("--color-brand-light", colors.surface);
  root.style.setProperty("--font-heading", layoutDisplayStacks[settings.siteLayout](settings.typography));
  root.style.setProperty("--font-body", `'${fonts.body}', sans-serif`);
  root.style.setProperty("--layout-gap", layoutPresets[settings.layout]);
  root.style.setProperty("--color-theme-accent", colors.accent);
  root.style.setProperty("--color-border-standard", `${colors.primary}33`);
  root.style.setProperty("--color-border-light", `${colors.primary}1A`);
  root.style.setProperty("--color-text-primary", colors.secondaryDark);
  root.style.setProperty("--color-text-secondary", `${colors.secondaryDark}CC`);
  root.style.setProperty("--color-text-muted", `${colors.secondaryDark}80`);
  root.dataset.radius = settings.radius;
  root.dataset.layout = settings.layout;
  root.dataset.siteLayout = settings.siteLayout;
  // Application des styles personnalisés Navbar et Footer (dépassent le choix de composition)
  if (settings.navbarStyle) {
    root.dataset.navbarStyle = settings.navbarStyle;
  } else {
    delete root.dataset.navbarStyle;
  }
  if (settings.footerStyle) {
    root.dataset.footerStyle = settings.footerStyle;
  } else {
    delete root.dataset.footerStyle;
  }
  const entreprise = getEntreprise();
  document.title = entreprise.titrePage;
  const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (favicon) favicon.href = SITE.favicon;
  const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
  if (description) description.content = entreprise.descriptionPage;
}
