import { Text, Song, Game, Wtag, Organization, GamePreparation } from '@prisma/client';

export type TMaterialType = 'text' | 'song' | 'game';

export type TMaterial = Text | Song | Game;

export type TMaterialObjectType = { type: TMaterialType };

export type TMaterialsIncludedOrganization = { organization?: Organization };
export type TMaterialsIncludedTags = { tags?: Array<Wtag> };

export type TMaterialsIncluded = {
  organization: Organization;
  tags: Array<Wtag>;
  preparations?: Array<GamePreparation>;
  original: TMaterial & { translations: Array<TMaterial> } | null;
  translations: Array<TMaterial>;
};

export type TMaterialWithType = TMaterial & TMaterialObjectType & { preparations?: Array<GamePreparation> };

export type TMaterialWithIncluded = TMaterial & TMaterialsIncluded;
export type TCatalogMaterial = TMaterialWithType & TMaterialsIncluded;

export type TMaterial_Tags_Org = TMaterial & Required<TMaterialsIncludedOrganization & TMaterialsIncludedTags>;
