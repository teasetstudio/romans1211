import { Prisma } from '@prisma/client';
import prisma from './prisma';
import { TMaterialType, TMaterialsIncludedTags, TMaterial, TMaterialWithType, TMaterialsIncluded } from '@/types/Materials';

type PrismaClientDelegate = Prisma.TextDelegate | Prisma.SongDelegate | Prisma.GameDelegate
type UpdateMaterial = TMaterial & {
  tags?: {
    disconnect?: { id: string }[];
    connect?: { id: string }[];
  }
}

class MaterialServiceForAPI {
  private validateType(type: string | string[] | undefined): TMaterialType | TMaterialType[] | undefined {
    if (!type) return undefined;
    
    const validTypes: TMaterialType[] = ['text', 'song', 'game'];
    
    if (Array.isArray(type)) {
      const validatedTypes = type.filter(t => validTypes.includes(t as TMaterialType));
      return validatedTypes.length > 0 ? validatedTypes as TMaterialType[] : undefined;
    }
    
    return validTypes.includes(type as TMaterialType) ? type as TMaterialType : undefined;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getModel(type: TMaterialType, prismaClient?: any): PrismaClientDelegate | any {
    const _prisma = prismaClient || prisma;
    switch (type) {
      case 'text':
        return _prisma.text;
      case 'song':
        return _prisma.song;
      case 'game':
        return _prisma.game;
      default:
        throw new Error('Invalid material type');
    }
  }

  async findByIdAndUserId(id: string, userId: string, include?: {
    tags?: boolean,
    organization?: boolean,
    translations?: boolean,
    original?: boolean | { include?: { translations?: boolean } },
  }): Promise<(TMaterialWithType & Partial<TMaterialsIncluded>) | null> {
    const [text, song, game] = await Promise.all([
      prisma.text.findFirst({
        where: { id, organization: { userId } },
        include,
      }),
      prisma.song.findFirst({
        where: { id, organization: { userId } },
        include,
      }),
      prisma.game.findFirst({
        where: { id, organization: { userId } },
        include,
      }),
    ]);

    const type = text ? 'text' : song ? 'song' : game ? 'game' : null;
    const material = type === 'text' ? text : type === 'song' ? song : game;

    if (type && material) {
      return {
        ...material,
        type,
      }
    }
    return null;
  }

  async update(type: TMaterialType, id: string, data: Partial<UpdateMaterial>): Promise<TMaterialWithType & TMaterialsIncludedTags> {
    const updatedMaterial = await this.getModel(type).update({
      where: { id },
      data,
      include: { tags: true },
    });

    return {
      ...updatedMaterial,
      type,
    };
  }

  async changeGroupOriginal(newOriginalMaterial: TMaterialWithType & Partial<TMaterialsIncluded>): Promise<TMaterialWithType & Required<TMaterialsIncluded>> {
    const type = newOriginalMaterial.type;
    const newOriginalId = newOriginalMaterial.id as string;
    const oldOriginalId = newOriginalMaterial.originalId as string;
    // Get all translations in the group (including siblings)
    const siblingTranslationIds =
      (newOriginalMaterial.original?.translations || [])
        .filter(t => t.id !== newOriginalId) // Exclude the current material
        .map(t => t.id);

    const updatedMaterial = await prisma.$transaction(async (tx) => {
      // If the new original is not public, make all translations private
      const updateData = !newOriginalMaterial.isPublic ? { originalId: newOriginalId, isPublic: false } : { originalId: newOriginalId };
      // First, update all sibling translations to point to this material
      await this.getModel(type, tx).updateMany({
        where: { id: { in: siblingTranslationIds } },
        data: updateData,
      });

      // Make the old original a translation of the new original
      await this.getModel(type, tx).update({
        where: { id: oldOriginalId },
        data: updateData,
      });

      // Then make this material an original by removing its originalId
      return this.getModel(type, tx).update({
        where: { id: newOriginalId },
        data: { originalId: null },
        include: {
          organization: true,
          tags: true,
          translations: true,
          original: true,
        },
      });
    });

    return {
      ...updatedMaterial,
      type,
    };
  }

  async validatePublicTranslation(type: TMaterialType, originalId: string | null, isPublic: boolean): Promise<{ isValid: boolean; error?: string }> {
    // If it's not public or not a translation, it's valid
    if (!isPublic || !originalId) {
      return { isValid: true };
    }

    // Check if the original is public
    const original = await this.getModel(type).findUnique({
      where: { id: originalId },
      select: { isPublic: true }
    });

    if (!original?.isPublic) {
      return { 
        isValid: false, 
        error: 'Cannot make translation public when original is not public'
      };
    }

    return { isValid: true };
  }

  async makeTranslationsPrivate(type: TMaterialType, originalId: string): Promise<void> {
    // Update all translations of this material to be private
    await this.getModel(type).updateMany({
      where: { originalId },
      data: { isPublic: false }
    });
  }

  async deleteById(type: TMaterialType, id: string): Promise<void> {
    return this.getModel(type).delete({ where: { id } });
  }

  async deleteByIdAndUserId(type: TMaterialType, id: string, userId: string): Promise<void> {
    return await this.getModel(type).delete({
      where: { id, organization: { userId } },
    });
  }

  async deleteWithTranslations(type: TMaterialType, id: string): Promise<void> {
    // Delete all translations first
    await prisma.$transaction([
      this.getModel(type).deleteMany({
        where: {
          originalId: id,
        },
      }),
      this.getModel(type).delete({
        where: {
          id,
        },
      }),
    ]);
  }
}

export const materialApiService = new MaterialServiceForAPI();
