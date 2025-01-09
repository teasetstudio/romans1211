import { Text, Song, Game, Wtag, Organization } from '@prisma/client';

export type TMaterialType = 'text' | 'song' | 'game';

export type TMaterial = Text | Song | Game;

export type TMaterialObjectType = {
  type: TMaterialType;
};

export type TMaterialsIncluded = {
  organization: Organization;
  tags: Array<Wtag>;
};

export type TMaterialWithIncluded = TMaterial & TMaterialsIncluded;

export type TCatalogMaterial = TMaterialWithIncluded & TMaterialObjectType;

export type TMaterialWithType = TMaterial & TMaterialObjectType;