// Plain data module (no 'use client') so it can be used by BOTH the client
// Offset360Page component (visible FAQ) and the server route (FAQPage JSON-LD).
import type { Locale } from '@/components/language-provider';

export type Offset360Faq = { q: string; a: string };

export const OFFSET360_FAQ_BY_LOCALE: Record<Locale, Offset360Faq[]> = {
  en: [
    {
      q: 'What is Offset360?',
      a: 'Offset360 is the X-Rite and Rutherford closed-loop color bundle for sheetfed offset. It pairs IntelliTrax2 scanning, MeasureColor process control and Rutherford ColorLoop closed-loop correction into one press-side workflow.',
    },
    {
      q: 'How is Offset360 different from buying a new press?',
      a: 'Offset360 adds connected, press-side color measurement and automatic ink-key correction to the press you already own. You get closed-loop color without a new press, at a fraction of the cost.',
    },
    {
      q: 'Does Offset360 work with any press brand?',
      a: 'Yes. Offset360 is open by design and works with any press brand and any workflow, with no vendor lock-in and no rip-and-replace.',
    },
    {
      q: 'What does Offset360 include?',
      a: 'IntelliTrax2 scanning, MeasureColor reporting and Rutherford ColorLoop closed-loop control, deployed and supported as a single integrated solution.',
    },
    {
      q: 'How much does Offset360 cost?',
      a: 'Offset360 has a lower initial cost than a new measurement setup and is available through flexible financing. Request a free console-validation to get pricing for your specific press.',
    },
  ],
  fr: [
    {
      q: 'Qu’est-ce qu’Offset360 ?',
      a: 'Offset360 est le bundle couleur closed-loop de X-Rite et Rutherford pour l’offset feuille à feuille. Il associe la lecture IntelliTrax2, le contrôle du process MeasureColor et la correction closed-loop Rutherford ColorLoop dans un seul workflow au pied de la presse.',
    },
    {
      q: 'En quoi Offset360 diffère-t-il de l’achat d’une nouvelle presse ?',
      a: 'Offset360 ajoute à la presse que vous possédez déjà une mesure couleur connectée au pied de la presse et une correction automatique des clés d’encrage. Vous obtenez le closed-loop sans nouvelle presse, pour une fraction du coût.',
    },
    {
      q: 'Offset360 fonctionne-t-il avec toutes les marques de presses ?',
      a: 'Oui. Offset360 est ouvert par conception et fonctionne avec toutes les marques de presses et tous les workflows, sans dépendance fournisseur et sans tout remplacer.',
    },
    {
      q: 'Que comprend Offset360 ?',
      a: 'La lecture IntelliTrax2, le reporting MeasureColor et le contrôle closed-loop Rutherford ColorLoop, déployés et accompagnés comme une seule solution intégrée.',
    },
    {
      q: 'Combien coûte Offset360 ?',
      a: 'Offset360 a un coût initial inférieur à celui d’un nouveau système de mesure et bénéficie d’un financement flexible. Demandez une validation console gratuite pour obtenir un prix adapté à votre presse.',
    },
  ],
  de: [
    {
      q: 'Was ist Offset360?',
      a: 'Offset360 ist das Closed-Loop-Farbpaket von X-Rite und Rutherford für den Bogenoffset. Es verbindet IntelliTrax2-Messung, MeasureColor-Prozesskontrolle und die Closed-Loop-Korrektur von Rutherford ColorLoop in einem Workflow direkt an der Druckmaschine.',
    },
    {
      q: 'Worin unterscheidet sich Offset360 vom Kauf einer neuen Druckmaschine?',
      a: 'Offset360 ergänzt Ihre vorhandene Druckmaschine um vernetzte Farbmessung und automatische Farbzonen-Korrektur. Sie erhalten Closed-Loop-Farbsteuerung ohne neue Druckmaschine, zu einem Bruchteil der Kosten.',
    },
    {
      q: 'Funktioniert Offset360 mit jedem Maschinenfabrikat?',
      a: 'Ja. Offset360 ist offen konzipiert und funktioniert mit jedem Maschinenfabrikat und jedem Workflow, ohne Herstellerbindung und ohne Komplettaustausch.',
    },
    {
      q: 'Was enthält Offset360?',
      a: 'IntelliTrax2-Messung, MeasureColor-Reporting und Rutherford ColorLoop Closed-Loop-Steuerung, bereitgestellt und betreut als eine integrierte Lösung.',
    },
    {
      q: 'Was kostet Offset360?',
      a: 'Offset360 hat geringere Anfangskosten als ein neues Messsystem und ist über flexible Finanzierung verfügbar. Fragen Sie eine kostenlose Konsolenvalidierung an, um einen Preis für Ihre Druckmaschine zu erhalten.',
    },
  ],
  it: [
    {
      q: 'Che cos’è Offset360?',
      a: 'Offset360 è il bundle colore closed-loop di X-Rite e Rutherford per l’offset foglio. Unisce la lettura IntelliTrax2, il controllo di processo MeasureColor e la correzione closed-loop Rutherford ColorLoop in un unico workflow a bordo macchina.',
    },
    {
      q: 'In cosa differisce Offset360 dall’acquisto di una nuova macchina da stampa?',
      a: 'Offset360 aggiunge alla macchina che già possedete una misura colore connessa a bordo macchina e la correzione automatica delle chiavi di inchiostro. Ottenete il closed-loop senza una nuova macchina, a una frazione del costo.',
    },
    {
      q: 'Offset360 funziona con qualsiasi marca di macchina?',
      a: 'Sì. Offset360 è aperto per progettazione e funziona con qualsiasi marca di macchina e qualsiasi workflow, senza vincoli di fornitore e senza sostituire tutto.',
    },
    {
      q: 'Cosa include Offset360?',
      a: 'La lettura IntelliTrax2, il reporting MeasureColor e il controllo closed-loop Rutherford ColorLoop, implementati e supportati come un’unica soluzione integrata.',
    },
    {
      q: 'Quanto costa Offset360?',
      a: 'Offset360 ha un costo iniziale inferiore a un nuovo sistema di misura ed è disponibile con finanziamento flessibile. Richiedete una validazione console gratuita per ottenere un prezzo per la vostra macchina.',
    },
  ],
  es: [
    {
      q: '¿Qué es Offset360?',
      a: 'Offset360 es el bundle de color closed-loop de X-Rite y Rutherford para offset pliego. Combina la lectura IntelliTrax2, el control de proceso MeasureColor y la corrección closed-loop de Rutherford ColorLoop en un único workflow junto a la prensa.',
    },
    {
      q: '¿En qué se diferencia Offset360 de comprar una prensa nueva?',
      a: 'Offset360 añade a la prensa que ya posee una medición de color conectada junto a la prensa y la corrección automática de llaves de tinta. Obtiene el closed-loop sin una prensa nueva, por una fracción del coste.',
    },
    {
      q: '¿Funciona Offset360 con cualquier marca de prensa?',
      a: 'Sí. Offset360 es abierto por diseño y funciona con cualquier marca de prensa y cualquier workflow, sin dependencia del proveedor y sin sustituirlo todo.',
    },
    {
      q: '¿Qué incluye Offset360?',
      a: 'La lectura IntelliTrax2, los informes MeasureColor y el control closed-loop Rutherford ColorLoop, desplegados y soportados como una única solución integrada.',
    },
    {
      q: '¿Cuánto cuesta Offset360?',
      a: 'Offset360 tiene un coste inicial inferior a un nuevo sistema de medición y está disponible con financiación flexible. Solicite una validación de consola gratuita para obtener un precio para su prensa.',
    },
  ],
  pt: [
    {
      q: 'O que é o Offset360?',
      a: 'O Offset360 é o bundle de cor closed-loop da X-Rite e da Rutherford para offset de folhas. Combina a leitura IntelliTrax2, o controlo de processo MeasureColor e a correção closed-loop do Rutherford ColorLoop num único workflow junto à máquina.',
    },
    {
      q: 'Em que difere o Offset360 de comprar uma máquina nova?',
      a: 'O Offset360 acrescenta à máquina que já possui uma medição de cor ligada junto à máquina e a correção automática das zonas de tinta. Obtém o closed-loop sem uma máquina nova, por uma fração do custo.',
    },
    {
      q: 'O Offset360 funciona com qualquer marca de máquina?',
      a: 'Sim. O Offset360 é aberto por conceção e funciona com qualquer marca de máquina e qualquer workflow, sem dependência de fornecedor e sem substituir tudo.',
    },
    {
      q: 'O que inclui o Offset360?',
      a: 'A leitura IntelliTrax2, os relatórios MeasureColor e o controlo closed-loop Rutherford ColorLoop, implementados e acompanhados como uma única solução integrada.',
    },
    {
      q: 'Quanto custa o Offset360?',
      a: 'O Offset360 tem um custo inicial inferior a um novo sistema de medição e está disponível com financiamento flexível. Peça uma validação de consola gratuita para obter um preço para a sua máquina.',
    },
  ],
};

// English list kept as the default export shape used by existing imports.
export const OFFSET360_FAQ: Offset360Faq[] = OFFSET360_FAQ_BY_LOCALE.en;
