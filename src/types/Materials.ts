import { Text, Song, Game, Wtag, Organization } from '@prisma/client';

export type TMaterialType = 'text' | 'song' | 'game';

export type TMaterial = Text | Song | Game;

export type TMaterialWithIncluded = TMaterial & {
  organization: Organization;
  tags: Array<Wtag>;
};

export type TCatalogMaterial = TMaterialWithIncluded & {
  type: TMaterialType;
};
