"use server"

import { getTranslations } from 'next-intl/server';
import TopBanner from '@/components/banners/TopBanner';
import { ROUTE_LIBRARY } from '@/res/routes';
import SongsBanner from '@/components/banners/SongsBanner';
import { NAMESPACE_HOME } from '@/res/namespaces';
import MaterialTypesBanner from '@/components/banners/MaterialTypesBanner';
import { materialService } from '@/lib/MaterialServiceForSSR';

import faqs from '@/assets/data/mocked-faq.json'
import FAQ from '@/components/ui/FAQ';
import { TMaterialType } from '@/types/Materials';
import GameWidget from '@/components/widgets/GameWidget';
import TextWidget from '@/components/widgets/TextWidget';
import { ICard } from '@/components/CardGrid/Card';
import SongWidget from '@/components/widgets/SongWidget';
import { _transformMaterialToCard } from '@/utils/transformers';

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

      <SongWidget
        className="mt-6 md:mt-12 mb-8 md:mb-16"
        title={t('songs')}
        songs={songs}
        viewAllRoute={ROUTE_LIBRARY}
      />

      <SongsBanner />

      <GameWidget
        className="my-10 md:my-16"
        title={t('games')}
        games={games}
        viewAllRoute={ROUTE_LIBRARY}
      />

      <MaterialTypesBanner />

      <TextWidget
        className="my-10 md:my-16"
        title={t('texts')}
        texts={texts}
        viewAllRoute={ROUTE_LIBRARY}
      />

      <FAQ className="mt-16 md:mt-24" faqs={faqs} />
    </>
  );
}
