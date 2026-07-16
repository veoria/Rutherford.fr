'use client';

import { SiteFooter } from '@/components/site-footer';
import { SiteNav } from '@/components/site-nav';
import { useLanguage, type Locale } from '@/components/language-provider';

// Pillar page of the "closed-loop color control" cluster (SEO/GEO phase 2).
// The weekly blog articles of the cluster link back here. EN and FR are fully
// written; DE/IT/ES/PT fall back to EN for now and will be localized when GSC
// shows demand (data-driven rule of the group playbook).

type Section = { h2: string; paras: string[]; list?: string[] };
type Faq = { q: string; a: string };
type Related = { href: string; label: string };

type Copy = {
  kicker: string;
  title: string;
  lede: string;
  sections: Section[];
  faqTitle: string;
  faq: Faq[];
  relatedTitle: string;
  related: Related[];
  ctaTitle: string;
  ctaText: string;
  ctaPrimary: string;
  ctaSecondary: string;
};

const EN: Copy = {
  kicker: 'The complete guide',
  title: 'Closed-loop color control for offset printing',
  lede: 'Closed-loop color control measures every printed sheet, compares it to the target and corrects the ink keys automatically. This guide explains how the loop works, what it changes for makeready, waste and color consistency, and how it fits ISO 12647-2 and G7 production. Rutherford has deployed it on 1,000+ presses in 30+ countries.',
  sections: [
    {
      h2: 'What is closed-loop color control?',
      paras: [
        'Closed-loop color control is an automation cycle on the press: a scanning spectrophotometer reads the color bar of a sheet, software compares the measured values (density, DeltaE) to the target, and the ink keys of every zone are corrected automatically. The operator supervises instead of chasing color by eye.',
        'The word "loop" matters: measurement, comparison and correction repeat continuously during the run. Open-loop tools measure and display; the operator still decides and adjusts. A closed loop closes that last step, so color converges on target within a few sheets and stays there.',
      ],
    },
    {
      h2: 'How the loop works, step by step',
      paras: [
        'On a typical sheetfed press equipped by Rutherford, the cycle runs like this:',
      ],
      list: [
        'The operator pulls a sheet and lays it on the scanning table; an X-Rite IntelliTrax2 scans the full color bar in under 15 seconds.',
        'MeasureColor evaluates the measurements against the job target: ISO 12647-2, G7 or the approved OK sheet.',
        'ColorLoop computes the correction for every ink key of every unit, and sends it to the press console.',
        'The press applies the new key positions; the next pull confirms convergence. The system learns the press behavior job after job.',
      ],
    },
    {
      h2: 'What it changes: makeready, waste, consistency',
      paras: [
        'The economics are concentrated at the start of every run. A conventional makeready burns 200 to 500 sheets while the operator brings color in manually; with automatic presetting and a closed loop, target color is reached within the first sheets. Deployments measure up to 65% less makeready waste and up to 45% shorter makeready time, which frees capacity for more jobs per shift.',
        'During the run, the loop absorbs color drift from temperature, ink-water balance and blanket condition before it becomes visible. The result is color consistency: the same DeltaE tolerance held from the OK sheet to the last sheet, run after run. For a pressroom, that is typically worth 60,000 to 150,000 euros a year; the ROI calculator translates it into your own production figures.',
      ],
    },
    {
      h2: 'Presetting and closed loop: two halves of the same automation',
      paras: [
        'Ink presetting (CIP3 / CIP4) uses prepress coverage data to set the starting position of every ink key before the first sheet. It gets the press close to color, but it cannot react to what actually happens on paper. The closed loop is the other half: it measures reality and corrects, from the first pull to the end of the run.',
        'Combined, they compound: a good preset means the loop starts near target and converges in two or three corrections. That is the architecture of the Offset360 bundle: presetting, measurement and closed-loop correction in one workflow.',
      ],
    },
    {
      h2: 'Standards: holding ISO 12647-2 and G7, not just reaching them',
      paras: [
        'ISO 12647-2 in Europe and G7 in North America define what correct color is: CIELAB targets, TVI curves, gray balance. Certification proves a press can hit the target on the audit day; the daily challenge is holding it on every job with real-world paper, inks and deadlines.',
        'That is precisely what a closed loop industrializes. The standard becomes the target loaded in the software, and every sheet is steered toward it, with measurement records as evidence for customers and auditors. For brand owners printing in several plants or countries, it is the practical mechanism behind "same color everywhere".',
      ],
    },
    {
      h2: 'On which presses? Retrofit first',
      paras: [
        'Closed-loop control does not require a new press. Rutherford retrofits sheetfed presses of virtually every brand and generation, from 30-year-old machines to current models: Heidelberg, Komori, Koenig & Bauer, Manroland, Mitsubishi, Ryobi and more. The connection point is the press console.',
        'The free Rutherford Check (console validation) confirms compatibility for your specific console in about two minutes: you describe the console, our team validates the interface and answers with the deployment path.',
      ],
    },
  ],
  faqTitle: 'Frequently asked questions',
  faq: [
    {
      q: 'What is the difference between closed-loop and open-loop color control?',
      a: 'Open-loop systems measure the sheet and display deviations; the operator decides and adjusts the ink keys manually. Closed-loop systems like ColorLoop take the extra step: they compute and apply the ink key corrections automatically, so color converges without manual intervention.',
    },
    {
      q: 'How much waste does closed-loop color control save?',
      a: 'Deployments measured by Rutherford show up to 65% less makeready waste and up to 45% shorter makeready time, because the press reaches target color within the first sheets instead of after hundreds. Savings scale with the number of job changes per shift.',
    },
    {
      q: 'Does a closed loop work on an old press?',
      a: 'Yes. The loop connects to the press console, not to the press mechanics, so presses over 30 years old can be retrofitted. The free Rutherford Check validates a specific console in about two minutes.',
    },
    {
      q: 'Is closed-loop color control compatible with G7 and ISO 12647-2?',
      a: 'Yes, it is the practical way to hold them in production. The standard’s aim points (CIELAB, TVI, gray balance) are loaded as the target, and every measured sheet is corrected toward that target, with records as audit evidence.',
    },
    {
      q: 'What hardware and software does a Rutherford closed loop use?',
      a: 'A typical line pairs an X-Rite IntelliTrax2 scanning spectrophotometer and MeasureColor with the ColorLoop software, which computes corrections and drives the console. Existing X-Rite hardware can usually be kept and upgraded.',
    },
  ],
  relatedTitle: 'Go deeper',
  related: [
    { href: '/blog/closed-loop-color-control-offset-guide', label: 'Closed-loop color control: the field guide' },
    { href: '/blog/cip3-cip4-ink-presetting-makeready', label: 'CIP3 / CIP4 ink presetting and makeready' },
    { href: '/blog/reduce-makeready-waste-offset-press', label: 'Reducing makeready waste on an offset press' },
    { href: '/blog/delta-e-tolerance-print-guide', label: 'DeltaE tolerances in print, explained' },
    { href: '/blog/g7-vs-iso-12647-offset-color', label: 'G7 vs ISO 12647-2 for offset color' },
    { href: '/glossary', label: 'Offset color management glossary' },
  ],
  ctaTitle: 'Is your press ready for closed loop?',
  ctaText: 'The free Rutherford Check tells you in about two minutes if your console is compatible, and the ROI calculator estimates what the loop would save on your own production.',
  ctaPrimary: 'Request console validation',
  ctaSecondary: 'Estimate my ROI',
};

