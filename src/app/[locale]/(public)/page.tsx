"use server"

import { getTranslations } from 'next-intl/server';
import TopBanner from '@/components/banners/TopBanner';
import { ROUTE_LIBRARY } from '@/res/routes';
import SongsBanner from '@/components/banners/SongsBanner';
import { NAMESPACE_HOME } from '@/res/namespaces';
import MaterialTypesBanner from '@/components/banners/MaterialTypesBanner';
import { materialService } from '@/lib/MaterialServiceForSSR';

import faqs from '@/assets/data/mocked-faq.json'
import FAQ from '@/components/widgets/ui/FAQ';
import { TMaterialType } from '@/types/Materials';
import { ICard } from '@/components/CardGrid/Card';
import { _transformMaterialToCard } from '@/utils/transformers';
import CardWidget from '@/components/widgets/CardWidget';

async function getPublicMaterials(type: TMaterialType):Promise<ICard[]> {
  const materials = await materialService.findPublic(type);
  return materials.map(material => _transformMaterialToCard(material, type));
}

export default async function Home() {
  const [t, songs, texts, games] = await Promise.all([
    getTranslations(NAMESPACE_HOME),
    getPublicMaterials('song'),
    getPublicMaterials('text'),
    getPublicMaterials('game')
  ]);

  return (
    <>
      <TopBanner className="md:mt-12" />

      <CardWidget
        className="mt-6 md:mt-12 mb-8 md:mb-16"
        title={t('songs')}
        cards={songs}
        viewAllRoute={ROUTE_LIBRARY}
      />

      <SongsBanner />

      <CardWidget
        className="mt-6 md:mt-12 mb-8 md:mb-16"
        title={t('games')}
        cards={games}
        viewAllRoute={ROUTE_LIBRARY}
      />

      <MaterialTypesBanner />

      <CardWidget
        className="mt-6 md:mt-12 mb-8 md:mb-16"
        title={t('texts')}
        cards={texts}
        viewAllRoute={ROUTE_LIBRARY}
      />

      <FAQ faqs={faqs} />
    </>
  );
}
