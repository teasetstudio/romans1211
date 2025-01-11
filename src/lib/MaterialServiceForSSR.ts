import { Prisma } from '@prisma/client';
import prisma from './prisma';
import { TMaterialType, TMaterial, TMaterialWithIncluded, TCatalogMaterial, TMaterialWithType } from '@/types/Materials';

type PrismaClientDelegate = Prisma.TextDelegate | Prisma.SongDelegate | Prisma.GameDelegate

class MaterialServiceForSSR {
  private validateType(type: string | string[] | undefined): TMaterialType | TMaterialType[] | undefined {
    if (!type) return undefined;
    
    const validTypes: TMaterialType[] = ['text', 'song', 'game'];
    
    if (Array.isArray(type)) {
      const validatedTypes = type.filter(t => validTypes.includes(t as TMaterialType));
      return validatedTypes.length > 0 ? validatedTypes as TMaterialType[] : undefined;
    }
    
    return validTypes.includes(type as TMaterialType) ? type as TMaterialType : undefined;
  }

  private getModel(type: TMaterialType): PrismaClientDelegate | any {
    switch (type) {
      case 'text':
        return prisma.text;
      case 'song':
        return prisma.song;
      case 'game':
        return prisma.game;
      default:
        throw new Error('Invalid material type');
    }
  }

  async findById(type: TMaterialType, id: string): Promise<TMaterial | null> {
    return this.getModel(type).findUnique({
      where: { id },
      include: { tags: true, organization: true },
    });
  }

  async findPublicById(type: TMaterialType, id: string): Promise<TMaterialWithIncluded | null> {
    return this.getModel(type).findUnique({
      where: { id, isPublic: true },
      include: { tags: true, organization: true },
    });
  }

  async findByTitle(type: TMaterialType, title: string): Promise<TCatalogMaterial[]> {
    return this.getModel(type).findMany({
      where: {
        title: { contains: title, mode: 'insensitive' },
      },
      include: { tags: true, organization: true },
    });
  }

  async findByOrganization(type: TMaterialType, organizationId: string): Promise<TMaterial[]> {
    return this.getModel(type).findMany({
      where: { organizationId, isPublic: true },
      include: { tags: true, organization: true },
    });
  }

  async findByTags(type: TMaterialType, tagNames: string[]): Promise<TMaterial[]> {
    return this.getModel(type).findMany({
      where: {
        tags: {
          some: { name: { in: tagNames } },
        },
      },
      include: { tags: true, organization: true },
    });
  }

  async findPublic(type: TMaterialType, options?: {
    orderBy: string;
    orderDirection: 'asc' | 'desc';
    limit: number;
    page: number;
  }): Promise<TMaterialWithIncluded[]> {
    const orderBy = options?.orderBy || 'createdAt';
    const orderDirection = options?.orderDirection || 'desc';
    const limit = options?.limit || 8;
    const page = options?.page || 1;

    return this.getModel(type).findMany({
      where: { isPublic: true },
      orderBy: { [orderBy]: orderDirection },
      take: limit,
      skip: (page - 1) * limit,
      include: { tags: true, organization: true },
    });
  }

