import { resetDomaines, resetEngagements, resetTemoignages, setDomaines, setEngagements, setTemoignages, useDomaines, useEngagements, useTemoignages } from "@/config/contenu";
import type { DomaineEdit, EngagementEdit, TemoignageEdit } from "@/config/contenu";

const champ =
  "w-full rounded-lg border border-border-standard bg-white px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-red/40 focus:border-brand-red transition-colors";
const carte = "rounded-2xl border border-border-light bg-white p-6 shadow-card";

/* ------------------------------------------------------------------ */
/*  Témoignages                                                        */
/* ------------------------------------------------------------------ */

function TemoignagesSection() {
  const temoignages = useTemoignages();

  const maj = (id: number, champCle: keyof TemoignageEdit, valeur: string) =>
    setTemoignages(temoignages.map((t) => (t.id === id ? { ...t, [champCle]: valeur } : t)));

  return (
    <section className={carte} aria-labelledby="temoignages-heading">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="temoignages-heading" className="text-lg font-bold text-text-primary">Témoignages clients</h2>
          <p className="mt-1 text-sm text-text-secondary">Les avis affichés sur les pages d'accueil. L'email n'est jamais affiché : des initiales suffisent.</p>
        </div>
        <button type="button" onClick={resetTemoignages} className="shrink-0 rounded-xl border border-border-standard px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-brand-light">
          Rétablir
        </button>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {temoignages.map((t) => (
          <div key={t.id} className="rounded-xl border border-border-light bg-brand-surface p-4 space-y-3">
            <div className="grid grid-cols-[minmax(0,1fr)_5rem] gap-2">
              <input value={t.nom} onChange={(e) => maj(t.id, "nom", e.target.value)} placeholder="Nom du client" aria-label={`Nom du témoignage ${t.id}`} className={champ} />
              <input value={t.initiales} onChange={(e) => maj(t.id, "initiales", e.target.value.toUpperCase().slice(0, 3))} placeholder="AD" aria-label={`Initiales du témoignage ${t.id}`} className={champ} maxLength={3} />
            </div>
            <textarea value={t.message} onChange={(e) => maj(t.id, "message", e.target.value)} placeholder="L'avis du client…" rows={4} aria-label={`Message du témoignage ${t.id}`} className={champ} />
            <p className="text-xs text-text-muted line-clamp-2 italic">Aperçu : « {t.message} »</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Engagements (Pourquoi nous choisir)                                */
/* ------------------------------------------------------------------ */

function EngagementsSection() {
  const engagements = useEngagements();

  const maj = (id: number, champCle: keyof EngagementEdit, valeur: string) =>
    setEngagements(engagements.map((e) => (e.id === id ? { ...e, [champCle]: valeur } : e)));

  return (
    <section className={carte} aria-labelledby="engagements-heading">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="engagements-heading" className="text-lg font-bold text-text-primary">Pourquoi nous choisir</h2>
          <p className="mt-1 text-sm text-text-secondary">Quatre engagements affichés sur les pages d'accueil, sous leur icône.</p>
        </div>
        <button type="button" onClick={resetEngagements} className="shrink-0 rounded-xl border border-border-standard px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-brand-light">
          Rétablir
        </button>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {engagements.map((e) => (
          <div key={e.id} className="rounded-xl border border-border-light bg-brand-surface p-4 space-y-3">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-brand-red text-2xl" aria-hidden="true">{e.icone}</span>
              <input value={e.titre} onChange={(event) => maj(e.id, "titre", event.target.value)} placeholder="Titre de l'engagement" aria-label={`Titre de l'engagement ${e.id}`} className={champ} maxLength={40} />
            </div>
            <input value={e.description} onChange={(event) => maj(e.id, "description", event.target.value)} placeholder="Description" aria-label={`Description de l'engagement ${e.id}`} className={champ} maxLength={120} />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Domaines de la page d'accueil                                      */
/* ------------------------------------------------------------------ */

function DomainesSection() {
  const domaines = useDomaines();

  const maj = (id: number, champCle: keyof DomaineEdit, valeur: string) =>
    setDomaines(domaines.map((d) => (d.id === id ? { ...d, [champCle]: valeur } : d)));

  return (
    <section className={carte} aria-labelledby="domaines-heading">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="domaines-heading" className="text-lg font-bold text-text-primary">Domaines de l'accueil</h2>
          <p className="mt-1 text-sm text-text-secondary">Les trois grandes rubriques mises en avant (vente, location, transit). Chaque lien pointe vers sa page.</p>
        </div>
        <button type="button" onClick={resetDomaines} className="shrink-0 rounded-xl border border-border-standard px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-brand-light">
          Rétablir
        </button>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {domaines.map((d) => (
          <div key={d.id} className="rounded-xl border border-border-light bg-brand-surface p-4 space-y-3">
            <input value={d.titre} onChange={(event) => maj(d.id, "titre", event.target.value)} placeholder="Titre du domaine" aria-label={`Titre du domaine ${d.id}`} className={champ} maxLength={50} />
            <textarea value={d.description} onChange={(event) => maj(d.id, "description", event.target.value)} placeholder="Description" rows={3} aria-label={`Description du domaine ${d.id}`} className={champ} maxLength={200} />
            <div className="grid grid-cols-2 gap-2">
              <input value={d.icone} onChange={(event) => maj(d.id, "icone", event.target.value)} placeholder="directions_car" aria-label={`Icône du domaine ${d.id}`} className={champ} maxLength={40} />
              <input value={d.lien} onChange={(event) => maj(d.id, "lien", event.target.value)} placeholder="/vente" aria-label={`Lien du domaine ${d.id}`} className={champ} maxLength={80} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function AdminContenu() {
  return (
    <div className="mx-auto max-w-6xl space-y-7">
      <header>
        <p className="text-sm font-semibold text-brand-red">Personnalisation</p>
        <h1 className="mt-1 text-3xl font-bold text-text-primary">Contenu du site</h1>
        <p className="mt-2 max-w-2xl text-text-secondary">
          Les textes de présentation affichés au public : témoignages, engagements et domaines d'expertise de
          l'accueil. Chaque modification est appliquée immédiatement et conservée sur cet appareil.
        </p>
      </header>

      <TemoignagesSection />
      <EngagementsSection />
      <DomainesSection />

      <p className="text-xs text-text-muted">
        Enregistré au fil de la frappe — le site public se met à jour en direct. Les autres contenus (en-têtes de
        pages, services, informations de l'entreprise) se gèrent dans leurs sections dédiées.
      </p>
    </div>
  );
}
