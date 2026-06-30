// Plain data module (no 'use client') so it can be used by BOTH the client
// Offset360Page component (visible FAQ) and the server route (FAQPage JSON-LD).
export const OFFSET360_FAQ: { q: string; a: string }[] = [
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
];