  async findInCatalog(searchParams: {
    type?: string | string[];
    limit?: number;
    page?: number;
    tags?: string[];
    searchTerm?: string;
    isPublic?: boolean | null;
    organizationId?: string;
    userId?: string;
  }): Promise<{ materials: TCatalogMaterial[]; totalCount: number; totalPages: number }> {
    const { 
      page = 1, 
      limit = 20, 
      searchTerm, 
      tags, 
      type, 
      isPublic = true,
      organizationId,
      userId 
    } = searchParams;

    const validatedType = this.validateType(type);
    const offset = (page - 1) * limit;

    const isText = !validatedType || (Array.isArray(validatedType) ? validatedType.includes('text') : validatedType === 'text');
    const isSong = !validatedType || (Array.isArray(validatedType) ? validatedType.includes('song') : validatedType === 'song');
    const isGame = !validatedType || (Array.isArray(validatedType) ? validatedType.includes('game') : validatedType === 'game');

    const SELECT = Prisma.sql`
      SELECT m.id,
      m.title,
      m.content,
      m.language,
      m."createdAt",
      m."organizationId",
      m."isPublic",
      row_to_json(o) AS organization,
      COALESCE(json_agg(row_to_json(t)) FILTER (WHERE t.id IS NOT NULL), '[]') AS tags`;

    const WHERE = (type: 'Text' | 'Song' | 'Game') => {
      const conditions = [];
      
      if (isPublic !== undefined && isPublic !== null) 
        conditions.push(Prisma.sql`m."isPublic" = ${isPublic}`);
      
      if (organizationId)
        conditions.push(Prisma.sql`m."organizationId" = ${organizationId}`);

      if (userId)
        conditions.push(Prisma.sql`o."userId" = ${userId}`);
      
      if (searchTerm) {
        conditions.push(Prisma.sql`(
          m.title ILIKE ${`%${searchTerm}%`}
          ${searchTerm.length > 4 ? Prisma.sql`OR m.content ILIKE ${`%${searchTerm}%`}` : Prisma.empty}
        )`);
      }
      
      if (tags && tags.length > 0) {
        conditions.push(Prisma.sql`EXISTS (
          SELECT 1
          FROM "_${Prisma.raw(type)}ToWtag" tt2
          JOIN "Wtag" t2 ON tt2."B" = t2.id
          WHERE tt2."A" = m.id 
          AND LOWER(t2.name) = ANY(ARRAY[${Prisma.join(tags.map(t => t.toLowerCase()))}])
          GROUP BY tt2."A"
          HAVING COUNT(DISTINCT t2.name) = ${tags.length}
        )`);
      }
      
      return conditions.length > 0
        ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
        : Prisma.empty;
    };

    const QUERY = (type: 'Text' | 'Song' | 'Game') => Prisma.sql`
      ${SELECT}, '${Prisma.raw(type.toLowerCase())}' AS type 
      FROM "${Prisma.raw(type)}" m
      LEFT JOIN "Organization" o ON m."organizationId" = o.id
      LEFT JOIN "_${Prisma.raw(type)}ToWtag" midt ON m.id = midt."A"
      LEFT JOIN "Wtag" t ON midt."B" = t.id
      ${WHERE(type)}
      GROUP BY m.id, o.id
    `;

    let query = Prisma.empty;
    if (isText) query = QUERY('Text');
    if (isSong) {
      const songQuery = QUERY('Song');

      query = query === Prisma.empty
        ? songQuery
        : Prisma.sql`${query} UNION ALL ${songQuery}`;
    }
    if (isGame) {
      const gameQuery = QUERY('Game');

      query = query === Prisma.empty
        ? gameQuery
        : Prisma.sql`${query} UNION ALL ${gameQuery}`;
    }

    // Get total count for pagination
    const [{ count }] = await prisma.$queryRaw<[{ count: number }]>`
      WITH Materials AS (${query})
      SELECT CAST(COUNT(*) AS INTEGER) as count 
      FROM Materials;
    `;

    const totalPages = Math.ceil(count / limit);

    // Get paginated results
    const materials = await prisma.$queryRaw<TCatalogMaterial[]>`
      WITH Materials AS (${query})
      SELECT * FROM Materials
      ORDER BY "createdAt" DESC
      LIMIT ${limit}
      OFFSET ${offset};
    `;

    return {
      materials,
      totalCount: count,
      totalPages,
    };
  }

  async findLatestMaterials(organizationId: string, limit: number): Promise<TMaterialWithType[]> {
    return prisma.$queryRaw`
      SELECT 'game' as type, title, "createdAt", id FROM "Game" WHERE "organizationId" = ${organizationId}
      UNION ALL
      SELECT 'text' as type, title, "createdAt", id FROM "Text" WHERE "organizationId" = ${organizationId}
      UNION ALL
      SELECT 'song' as type, title, "createdAt", id FROM "Song" WHERE "organizationId" = ${organizationId}
      ORDER BY "createdAt" DESC
      LIMIT ${limit}
    `;
  }
}

export const materialService = new MaterialServiceForSSR();
