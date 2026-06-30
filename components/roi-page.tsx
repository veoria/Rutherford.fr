'use client';

import { useState, type FormEvent } from 'react';
import { useLanguage, type Locale } from '@/components/language-provider';
import { SiteNav } from '@/components/site-nav';
import { SiteFooter } from '@/components/site-footer';
import { ColorLoopROI } from '@/components/colorloop-roi';
import { CaseStudiesShowcase } from '@/components/case-studies-showcase';
import { ConsoleValidationCTA } from '@/components/console-validation-cta';

type Lever = { title: string; body: string };
type Assumption = { value: string; unit: string; note: string };

type RoiCopy = {
  hero: { kicker: string; h1: string; lead: string; ctaCalc: string; ctaConsole: string; trust: string };
  capture: {
    kicker: string;
    h2: string;
    lead: string;
    emailLabel: string;
    emailPlaceholder: string;
    companyLabel: string;
    companyPlaceholder: string;
    button: string;
    note: string;
    success: string;
    sending: string;
    error: string;
  };
  levers: { kicker: string; h2: string; items: Lever[] };
  method: { kicker: string; h2: string; lead: string; items: Assumption[] };
  testimonial: { kicker: string; quote: string; author: string; cta: string };
};

// The reused sections (calculator, case studies, final CTA, nav, footer) are
// already multilingual. The testimonial is a real, on-the-record quote from
// Viappiani Printing's Rutherford video, deep-linked to the ROI passage.
const TESTIMONIAL_VIDEO = 'https://youtu.be/r7_4EdplcdE?t=64';

