import { ConsoleValidationPage } from '@/components/console-validation-page';

const FAQ = [
  {
    q: 'What is a console validation?',
    a: 'It is the free eligibility check for Rutherford closed-loop color. You send a few photos of your press console; Rutherford confirms within one business day whether your press qualifies and what the next step looks like.',
  },
  {
    q: 'Is the console validation really free?',
    a: 'Yes. It takes about two minutes, costs nothing and commits you to nothing. It simply tells you whether your console can run closed-loop color control.',
  },
  {
    q: 'Which press brands are compatible?',
    a: 'Rutherford ColorLoop is press-agnostic. Compatible console families include Heidelberg, Komori, Koenig & Bauer, Manroland, Mitsubishi, Ryobi, Goss and Presstek. The validation confirms your exact model and generation.',
  },
  {
    q: 'What happens after I submit the form?',
    a: 'Our team reviews your photos and comes back within one business day with your press eligibility, either for Rutherford ColorLoop on your existing measurement setup or for the complete X-Rite Offset360 bundle.',
  },
];

const FAQ_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
};

export default function ConsoleValidationRoute() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }} />
      <ConsoleValidationPage faq={FAQ} />
    </>
  );
}