const FR: Copy = {
  kicker: 'Le guide complet',
  title: 'Le contrôle couleur en closed loop pour l’offset',
  lede: 'Le closed loop mesure chaque feuille imprimée, la compare à la cible et corrige automatiquement les vis d’encrier. Ce guide explique comment fonctionne la boucle, ce qu’elle change pour le calage, la gâche et la constance couleur, et comment elle s’inscrit dans une production ISO 12647-2 ou G7. Rutherford l’a déployée sur plus de 1 000 presses dans plus de 30 pays.',
  sections: [
    {
      h2: 'Qu’est-ce que le contrôle couleur en closed loop ?',
      paras: [
        'Le closed loop est un cycle d’automatisation sur la presse : un spectrophotomètre à balayage lit la barre de contrôle d’une feuille, le logiciel compare les valeurs mesurées (densité, DeltaE) à la cible, et les vis d’encrier de chaque zone sont corrigées automatiquement. Le conducteur supervise au lieu de courir après la couleur à l’œil.',
        'Le mot « boucle » compte : mesure, comparaison et correction se répètent en continu pendant le tirage. Les outils en boucle ouverte mesurent et affichent ; le conducteur décide et ajuste encore. Le closed loop ferme cette dernière étape : la couleur converge vers la cible en quelques feuilles et y reste.',
      ],
    },
    {
      h2: 'Comment fonctionne la boucle, étape par étape',
      paras: [
        'Sur une presse feuille équipée par Rutherford, le cycle se déroule ainsi :',
      ],
      list: [
        'Le conducteur tire une feuille et la pose sur la table de scan ; un X-Rite IntelliTrax2 lit toute la barre de contrôle en moins de 15 secondes.',
        'MeasureColor évalue les mesures par rapport à la cible du travail : ISO 12647-2, G7 ou le bon à rouler approuvé.',
        'ColorLoop calcule la correction de chaque vis d’encrier de chaque groupe et l’envoie à la console de la presse.',
        'La presse applique les nouvelles positions ; la feuille suivante confirme la convergence. Le système apprend le comportement de la presse tirage après tirage.',
      ],
    },
    {
      h2: 'Ce que ça change : calage, gâche, constance',
      paras: [
        'L’enjeu économique se concentre au démarrage de chaque tirage. Un calage classique brûle 200 à 500 feuilles pendant que le conducteur monte la couleur à la main ; avec un préréglage automatique et un closed loop, la couleur cible est atteinte dès les premières feuilles. Les déploiements mesurent jusqu’à 65 % de gâche au calage en moins et un calage jusqu’à 45 % plus court, ce qui libère de la capacité pour plus de travaux par équipe.',
        'Pendant le tirage, la boucle absorbe la dérive couleur liée à la température, à l’équilibre eau-encre et à l’état des blanchets avant qu’elle soit visible. Le résultat, c’est la constance couleur : la même tolérance DeltaE tenue du bon à rouler à la dernière feuille, tirage après tirage. Pour un atelier, cela vaut typiquement 60 000 à 150 000 euros par an ; le calculateur ROI le traduit dans vos propres chiffres de production.',
      ],
    },
    {
      h2: 'Préréglage et closed loop : les deux moitiés de la même automatisation',
      paras: [
        'Le préréglage d’encrage (CIP3 / CIP4) utilise les données de couverture du prépresse pour positionner chaque vis d’encrier avant la première feuille. Il amène la presse près de la couleur, mais il ne peut pas réagir à ce qui se passe réellement sur le papier. Le closed loop est l’autre moitié : il mesure la réalité et corrige, de la première feuille à la fin du tirage.',
        'Combinés, ils se renforcent : un bon préréglage fait démarrer la boucle près de la cible, qui converge en deux ou trois corrections. C’est l’architecture du bundle Offset360 : préréglage, mesure et correction closed loop dans un seul workflow.',
      ],
    },
    {
      h2: 'Les standards : tenir l’ISO 12647-2 et le G7, pas seulement les atteindre',
      paras: [
        'L’ISO 12647-2 en Europe et le G7 en Amérique du Nord définissent ce qu’est une couleur juste : cibles CIELAB, courbes de TVI, équilibre des gris. La certification prouve qu’une presse sait atteindre la cible le jour de l’audit ; le défi quotidien est de la tenir sur chaque travail, avec les papiers, les encres et les délais du réel.',
        'C’est exactement ce que le closed loop industrialise. Le standard devient la cible chargée dans le logiciel, et chaque feuille est ramenée vers elle, avec des relevés de mesure comme preuves pour les clients et les auditeurs. Pour les marques qui impriment dans plusieurs usines ou pays, c’est le mécanisme concret derrière « la même couleur partout ».',
      ],
    },
    {
      h2: 'Sur quelles presses ? Le retrofit d’abord',
      paras: [
        'Le closed loop n’exige pas une presse neuve. Rutherford équipe en retrofit des presses feuille de pratiquement toutes les marques et générations, des machines de 30 ans aux modèles actuels : Heidelberg, Komori, Koenig & Bauer, Manroland, Mitsubishi, Ryobi et d’autres. Le point de connexion, c’est la console de la presse.',
        'Le Rutherford Check gratuit (validation console) confirme la compatibilité de votre console précise en deux minutes environ : vous décrivez la console, notre équipe valide l’interface et vous répond avec le chemin de déploiement.',
      ],
    },
  ],
  faqTitle: 'Questions fréquentes',
  faq: [
    {
      q: 'Quelle différence entre closed loop et boucle ouverte ?',
      a: 'Les systèmes en boucle ouverte mesurent la feuille et affichent les écarts ; le conducteur décide et ajuste les vis d’encrier à la main. Les systèmes closed loop comme ColorLoop font l’étape de plus : ils calculent et appliquent automatiquement les corrections, et la couleur converge sans intervention manuelle.',
    },
    {
      q: 'Combien de gâche le closed loop économise-t-il ?',
      a: 'Les déploiements mesurés par Rutherford montrent jusqu’à 65 % de gâche au calage en moins et un calage jusqu’à 45 % plus court, parce que la presse atteint la couleur cible dès les premières feuilles au lieu de plusieurs centaines. L’économie grandit avec le nombre de changements de travaux par équipe.',
    },
    {
      q: 'Le closed loop fonctionne-t-il sur une presse ancienne ?',
      a: 'Oui. La boucle se connecte à la console de la presse, pas à sa mécanique : des presses de plus de 30 ans sont équipées en retrofit. Le Rutherford Check gratuit valide une console précise en deux minutes environ.',
    },
    {
      q: 'Le closed loop est-il compatible G7 et ISO 12647-2 ?',
      a: 'Oui, c’est même le moyen concret de les tenir en production. Les valeurs cibles du standard (CIELAB, TVI, équilibre des gris) sont chargées comme référence, et chaque feuille mesurée est corrigée vers cette référence, avec des relevés comme preuves d’audit.',
    },
    {
      q: 'Quel matériel et quel logiciel utilise un closed loop Rutherford ?',
      a: 'Une ligne type associe un spectrophotomètre à balayage X-Rite IntelliTrax2 et MeasureColor au logiciel ColorLoop, qui calcule les corrections et pilote la console. Le matériel X-Rite existant peut en général être conservé et mis à niveau.',
    },
  ],
  relatedTitle: 'Pour aller plus loin',
  related: [
    { href: '/blog/closed-loop-color-control-offset-guide', label: 'Closed loop : le guide terrain' },
    { href: '/blog/cip3-cip4-ink-presetting-makeready', label: 'Préréglage CIP3 / CIP4 et calage' },
    { href: '/blog/reduce-makeready-waste-offset-press', label: 'Réduire la gâche au calage en offset' },
    { href: '/blog/delta-e-tolerance-print-guide', label: 'Les tolérances DeltaE en imprimerie' },
    { href: '/blog/g7-vs-iso-12647-offset-color', label: 'G7 ou ISO 12647-2 pour l’offset' },
    { href: '/glossary', label: 'Glossaire de la gestion de la couleur offset' },
  ],
  ctaTitle: 'Votre presse est-elle prête pour le closed loop ?',
  ctaText: 'Le Rutherford Check gratuit vous dit en deux minutes environ si votre console est compatible, et le calculateur ROI estime ce que la boucle économiserait sur votre propre production.',
  ctaPrimary: 'Demander une validation console',
  ctaSecondary: 'Estimer mon ROI',
};

