'use client';

import Image from 'next/image';
import { useLanguage, type Locale } from '@/components/language-provider';

type Copy = {
  kicker: string;
  title: string;
  tagline: string;
  intro: string;
  ppwrTitle: string;
  ppwrBody: string;
  dppTitle: string;
  dppBody: string;
  cardCta: string;
  ctaLabel: string;
  ctaSub: string;
};

const COPY: Record<Locale, Copy> = {
  en: {
    kicker: 'Regulation',
    title: 'PPWR & DPP',
    tagline:
      'We support printers and brands every step of the way toward PPWR compliance and Digital Product Passport readiness.',
    intro:
      "The Packaging and Packaging Waste Regulation (PPWR) is the new EU framework that sets binding rules for every packaging placed on the European market, recyclability, recycled content, minimisation, labelling and traceability. To prove compliance, each product will carry a Digital Product Passport (DPP): a machine-readable record, typically accessed via a QR code, that exposes composition, materials origin, recyclability and end-of-life information to brands, authorities and consumers.",
    ppwrTitle: 'PPWR compliance',
    ppwrBody:
      'Recyclable by design, validated recycled content, FSC-certified substrates, minimised packaging. We help you turn regulatory text into concrete production standards, audited, documented and ready for market checks.',
    dppTitle: 'Digital Product Passport',
    dppBody:
      'Each pack becomes a data carrier. A single scan reveals composition, materials origin and recyclability, structured data, updated in real time, shared across the value chain from supplier to consumer.',
    cardCta: 'Learn more',
    ctaLabel: 'Discover PPWR Connect',
    ctaSub: 'Your fast-track to PPWR & DPP readiness',
  },
  fr: {
    kicker: 'Réglementation',
    title: 'PPWR & DPP',
    tagline:
      'Nous accompagnons imprimeurs et marques à chaque étape vers la conformité PPWR et la mise en place du Passeport Produit Numérique.',
    intro:
      "Le règlement PPWR (Packaging and Packaging Waste Regulation) est le nouveau cadre européen qui fixe des règles contraignantes pour tout emballage mis sur le marché européen : recyclabilité, contenu recyclé, réduction, étiquetage et traçabilité. Pour prouver la conformité, chaque produit embarquera un Passeport Produit Numérique (DPP) : une fiche lisible par machine, généralement accessible par QR code, qui expose composition, origine des matériaux, recyclabilité et fin de vie aux marques, autorités et consommateurs.",
    ppwrTitle: 'Conformité PPWR',
    ppwrBody:
      "Recyclable par conception, contenu recyclé validé, supports FSC, emballage minimisé. Nous vous aidons à traduire le texte réglementaire en standards de production concrets, audités, documentés et prêts pour les contrôles marché.",
    dppTitle: 'Passeport Produit Numérique',
    dppBody:
      "Chaque emballage devient un support de données. Un simple scan révèle composition, origine des matériaux et recyclabilité, une donnée structurée, mise à jour en temps réel, partagée de bout en bout de la chaîne de valeur, du fournisseur au consommateur.",
    cardCta: 'En savoir plus',
    ctaLabel: 'Découvrir PPWR Connect',
    ctaSub: 'Votre accès rapide à la conformité PPWR & DPP',
  },
  de: {
    kicker: 'Regulierung',
    title: 'PPWR & DPP',
    tagline:
      'Wir begleiten Druckereien und Marken Schritt für Schritt auf dem Weg zur PPWR-Konformität und zum Digitalen Produktpass.',
    intro:
      'Die Packaging and Packaging Waste Regulation (PPWR) ist der neue EU-Rahmen mit verbindlichen Regeln für jede Verpackung, die auf dem europäischen Markt in Verkehr gebracht wird: Recyclingfähigkeit, Rezyklatanteil, Reduktion, Kennzeichnung und Rückverfolgbarkeit. Als Nachweis trägt jedes Produkt einen Digitalen Produktpass (DPP): ein maschinenlesbarer Datensatz, in der Regel per QR-Code abrufbar, der Zusammensetzung, Materialherkunft, Recyclingfähigkeit und End-of-Life-Informationen für Marken, Behörden und Verbraucher offenlegt.',
    ppwrTitle: 'PPWR-Konformität',
    ppwrBody:
      'Recyclingfähig im Design, validierter Rezyklatanteil, FSC-zertifizierte Substrate, minimierte Verpackung. Wir helfen Ihnen, den regulatorischen Text in konkrete Produktionsstandards zu übersetzen, auditiert, dokumentiert und bereit für Marktkontrollen.',
    dppTitle: 'Digitaler Produktpass',
    dppBody:
      'Jede Verpackung wird zum Datenträger. Ein Scan enthüllt Zusammensetzung, Materialherkunft und Recyclingfähigkeit, strukturierte Daten, in Echtzeit aktualisiert, entlang der gesamten Wertschöpfungskette vom Lieferanten bis zum Verbraucher geteilt.',
    cardCta: 'Mehr erfahren',
    ctaLabel: 'PPWR Connect entdecken',
    ctaSub: 'Ihr schneller Weg zur PPWR- und DPP-Bereitschaft',
  },
  it: {
    kicker: 'Regolamentazione',
    title: 'PPWR & DPP',
    tagline:
      'Aiutiamo stampatori e brand a prepararsi alla conformità PPWR e al Digital Product Passport, passo dopo passo.',
    intro:
      "Il regolamento PPWR (Packaging and Packaging Waste Regulation) è il nuovo quadro europeo che stabilisce regole vincolanti per ogni imballaggio immesso sul mercato europeo: riciclabilità, contenuto riciclato, riduzione, etichettatura e tracciabilità. A dimostrazione della conformità, ogni prodotto avrà un Digital Product Passport (DPP): una scheda leggibile da macchina, di norma accessibile via QR code, che espone composizione, origine dei materiali, riciclabilità e fine vita a brand, autorità e consumatori.",
    ppwrTitle: 'Conformità PPWR',
    ppwrBody:
      'Design riciclabile, contenuto riciclato validato, supporti certificati FSC, packaging ottimizzato. Ti aiutiamo a trasformare i requisiti normativi in standard produttivi concreti: documentati, verificabili e pronti per eventuali controlli di mercato.',
    dppTitle: 'Digital Product Passport',
    dppBody:
      'Ogni packaging diventa un supporto dati. Con una sola scansione è possibile accedere a composizione, origine dei materiali e riciclabilità: informazioni strutturate, sempre aggiornate e condivisibili lungo tutta la catena del valore, dal fornitore al consumatore.',
    cardCta: 'Scopri di più',
    ctaLabel: 'Scopri PPWR Connect',
    ctaSub: 'Il percorso più rapido verso la preparazione PPWR & DPP',
  },
  es: {
    kicker: 'Regulación',
    title: 'PPWR & DPP',
    tagline:
      'Acompañamos a impresores y marcas en cada paso hacia la conformidad PPWR y la puesta en marcha del Pasaporte Digital de Producto.',
    intro:
      "El reglamento PPWR (Packaging and Packaging Waste Regulation) es el nuevo marco europeo que fija reglas vinculantes para todo envase puesto en el mercado europeo: reciclabilidad, contenido reciclado, reducción, etiquetado y trazabilidad. Para demostrar el cumplimiento, cada producto llevará un Pasaporte Digital de Producto (DPP): una ficha legible por máquina, normalmente accesible mediante código QR, que expone composición, origen de los materiales, reciclabilidad y fin de vida a marcas, autoridades y consumidores.",
    ppwrTitle: 'Cumplimiento PPWR',
    ppwrBody:
      'Reciclable por diseño, contenido reciclado validado, soportes FSC, envase minimizado. Le ayudamos a traducir el texto normativo en estándares de producción concretos, auditados, documentados y listos para los controles de mercado.',
    dppTitle: 'Pasaporte Digital de Producto',
    dppBody:
      'Cada envase se convierte en soporte de datos. Un escaneo revela composición, origen de los materiales y reciclabilidad, datos estructurados, actualizados en tiempo real, compartidos a lo largo de toda la cadena de valor, desde el proveedor hasta el consumidor.',
    cardCta: 'Saber más',
    ctaLabel: 'Descubrir PPWR Connect',
    ctaSub: 'Tu vía rápida a la conformidad PPWR y DPP',
  },
};

