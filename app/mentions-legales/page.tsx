import type { Metadata } from 'next';
import { SiteFooter } from '@/components/site-footer';
import { SiteNav } from '@/components/site-nav';

export const metadata: Metadata = {
  title: 'Mentions légales | Rutherford',
};

// Scaffold — the legal wording in [brackets] must be completed by Rutherford.
export default function MentionsLegalesPage() {
  return (
    <main className="page-shell" id="top">
      <SiteNav />
      <section className="section legal-page">
        <div className="container legal-prose">
          <p className="section-kicker">Rutherford.fr</p>
          <h1>Mentions légales</h1>

          <h2>Éditeur du site</h2>
          <p>
            [Raison sociale], [forme juridique] au capital de [montant] €. Siège : [adresse]. RCS [ville] [n°] · SIRET
            [n°] · TVA intracommunautaire [n°]. Directeur de la publication : [nom]. Contact :{' '}
            <a href="mailto:contact@rutherford.fr">contact@rutherford.fr</a>.
          </p>

          <h2>Hébergement</h2>
          <p>
            Site hébergé par Vercel Inc., [adresse]. Base de données et stockage : Supabase, [région UE]. [Compléter les
            coordonnées exactes des hébergeurs.]
          </p>

          <h2>Propriété intellectuelle</h2>
          <p>
            L’ensemble des contenus de ce site (marques, logos, textes, visuels) est la propriété de [Raison sociale] ou
            de ses partenaires, et est protégé par le droit de la propriété intellectuelle. Toute reproduction sans
            autorisation est interdite.
          </p>

          <h2>Données personnelles</h2>
          <p>
            Le traitement de vos données est décrit dans notre{' '}
            <a href="/confidentialite">politique de confidentialité</a>.
          </p>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
