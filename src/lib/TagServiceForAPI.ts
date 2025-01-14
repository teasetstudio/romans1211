import { Wtag } from '@prisma/client';
import prisma from './prisma';

class TagServiceForAPI {
  async findOrCreate(tagNames: string[]): Promise<Wtag[]> {
    const tagObjects = await Promise.all(
      tagNames.map(async (tagName: string) => {
        const existingTag = await prisma.wtag.findUnique({
          where: { name: tagName },
        });

        if (existingTag) return existingTag;

        return prisma.wtag.create({ data: { name: tagName } });
      })
    );
    return tagObjects;
  }
}

export const apiTagService = new TagServiceForAPI();