const COPY: Record<Locale, RoiCopy> = {
  en: {
    hero: {
      kicker: 'ROI estimator',
      h1: 'How much could ColorLoop save your pressroom?',
      lead: 'In under a minute, estimate the waste, makeready time and costs you can recover on your offset presses — from your own figures.',
      ctaCalc: 'Calculate your savings',
      ctaConsole: 'Request console validation',
      trust: '25+ years · 30+ countries · 1,000+ systems deployed · X-Rite PANTONE partner',
    },
    capture: {
      kicker: 'Detailed estimate',
      h2: 'Get your detailed estimate by email',
      lead: 'Receive a breakdown of your potential savings — waste, makeready time, ink, paper and energy — straight in your inbox.',
      emailLabel: 'Email address',
      emailPlaceholder: 'name@company.com',
      companyLabel: 'Printing company',
      companyPlaceholder: 'Your company',
      button: 'Send me the estimate',
      note: 'No spam. We use your details only to send the estimate and follow up.',
      success: 'Thank you — your detailed estimate is on its way.',
      sending: 'Sending…',
      error: 'Something went wrong. Please try again, or email us directly.',
    },
    levers: {
      kicker: 'Levers',
      h2: 'Where the money is recovered',
      items: [
        { title: 'Makeready waste', body: 'Closed-loop hits the color target within a few sheets — fewer sheets lost at every start-up.' },
        { title: 'Makeready time', body: 'Shorter makereadies free up press time — you produce more in the same slot.' },
        { title: 'Ink, paper and energy', body: 'Less waste means directly less material and energy consumed on every job.' },
        { title: 'Consistency & reruns', body: 'Stable color from one shift and one rerun to the next, with no re-makeready.' },
      ],
    },
    method: {
      kicker: 'Methodology',
      h2: 'Where these figures come from',
      lead: 'The calculation rests on transparent assumptions you can adjust to your reality. No figure is inflated — these are the typical gains of a ColorLoop closed-loop workflow.',
      items: [
        { value: '225', unit: 'days / year', note: 'Annual production base, adjustable to your activity.' },
        { value: '−55 %', unit: 'makeready waste', note: 'Typical reduction from presetting and closed-loop.' },
        { value: '−38 %', unit: 'makeready time', note: 'Press-time gain observed on a ColorLoop workflow.' },
        { value: '€', unit: 'paper & press cost', note: 'Grammage, paper price and press hourly cost are configurable.' },
      ],
    },
    testimonial: {
      kicker: 'Testimonial',
      quote: '“On the press equipped with IntelliTrax, our average makeready waste dropped from 700–800 sheets per job (8 colors) to 450 — a good 40% less waste.”',
      author: 'Viappiani Printing — label printer, Milan',
      cta: 'Watch the testimonial',
    },
  },
  fr: {
    hero: {
      kicker: 'Estimateur ROI',
      h1: 'Combien ColorLoop peut faire économiser à votre atelier ?',
      lead: 'Estimez en moins d’une minute la gâche, le temps de calage et les coûts que vous pouvez récupérer sur vos presses offset — à partir de vos propres chiffres.',
      ctaCalc: 'Calculez vos économies',
      ctaConsole: 'Demander une validation console',
      trust: '25+ ans · 30+ pays · 1 000+ systèmes déployés · partenaire X-Rite PANTONE',
    },
    capture: {
      kicker: 'Estimation détaillée',
      h2: 'Recevez votre estimation détaillée par email',
      lead: 'Recevez le détail de vos économies potentielles — gâche, temps de calage, encre, papier et énergie — directement dans votre boîte mail.',
      emailLabel: 'Adresse email',
      emailPlaceholder: 'nom@entreprise.com',
      companyLabel: 'Imprimerie',
      companyPlaceholder: 'Votre société',
      button: 'Envoyez-moi l’estimation',
      note: 'Pas de spam. Vos coordonnées servent uniquement à envoyer l’estimation et à vous recontacter.',
      success: 'Merci — votre estimation détaillée arrive.',
      sending: 'Envoi…',
      error: 'Une erreur est survenue. Réessayez, ou écrivez-nous directement.',
    },
    levers: {
      kicker: 'Leviers',
      h2: 'Où l’argent est récupéré',
      items: [
        { title: 'Gâche au calage', body: 'Le closed-loop atteint la cible couleur en quelques feuilles : moins de feuilles perdues à chaque démarrage.' },
        { title: 'Temps de calage', body: 'Des calages plus courts libèrent du temps presse — vous produisez davantage sur le même créneau.' },
        { title: 'Encre, papier et énergie', body: 'Moins de gâche, c’est directement moins de matière et d’énergie consommées sur chaque travail.' },
        { title: 'Constance & relances', body: 'Une couleur stable d’une équipe et d’une relance à l’autre, sans re-calage.' },
      ],
    },
    method: {
      kicker: 'Méthodologie',
      h2: 'D’où viennent ces chiffres',
      lead: 'Le calcul s’appuie sur des hypothèses transparentes, ajustables à votre réalité. Aucun chiffre n’est gonflé : ce sont les gains typiques d’un workflow closed-loop ColorLoop.',
      items: [
        { value: '225', unit: 'jours / an', note: 'Base de production annuelle, ajustable à votre activité.' },
        { value: '−55 %', unit: 'gâche au calage', note: 'Réduction typique grâce au presetting et au closed-loop.' },
        { value: '−38 %', unit: 'temps de calage', note: 'Gain de temps presse observé sur un workflow ColorLoop.' },
        { value: '€', unit: 'papier & coût presse', note: 'Grammage, prix papier et coût horaire presse paramétrables.' },
      ],
    },
    testimonial: {
      kicker: 'Témoignage',
      quote: '« Sur la presse équipée de l’IntelliTrax, notre gâche moyenne de calage est passée de 700–800 feuilles par travail (8 couleurs) à 450 feuilles : 40 % de gâche en moins. »',
      author: 'Viappiani Printing — imprimeur d’étiquettes, Milan',
      cta: 'Voir le témoignage',
    },
  },
  de: {
    hero: {
      kicker: 'ROI-Rechner',
      h1: 'Wie viel kann ColorLoop in Ihrer Druckerei sparen?',
      lead: 'Schätzen Sie in unter einer Minute die Makulatur, die Einrichtungszeit und die Kosten, die Sie an Ihren Offset-Druckmaschinen einsparen können — anhand Ihrer eigenen Zahlen.',
      ctaCalc: 'Ersparnis berechnen',
      ctaConsole: 'Konsolenvalidierung anfragen',
      trust: '25+ Jahre · 30+ Länder · 1.000+ installierte Systeme · X-Rite PANTONE Partner',
    },
    capture: {
      kicker: 'Detaillierte Schätzung',
      h2: 'Erhalten Sie Ihre detaillierte Schätzung per E-Mail',
      lead: 'Erhalten Sie die Aufschlüsselung Ihrer möglichen Einsparungen — Makulatur, Einrichtungszeit, Farbe, Papier und Energie — direkt in Ihr Postfach.',
      emailLabel: 'E-Mail-Adresse',
      emailPlaceholder: 'name@firma.com',
      companyLabel: 'Druckerei',
      companyPlaceholder: 'Ihr Unternehmen',
      button: 'Schätzung zusenden',
      note: 'Kein Spam. Wir verwenden Ihre Daten nur, um die Schätzung zu senden und Sie zu kontaktieren.',
      success: 'Danke — Ihre detaillierte Schätzung ist unterwegs.',
      sending: 'Senden…',
      error: 'Etwas ist schiefgelaufen. Bitte erneut versuchen oder schreiben Sie uns direkt.',
    },
    levers: {
      kicker: 'Hebel',
      h2: 'Wo das Geld zurückgewonnen wird',
      items: [
        { title: 'Makulatur beim Einrichten', body: 'Closed-Loop erreicht das Farbziel in wenigen Bogen — weniger verlorene Bogen bei jedem Anlauf.' },
        { title: 'Einrichtungszeit', body: 'Kürzeres Einrichten schafft Maschinenzeit — Sie produzieren mehr im selben Zeitfenster.' },
        { title: 'Farbe, Papier und Energie', body: 'Weniger Makulatur bedeutet direkt weniger Material- und Energieverbrauch bei jedem Auftrag.' },
        { title: 'Farbkonstanz & Nachdrucke', body: 'Stabile Farbe von Schicht zu Schicht und von Nachdruck zu Nachdruck, ohne erneutes Einrichten.' },
      ],
    },
    method: {
      kicker: 'Methodik',
      h2: 'Woher diese Zahlen stammen',
      lead: 'Die Berechnung beruht auf transparenten Annahmen, die Sie an Ihre Realität anpassen können. Keine Zahl ist geschönt — es sind die typischen Gewinne eines ColorLoop-Closed-Loop-Workflows.',
      items: [
        { value: '225', unit: 'Tage / Jahr', note: 'Jährliche Produktionsbasis, an Ihre Tätigkeit anpassbar.' },
        { value: '−55 %', unit: 'Makulatur beim Einrichten', note: 'Typische Reduktion durch Presetting und Closed-Loop.' },
        { value: '−38 %', unit: 'Einrichtungszeit', note: 'Beobachteter Maschinenzeit-Gewinn in einem ColorLoop-Workflow.' },
        { value: '€', unit: 'Papier & Maschinenkosten', note: 'Grammatur, Papierpreis und Maschinenstundensatz konfigurierbar.' },
      ],
    },
    testimonial: {
      kicker: 'Referenz',
      quote: '„Auf der mit IntelliTrax ausgestatteten Druckmaschine ist unsere durchschnittliche Makulatur beim Einrichten von 700–800 Bogen pro Auftrag (8 Farben) auf 450 Bogen gesunken — gut 40 % weniger Makulatur."',
      author: 'Viappiani Printing — Etikettendruckerei, Mailand',
      cta: 'Testimonial ansehen',
    },
  },
  it: {
    hero: {
      kicker: 'Calcolatore ROI',
      h1: 'Quanto può far risparmiare ColorLoop al Suo reparto stampa?',
      lead: 'Stimi in meno di un minuto lo scarto, il tempo di avviamento e i costi che può recuperare sulle Sue macchine offset — a partire dai Suoi dati.',
      ctaCalc: 'Calcola il Suo risparmio',
      ctaConsole: 'Richiedi validazione console',
      trust: '25+ anni · 30+ paesi · 1.000+ sistemi installati · partner X-Rite PANTONE',
    },
    capture: {
      kicker: 'Stima dettagliata',
      h2: 'Riceva la Sua stima dettagliata via email',
      lead: 'Riceva il dettaglio dei Suoi risparmi potenziali — scarto, tempo di avviamento, inchiostro, carta ed energia — direttamente nella Sua casella.',
      emailLabel: 'Indirizzo email',
      emailPlaceholder: 'nome@azienda.com',
      companyLabel: 'Stamperia',
      companyPlaceholder: 'La Sua azienda',
      button: 'Inviami la stima',
      note: 'Niente spam. Usiamo i Suoi dati solo per inviare la stima e ricontattarLa.',
      success: 'Grazie — la Sua stima dettagliata è in arrivo.',
      sending: 'Invio…',
      error: 'Si è verificato un errore. Riprovi, oppure ci scriva direttamente.',
    },
    levers: {
      kicker: 'Leve',
      h2: 'Dove si recupera il denaro',
      items: [
        { title: 'Scarto di avviamento', body: 'Il closed-loop raggiunge il target colore in pochi fogli: meno fogli persi a ogni avvio.' },
        { title: 'Tempo di avviamento', body: 'Avviamenti più brevi liberano tempo macchina — produce di più nello stesso turno.' },
        { title: 'Inchiostro, carta ed energia', body: 'Meno scarto significa direttamente meno materiale ed energia consumati su ogni lavoro.' },
        { title: 'Consistenza & ristampe', body: 'Colore stabile da un turno e da una ristampa all’altra, senza nuovo avviamento.' },
      ],
    },
    method: {
      kicker: 'Metodologia',
      h2: 'Da dove vengono questi numeri',
      lead: 'Il calcolo si basa su ipotesi trasparenti, regolabili sulla Sua realtà. Nessun numero è gonfiato: sono i guadagni tipici di un workflow closed-loop ColorLoop.',
      items: [
        { value: '225', unit: 'giorni / anno', note: 'Base di produzione annua, regolabile sulla Sua attività.' },
        { value: '−55 %', unit: 'scarto di avviamento', note: 'Riduzione tipica grazie al presetting e al closed-loop.' },
        { value: '−38 %', unit: 'tempo di avviamento', note: 'Guadagno di tempo macchina osservato su un workflow ColorLoop.' },
        { value: '€', unit: 'carta & costo macchina', note: 'Grammatura, prezzo carta e costo orario macchina configurabili.' },
      ],
    },
    testimonial: {
      kicker: 'Testimonianza',
      quote: '« Sulla macchina da stampa dotata di IntelliTrax, lo scarto medio di avviamento è passato da 700–800 fogli per lavoro (8 colori) a 450 fogli: ben il 40 % di scarto in meno. »',
      author: 'Viappiani Printing — stampatore di etichette, Milano',
      cta: 'Guarda il video',
    },
  },
  es: {
    hero: {
      kicker: 'Calculadora ROI',
      h1: '¿Cuánto puede ahorrar ColorLoop en su sala de prensa?',
      lead: 'Estime en menos de un minuto el desperdicio, el tiempo de puesta a punto y los costes que puede recuperar en sus prensas offset — a partir de sus propias cifras.',
      ctaCalc: 'Calcule su ahorro',
      ctaConsole: 'Solicitar validación de consola',
      trust: '25+ años · 30+ países · 1.000+ sistemas instalados · partner X-Rite PANTONE',
    },
    capture: {
      kicker: 'Estimación detallada',
      h2: 'Reciba su estimación detallada por email',
      lead: 'Reciba el desglose de su ahorro potencial — desperdicio, tiempo de puesta a punto, tinta, papel y energía — directamente en su bandeja de entrada.',
      emailLabel: 'Dirección de email',
      emailPlaceholder: 'nombre@empresa.com',
      companyLabel: 'Imprenta',
      companyPlaceholder: 'Su empresa',
      button: 'Envíenme la estimación',
      note: 'Sin spam. Usamos sus datos solo para enviar la estimación y volver a contactarle.',
      success: 'Gracias — su estimación detallada está en camino.',
      sending: 'Enviando…',
      error: 'Algo salió mal. Inténtelo de nuevo o escríbanos directamente.',
    },
    levers: {
      kicker: 'Palancas',
      h2: 'Dónde se recupera el dinero',
      items: [
        { title: 'Desperdicio de puesta a punto', body: 'El closed-loop alcanza el objetivo de color en pocas hojas: menos hojas perdidas en cada arranque.' },
        { title: 'Tiempo de puesta a punto', body: 'Puestas a punto más cortas liberan tiempo de prensa — produce más en la misma franja.' },
        { title: 'Tinta, papel y energía', body: 'Menos desperdicio significa directamente menos material y energía consumidos en cada trabajo.' },
        { title: 'Consistencia y reimpresiones', body: 'Color estable de un turno y una reimpresión a otra, sin nueva puesta a punto.' },
      ],
    },
    method: {
      kicker: 'Metodología',
      h2: 'De dónde vienen estas cifras',
      lead: 'El cálculo se basa en hipótesis transparentes, ajustables a su realidad. Ninguna cifra está inflada: son las ganancias típicas de un flujo de trabajo closed-loop ColorLoop.',
      items: [
        { value: '225', unit: 'días / año', note: 'Base de producción anual, ajustable a su actividad.' },
        { value: '−55 %', unit: 'desperdicio de puesta a punto', note: 'Reducción típica gracias al presetting y al closed-loop.' },
        { value: '−38 %', unit: 'tiempo de puesta a punto', note: 'Ganancia de tiempo de prensa observada en un flujo ColorLoop.' },
        { value: '€', unit: 'papel y coste de prensa', note: 'Gramaje, precio del papel y coste por hora de prensa configurables.' },
      ],
    },
    testimonial: {
      kicker: 'Testimonio',
      quote: '« En la prensa equipada con IntelliTrax, nuestro desperdicio medio de puesta a punto pasó de 700–800 pliegos por trabajo (8 colores) a 450: un 40 % menos de desperdicio. »',
      author: 'Viappiani Printing — impresor de etiquetas, Milán',
      cta: 'Ver testimonio',
    },
  },
  pt: {
    hero: {
      kicker: 'Estimador de ROI',
      h1: 'Quanto é que o ColorLoop poderia poupar à sua gráfica?',
      lead: 'Em menos de um minuto, estime a maculatura, o tempo de acerto e os custos que pode recuperar nas suas máquinas offset, a partir dos seus próprios números.',
      ctaCalc: 'Calcule a sua poupança',
      ctaConsole: 'Solicitar uma validação de consola',
      trust: '25+ anos · 30+ países · 1.000+ sistemas implementados · parceiro X-Rite PANTONE',
    },
    capture: {
      kicker: 'Estimativa detalhada',
      h2: 'Receba a sua estimativa detalhada por email',
      lead: 'Receba o detalhe da sua poupança potencial (maculatura, tempo de acerto, tinta, papel e energia) diretamente na sua caixa de entrada.',
      emailLabel: 'Endereço de email',
      emailPlaceholder: 'nome@empresa.com',
      companyLabel: 'Impressor',
      companyPlaceholder: 'A sua empresa',
      button: 'Enviem-me a estimativa',
      note: 'Sem spam. Usamos os seus dados apenas para enviar a estimativa e dar seguimento.',
      success: 'Obrigado, a sua estimativa detalhada está a caminho.',
      sending: 'A enviar…',
      error: 'Ocorreu um erro. Tente novamente ou escreva-nos diretamente.',
    },
    levers: {
      kicker: 'Alavancas',
      h2: 'Onde o dinheiro é recuperado',
      items: [
        { title: 'Maculatura de acerto', body: 'O closed-loop atinge a cor alvo em poucas folhas, menos folhas perdidas em cada arranque.' },
        { title: 'Tempo de acerto', body: 'Acertos mais curtos libertam tempo de máquina, produz mais no mesmo período.' },
        { title: 'Tinta, papel e energia', body: 'Menos maculatura significa diretamente menos material e energia consumidos em cada trabalho.' },
        { title: 'Consistência e relances', body: 'Cor estável de um turno e de um relance para o seguinte, sem novo acerto.' },
      ],
    },
    method: {
      kicker: 'Metodologia',
      h2: 'De onde vêm estes números',
      lead: 'O cálculo assenta em pressupostos transparentes que pode ajustar à sua realidade. Nenhum número é inflacionado, são os ganhos típicos de um workflow closed-loop ColorLoop.',
      items: [
        { value: '225', unit: 'dias / ano', note: 'Base de produção anual, ajustável à sua atividade.' },
        { value: '−55 %', unit: 'maculatura de acerto', note: 'Redução típica graças ao presetting e ao closed-loop.' },
        { value: '−38 %', unit: 'tempo de acerto', note: 'Ganho de tempo de máquina observado num workflow ColorLoop.' },
        { value: '€', unit: 'papel e custo de máquina', note: 'Gramagem, preço do papel e custo horário da máquina são configuráveis.' },
      ],
    },
    testimonial: {
      kicker: 'Testemunho',
      quote: '« Na máquina equipada com IntelliTrax, a nossa maculatura média de acerto passou de 700 a 800 folhas por trabalho (8 cores) para 450 folhas, uns bons 40 % menos de maculatura. »',
      author: 'Viappiani Printing, impressor de etiquetas, Milão',
      cta: 'Ver o testemunho',
    },
  },
};

