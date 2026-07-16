// ColorLoop product FAQ, migrated from the colorloop.ai WordPress site.
// Shared by the /colorloop page (visible accordion) and its FAQPage JSON-LD.
// GEO rule: every answer is self-contained and names the product.

export type ColorLoopFaq = { q: string; a: string };

export const COLORLOOP_FAQ: ColorLoopFaq[] = [
  {
    q: 'Can I buy ColorLoop alone?',
    a: 'ColorLoop requires IntelliTrax2 hardware and MeasureColor software. If you already have these, you can buy ColorLoop standalone. If not, the Offset360 ColorLoop bundle brings the full stack in one deployment.',
  },
  {
    q: 'How long does implementation take?',
    a: 'For existing Rutherford customers on Standalone or Upgrade, activation is instant: you can start using ColorLoop right away. For new customers, the software activates as soon as the hardware is installed by certified technicians, and the press is production-ready the same day. No complex integration, no lengthy configuration.',
  },
  {
    q: 'What is the difference between ColorLoop Standard and ColorLoop Pack?',
    a: 'ColorLoop Pack is built for packaging printers, with PANTONE fine-tuning, opaque white control and ECG optimization. ColorLoop Standard is made for commercial CMYK work. Both versions share the same core automation features.',
  },
  {
    q: 'What are the subscription terms?',
    a: 'ColorLoop is a year-by-year subscription with no multi-year lock-in. After the first year, you can cancel anytime with 30 days notice.',
  },
  {
    q: 'I have EasySet-EasyLoop or IntelliSet-IntelliLoop. Why should I upgrade?',
    a: 'ColorLoop Upgrade lets you keep your existing hardware and adds automatic IntelliTrax and MeasureColor integration, autosetup, adaptive corrections, a modern interface and native Windows 11 performance, without reinstalling.',
  },
  {
    q: 'What training is required?',
    a: 'For existing X-Rite users, very little: ColorLoop adds to your current workflow, video tutorials and documentation are included, and most operators learn it in hours. Teams new to the X-Rite ecosystem can take the full training covering IntelliTrax, MeasureColor and ColorLoop together.',
  },
  {
    q: 'Does ColorLoop work with my press brand?',
    a: 'Yes. ColorLoop works with virtually all offset sheetfed presses through IntelliTrax2, from 30-year-old machines to current models: Heidelberg, Koenig & Bauer, Komori, Manroland, Ryobi, Mitsubishi and more. The free console validation confirms your specific console in about two minutes.',
  },
  {
    q: 'What is included in the subscription?',
    a: 'The ColorLoop software license, all updates and technical support. With the Offset360 bundle, an annual service care visit is included as well.',
  },
];