export function PPWRSection() {
  const { locale } = useLanguage();
  const t = COPY[locale];

  return (
    <section className="section ppwr-section" id="ppwr">
      <div className="container ppwr-shell">
        <div className="ppwr-intro">
          <p className="section-kicker">{t.kicker}</p>
          <h2 className="ppwr-title">{t.title}</h2>
          <p className="ppwr-tagline">{t.tagline}</p>
        </div>

        <div className="ppwr-grid">
          <article className="ppwr-card ppwr-card-dpp">
            <div className="ppwr-card-media">
              <Image
                src="/images/ppwr/ppwr-dpp-scan.jpg"
                alt="Digital Product Passport, scan and data visualisation"
                width={1600}
                height={1800}
                sizes="(max-width: 768px) 92vw, (max-width: 1200px) 45vw, 520px"
              />
            </div>
            <div className="ppwr-card-copy">
              <h3>{t.dppTitle}</h3>
              <p>{t.dppBody}</p>
              <a
                className="ppwr-card-link"
                href="https://ppwrconnect.com"
                target="_blank"
                rel="noreferrer"
              >
                {t.cardCta}
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </article>

          <article className="ppwr-card ppwr-card-ppwr">
            <div className="ppwr-card-media">
              <Image
                src="/images/ppwr/ppwr-compliance.jpg"
                alt="PPWR compliance, FSC, recyclability and recycled content validation"
                width={1600}
                height={1800}
                sizes="(max-width: 768px) 92vw, (max-width: 1200px) 45vw, 520px"
              />
            </div>
            <div className="ppwr-card-copy">
              <h3>{t.ppwrTitle}</h3>
              <p>{t.ppwrBody}</p>
              <a
                className="ppwr-card-link"
                href="https://ppwrconnect.com"
                target="_blank"
                rel="noreferrer"
              >
                {t.cardCta}
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </article>
        </div>

        <div className="ppwr-cta">
          <a
            className="button button-dark ppwr-cta-button"
            href="https://ppwrconnect.com"
            target="_blank"
            rel="noreferrer"
          >
            {t.ctaLabel}
          </a>
          <p className="ppwr-cta-sub">{t.ctaSub}</p>
        </div>
      </div>
    </section>
  );
}