export function RoiPage() {
  const { locale } = useLanguage();
  const t = COPY[locale];
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get('email') ?? '').trim();
    const company = String(data.get('company') ?? '').trim();
    setStatus('sending');
    try {
      const res = await fetch('/api/roi-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, company }),
      });
      if (!res.ok) throw new Error('request failed');
      setStatus('sent');
      window.gtag?.('event', 'roi_lead_submit', { method: 'roi_calculator' });
    } catch {
      setStatus('error');
    }
  };

  return (
    <main className="page-shell roi-page">
      <SiteNav current="roi" />

      <section className="section roi-page-hero">
        <div className="container roi-page-hero-inner">
          <p className="section-kicker">{t.hero.kicker}</p>
          <h1>{t.hero.h1}</h1>
          <p className="roi-page-hero-lead">{t.hero.lead}</p>
          <div className="roi-page-hero-cta">
            <a className="button button-dark" href="#roi">
              {t.hero.ctaCalc} →
            </a>
            <a className="button button-outline-dark" href="/console-validation">
              {t.hero.ctaConsole}
            </a>
          </div>
          <p className="roi-page-hero-trust">{t.hero.trust}</p>
        </div>
      </section>

      <section className="section roi-page-calc">
        <div className="container">
          <ColorLoopROI />
        </div>
      </section>

      <section className="section roi-page-capture">
        <div className="container roi-page-capture-inner">
          <p className="section-kicker">{t.capture.kicker}</p>
          <h2>{t.capture.h2}</h2>
          <p className="roi-page-capture-lead">{t.capture.lead}</p>
          {status === 'sent' ? (
            <p className="roi-page-capture-success">{t.capture.success}</p>
          ) : (
            <form className="roi-page-capture-form" onSubmit={handleSubmit}>
              <label className="roi-page-capture-field">
                <span>{t.capture.emailLabel}</span>
                <input type="email" name="email" placeholder={t.capture.emailPlaceholder} required />
              </label>
              <label className="roi-page-capture-field">
                <span>{t.capture.companyLabel}</span>
                <input type="text" name="company" placeholder={t.capture.companyPlaceholder} required />
              </label>
              <button type="submit" className="button button-light" disabled={status === 'sending'}>
                {status === 'sending' ? t.capture.sending : t.capture.button}
              </button>
              {status === 'error' ? (
                <p className="roi-page-capture-error">{t.capture.error}</p>
              ) : null}
            </form>
          )}
          <p className="roi-page-capture-note">{t.capture.note}</p>
        </div>
      </section>

      <section className="section roi-page-levers">
        <div className="container">
          <p className="section-kicker">{t.levers.kicker}</p>
          <h2>{t.levers.h2}</h2>
          <div className="roi-page-levers-grid">
            {t.levers.items.map((lever) => (
              <article key={lever.title} className="roi-page-lever-card">
                <h3>{lever.title}</h3>
                <p>{lever.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section roi-page-method">
        <div className="container">
          <p className="section-kicker">{t.method.kicker}</p>
          <h2>{t.method.h2}</h2>
          <p className="roi-page-method-lead">{t.method.lead}</p>
          <div className="roi-page-method-grid">
            {t.method.items.map((item) => (
              <div key={item.unit} className="roi-page-method-item">
                <span className="roi-page-method-value">{item.value}</span>
                <span className="roi-page-method-unit">{item.unit}</span>
                <span className="roi-page-method-note">{item.note}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CaseStudiesShowcase />

      <section className="section roi-page-testimonial">
        <div className="container roi-page-testimonial-inner">
          <p className="section-kicker">{t.testimonial.kicker}</p>
          <blockquote className="roi-page-testimonial-quote">{t.testimonial.quote}</blockquote>
          <p className="roi-page-testimonial-author">{t.testimonial.author}</p>
          <a
            className="roi-page-testimonial-cta"
            href={TESTIMONIAL_VIDEO}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t.testimonial.cta} →
          </a>
        </div>
      </section>

      <ConsoleValidationCTA />

      <SiteFooter />
    </main>
  );
}