// DE/IT/ES/PT deliberately fall back to EN until GSC data justifies localizing
// a 1,500-word pillar (group playbook: language choices follow measured demand).
const COPY: Record<Locale, Copy> = { en: EN, fr: FR, de: EN, it: EN, es: EN, pt: EN };

export function PillarClosedLoopPage() {
  const { locale } = useLanguage();
  const t = COPY[locale];
  const lhref = (path: string) => (locale === 'en' ? path : `/${locale}${path}`);

  return (
    <main className="page-shell">
      <SiteNav />

      <section className="blog-hero section">
        <div className="container blog-hero-inner">
          <p className="section-kicker">{t.kicker}</p>
          <h1>{t.title}</h1>
          <p>{t.lede}</p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 8 }}>
        <div className="container">
          <div className="article-reading">
            <div className="article-content">
              {t.sections.map((section) => (
                <div key={section.h2}>
                  <h2>{section.h2}</h2>
                  {section.paras.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                  {section.list ? (
                    <ul>
                      {section.list.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}

              <h2>{t.faqTitle}</h2>
              {t.faq.map((f) => (
                <div key={f.q}>
                  <h3>{f.q}</h3>
                  <p>{f.a}</p>
                </div>
              ))}

              <h2>{t.relatedTitle}</h2>
              <ul>
                {t.related.map((r) => (
                  <li key={r.href}>
                    <a href={lhref(r.href)} style={{ color: 'var(--accent)', fontWeight: 600 }}>{r.label}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glossary-cta" style={{ marginTop: 40 }}>
              <h2>{t.ctaTitle}</h2>
              <p>{t.ctaText}</p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <a className="glossary-cta-btn" href={lhref('/console-validation')}>{t.ctaPrimary}</a>
                <a className="glossary-cta-btn" style={{ background: 'var(--accent)' }} href={lhref('/roi')}>{t.ctaSecondary}</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
