"use server"

import { getTranslations } from 'next-intl/server';
import TopBanner from '@/components/banners/TopBanner';
import { ROUTE_LIBRARY } from '@/res/routes';
import SongWidget from '@/components/widgets/SongWidget';
import SongsBanner from '@/components/banners/SongsBanner';
import { NAMESPACE_HOME } from '@/res/namespaces';
import MaterialTypesBanner from '@/components/banners/MaterialTypesBanner';
import { materialService } from '@/lib/MaterialServiceForSSR';

import faqs from '@/assets/data/mocked-faq.json'
import FAQ from '@/components/ui/FAQ';
import { MaterialTypes } from '@/types/IMaterial';
import GameWidget from '@/components/widgets/GameWidget';
import TextWidget from '@/components/widgets/TextWidget';

async function getPublicMaterials(type: MaterialTypes) {
  const materials = await materialService.findPublic(type);
  
  const imageUrl = {
    song: '/images/music_placeholder.png',
    text: '/images/text_placeholder.png',
    game: '/images/game_placeholder.png',
  };

  return materials.map(material => ({
    id: material.id,
    title: material.title,
    content: material.content,
    imageUrl: imageUrl[type],
    link: `${ROUTE_LIBRARY}/${type}/${material.id}`,
    metadata: {
      organization: material.organization.name,
      date: material.createdAt.toISOString(),
    },
    tags: material.tags
  }));
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
