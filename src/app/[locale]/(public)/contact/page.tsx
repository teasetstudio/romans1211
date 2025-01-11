import { useTranslations } from 'next-intl';
import { NAMESPACE_CONTACT } from '@/res/namespaces';
import { IconInstagram, IconGlobe, IconMapPin, IconEmail } from '@/res/icons';
import Link from 'next/link';

// Generate static pages for default locale (en) and ru locale
export function generateStaticParams() {
  return [
    // This will generate / and /en (they are the same)
    { locale: 'en' },
    // This will generate /ru
    { locale: 'ru' },
  ];
}

export default function ContactPage() {
  const t = useTranslations(NAMESPACE_CONTACT);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">{t('title')}</h1>

      <div className="max-w-2xl space-y-8">
        <div className="space-y-6">
          

          <div>
            <h3 className="font-medium mb-3">{t('email_us')}</h3>
            <a 
              href="mailto:one.christian.lib@gmail.com"
              className="text-primary hover:underline inline-flex items-center gap-2"
            >
              <IconEmail className="w-5 h-5" />
              one.christian.lib@gmail.com
            </a>
          </div>

          <div>
            <h3 className="font-medium mb-3">{t('our_church')}</h3>
            <div className="space-y-2">
              <Link 
                href="https://www.instagram.com/malones.baptistu" 
                target="_blank"
                className="text-primary hover:underline inline-flex items-center gap-2"
              >
                <IconInstagram className="w-5 h-5" />
                Instagram
              </Link>

              <div>
                <Link 
                  href="https://church.lt" 
                  target="_blank"
                  className="text-primary hover:underline inline-flex items-center gap-2"
                >
                  <IconGlobe className="w-5 h-5" />
                  church.lt
                </Link>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-3">{t('address')}</h3>
            <p className="text-gray-600 mb-2">Verkių 22<br />08219, Vilnius, Lithuania</p>
            <Link 
              href="https://maps.app.goo.gl/iJgA7jRkvfgG5QtB7" 
              target="_blank"
              className="text-primary hover:underline inline-flex items-center gap-2"
            >
              <IconMapPin className="w-5 h-5" />
              Google Map
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
