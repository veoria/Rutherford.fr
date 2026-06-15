import type { Metadata } from 'next';
import { SiteFooter } from '@/components/site-footer';
import { SiteNav } from '@/components/site-nav';

export const metadata: Metadata = {
  title: 'Politique de confidentialité | Rutherford',
};

// Scaffold — the legal wording in [brackets] must be completed by Rutherford.
export default function ConfidentialitePage() {
  return (
    <main className="page-shell" id="top">
      <SiteNav />
      <section className="section legal-page">
        <div className="container legal-prose">
          <p className="section-kicker">Rutherford.fr</p>
          <h1>Politique de confidentialité</h1>
          <p className="legal-updated">Dernière mise à jour : [à compléter]</p>

          <h2>1. Responsable du traitement</h2>
          <p>
            [Raison sociale], [forme juridique au capital de …], [adresse du siège]. Contact :{' '}
            <a href="mailto:contact@rutherford.fr">contact@rutherford.fr</a>. [DPO / référent RGPD : à compléter.]
          </p>

          <h2>2. Données que nous collectons</h2>
          <p>
            Compte (nom, adresse e-mail, société, pays, poste), demandes de validation console (presse, photos, notes),
            progression et certificats Academy, e-mail de notification, et mesure d’audience (avec votre consentement).
          </p>

          <h2>3. Finalités et bases légales</h2>
          <ul>
            <li>Création et gestion de votre compte — exécution du contrat.</li>
            <li>Traitement des validations console et du support — intérêt légitime / exécution.</li>
            <li>Communications commerciales — votre consentement.</li>
            <li>Mesure d’audience — votre consentement (cookies).</li>
          </ul>

          <h2>4. Destinataires et sous-traitants</h2>
          <p>
            Prestataires techniques : Supabase (base de données, hébergement UE), Microsoft 365 (envoi d’e-mails),
            Pipedrive (CRM), Asana (suivi des demandes), Google Analytics (mesure d’audience). [Compléter la liste et les
            localisations exactes.]
          </p>

          <h2>5. Durées de conservation</h2>
          <p>[À compléter — par finalité.]</p>

          <h2>6. Vos droits</h2>
          <p>
            Vous disposez des droits d’accès, de rectification, d’effacement, de portabilité, de limitation et
            d’opposition. Depuis votre espace compte (rubrique « Mon profil »), vous pouvez{' '}
            <strong>exporter vos données</strong> et <strong>supprimer votre compte</strong>. Vous pouvez aussi introduire
            une réclamation auprès de la CNIL.
          </p>

          <h2>7. Cookies</h2>
          <p>
            La mesure d’audience n’est activée qu’après votre consentement (bannière cookies). Les cookies strictement
            nécessaires au fonctionnement (session de connexion) ne requièrent pas de consentement.
          </p>

          <h2>8. Contact</h2>
          <p>
            <a href="mailto:contact@rutherford.fr">contact@rutherford.fr</a>
          </p>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
