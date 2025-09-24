import { Prisma } from '@prisma/client';
import prisma from './prisma';
import { TMaterialType, TMaterialsIncludedTags, TMaterial, TMaterialWithType, TMaterialsIncluded } from '@/types/Materials';
import { orgPermissions, TOrgPermissions } from './permissions';

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

  async findByIdAndUserId(_where: {
    id: string,
    userId: string,
    orgPermissions: TOrgPermissions
  }, _include?: {
    tags?: boolean,
    translations?: boolean,
    original?: boolean | { include?: { translations?: boolean } },
  }): Promise<(TMaterialWithType & Partial<TMaterialsIncluded>) | null> {
    const where = {
      id: _where.id,
      organization: {
        OR: [
          { ownerId: _where.userId },
          { members: { some: { userId: _where.userId, permissions: { hasSome: orgPermissions[_where.orgPermissions] } } } }
        ]
      }
    }
    const include: any = {
      ..._include,
      organization: {
        include: {
          members: {
            where: { userId: _where.userId }
          }
        }
      }
    }
    const [text, song, game] = await Promise.all([
      prisma.text.findFirst({ where, include }),
      prisma.song.findFirst({ where, include }),
      prisma.game.findFirst({ where, include }),
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

  async updateTranslationGroupVisivility(type: TMaterialType, originalId: string, isPublic: boolean): Promise<number> {
    const result = await this.getModel(type).updateMany({
      where: {
        OR: [
          { id: originalId },
          { originalId }
        ]
      },
      data: { isPublic }
    });

    return result.count;
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

  async deleteByIdAndOwnerId(type: TMaterialType, id: string, ownerId: string): Promise<void> {
    await this.getModel(type).delete({
      where: { id, organization: { ownerId } },
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

  async changeType(
    currentType: TMaterialType, 
    newType: TMaterialType, 
    materialId: string
  ): Promise<{newMaterialId: string; newType: TMaterialType }> {
    if (currentType === newType) {
      throw new Error('Material is already of the specified type');
    }

    // Validate new type
    const validTypes: TMaterialType[] = ['text', 'song', 'game'];
    if (!validTypes.includes(newType)) {
      throw new Error('Invalid material type');
    }

    return await prisma.$transaction(async (tx) => {
      // Get the current material with all its data and translations
      const currentMaterial = await this.getModel(currentType, tx).findUnique({
        where: { id: materialId, originalId: null },
        include: {
          tags: true,
          translations: true,
          organization: true,
        },
      });

      if (!currentMaterial) {
        throw new Error('Material not found');
      }

      // Create the material in the new type table (let Prisma generate new ID)
      const newMaterial = await this.getModel(newType, tx).create({
        data: {
          title: currentMaterial.title,
          content: currentMaterial.content,
          language: currentMaterial.language,
          isPublic: currentMaterial.isPublic,
          originalId: null,
          organizationId: currentMaterial.organizationId,
          createdAt: currentMaterial.createdAt,
          updatedAt: new Date(),
          tags: {
            connect: currentMaterial.tags.map((tag: { id: string }) => ({ id: tag.id })),
          },
        },
        include: {
          tags: true,
        },
      });

      // Migrate all translations to the new type
      if (currentMaterial.translations && currentMaterial.translations.length > 0) {
        for (const translation of currentMaterial.translations) {
          // Get translation with tags
          const translationWithTags = await this.getModel(currentType, tx).findUnique({
            where: { id: translation.id },
            include: { tags: true },
          });

          if (translationWithTags) {
            // Create translation in new type table (new ID will be generated)
            await this.getModel(newType, tx).create({
              data: {
                title: translationWithTags.title,
                content: translationWithTags.content,
                language: translationWithTags.language,
                isPublic: translationWithTags.isPublic,
                originalId: newMaterial.id, // Point to the new original
                organizationId: translationWithTags.organizationId,
                createdAt: translationWithTags.createdAt,
                updatedAt: new Date(),
                tags: {
                  connect: translationWithTags.tags.map((tag: { id: string }) => ({ id: tag.id })),
                },
              },
            });

            // Delete from old type table
            await this.getModel(currentType, tx).delete({
              where: { id: translation.id },
            });
          }
        }
      }

      // Delete the original material from the old type table
      await this.getModel(currentType, tx).delete({
        where: { id: materialId },
      });

      return {
        newMaterialId: newMaterial.id,
        newType,
      };
    });
  }
}

export const materialApiService = new MaterialServiceForAPI();
