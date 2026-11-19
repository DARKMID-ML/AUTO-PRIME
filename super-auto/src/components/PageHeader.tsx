import { Link } from "react-router-dom";
import { useSiteLayout } from "@/hooks/useSiteLayout";
import { pagesEntetes, usePageHeader, type PageHeaderKey } from "@/config/headers";

/**
 * En-tête commun aux pages intérieures.
 *
 * Le contenu (surtitre, titre, chapeau) vient de `config/headers.ts` : il est
 * modifiable depuis Admin → Apparence du site. La composition, elle, décide de
 * la forme : hero sombre (Signature), concession technique (Atelier) ou bandeau
 * d'inventaire (Catalogue).
 *
 * Aucune page ne redéfinit son propre hero : c'est ici, et nulle part ailleurs,
 * que le fil d'Ariane, la hiérarchie des titres et les espacements sont réglés.
 */
interface PageHeaderAction {
  label: string;
  /** Route interne (react-router). */
  to?: string;
  /** Lien externe ou ancre (`#devis`). */
  href?: string;
}

interface PageHeaderProps {
  page: PageHeaderKey;
  /** Ligne de contexte sous le chapeau (compteur, statut…). */
  meta?: string;
  /** Action principale de l'en-tête. */
  action?: PageHeaderAction;
  /** Image de fond, utilisée par la composition Signature uniquement. */
  image?: string;
}

function Action({ action, layout }: { action: PageHeaderAction; layout: "signature" | "atelier" | "catalogue" }) {
  const classes =
    layout === "atelier"
      ? "inline-flex items-center gap-2 bg-brand-red px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-90"
        : layout === "catalogue"
          ? "inline-flex items-center gap-2 border-2 border-brand-red bg-brand-red px-5 py-2.5 text-[12px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-transparent hover:text-brand-red"
          : "inline-flex items-center gap-2 rounded bg-brand-red px-7 py-3 font-bold text-white transition-colors hover:bg-brand-red-dark";

  if (action.to) {
    return (
      <Link to={action.to} className={classes}>
        {action.label}
      </Link>
    );
  }
  return (
    <a href={action.href ?? "#"} className={classes}>
      {action.label}
    </a>
  );
}

export default function PageHeader({ page, meta, action, image }: PageHeaderProps) {
  const layout = useSiteLayout();
  const { surtitre, titre, chapeau } = usePageHeader(page);
  const rubrique = pagesEntetes[page];

  if (layout === "catalogue") {
    return (
      <section className="site-nav-offset border-b-4 border-brand-red bg-white text-text-primary">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center gap-2 border-b border-black/10 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">
            <Link to="/" className="transition-colors hover:text-brand-red">
              Accueil
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-text-primary">{rubrique}</span>
          </div>

          <div className="flex flex-col gap-5 pb-6 pt-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-brand-red">{surtitre}</p>
              <h1 className="mt-1 text-4xl font-bold leading-none tracking-tight md:text-6xl">{titre}</h1>
              <p className="mt-3 max-w-2xl text-[15px] leading-6 text-text-secondary">{chapeau}</p>
            </div>
            {(meta || action) && (
              <div className="flex flex-wrap items-center gap-4 md:justify-end md:pb-1">
                {meta && <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-text-muted">{meta}</p>}
                {action && <Action action={action} layout="catalogue" />}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (layout === "atelier") {
    return (
      <section className="site-nav-offset border-b-2 border-[color:var(--at-ink)] bg-[color:var(--at-paper)] text-text-primary">
        <div className="mx-auto max-w-[92rem] px-5">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-b border-[color:var(--at-line)] py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-text-muted">
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-brand-red" aria-hidden="true" />
              <Link to="/" className="transition-colors hover:text-brand-red">Accueil</Link>
              <span aria-hidden="true">/</span>
              <span className="text-text-primary">{rubrique}</span>
            </span>
            <span className="text-brand-red">{surtitre}</span>
          </div>

          <div className="grid gap-8 py-8 md:py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-end">
            <div>
              <h1 className="max-w-3xl font-heading text-4xl font-extrabold leading-[0.95] tracking-[-0.03em] text-balance md:text-6xl">
                {titre}
              </h1>
              <p className="mt-4 max-w-2xl text-[15px] leading-6 text-text-secondary">{chapeau}</p>
            </div>

            <div className="border-t-2 border-[color:var(--at-ink)] pt-4">
              {image && (
                <img src={image} alt="" className="mb-4 h-28 w-full border border-[color:var(--at-line)] object-cover" />
              )}
              {meta && (
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-muted">{meta}</p>
              )}
              {action && (
                <div className="mt-4">
                  <Action action={action} layout="atelier" />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="site-nav-offset relative overflow-hidden bg-gradient-to-br from-brand-blue-dark via-brand-blue-dark to-brand-blue pb-14 text-white">
      {image && (
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" aria-hidden="true" />
      )}
      <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-brand-red/25 blur-3xl animate-float-slow" aria-hidden="true" />
      <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-brand-blue/30 blur-3xl animate-drift" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-4">
        <p className="text-sm text-gray-300">
          <Link to="/" className="transition-colors hover:text-white">
            Accueil
          </Link>
          <span aria-hidden="true" className="mx-2 text-white/40">
            /
          </span>
          <span className="text-white">{rubrique}</span>
        </p>

        <p className="mt-8 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.24em] text-white/70">
          <span aria-hidden="true" className="h-px w-8 bg-brand-red" />
          {surtitre}
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-tight text-white md:text-5xl">{titre}</h1>
        <p className="mt-4 max-w-2xl text-gray-300">{chapeau}</p>

        {(meta || action) && (
          <div className="mt-6 flex flex-wrap items-center gap-4">
            {meta && (
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-gray-200 backdrop-blur-sm">
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-brand-red animate-pulse-dot" />
                {meta}
              </p>
            )}
            {action && <Action action={action} layout="signature" />}
          </div>
        )}
      </div>
    </section>
  );
}
