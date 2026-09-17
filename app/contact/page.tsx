import type { Metadata } from 'next';
import { SEO_COPY, localizedMetadata } from '@/lib/seo';
import { ContactPage } from '@/components/contact-page';

export function generateMetadata(): Metadata {
  return localizedMetadata({
    path: '/contact',
    title: SEO_COPY.contact.title,
    description: SEO_COPY.contact.description,
  });
}

export default function ContactRoute() {
  return <ContactPage />;
}
