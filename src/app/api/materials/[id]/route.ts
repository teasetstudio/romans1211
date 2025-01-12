import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

async function findMaterialById(id: string, userId: string) {
  const [text, song, game] = await Promise.all([
    prisma.text.findFirst({
      where: { id, organization: { userId } },
      include: { tags: true },
    }),
    prisma.song.findFirst({
      where: { id, organization: { userId } },
      include: { tags: true },
    }),
    prisma.game.findFirst({
      where: { id, organization: { userId } },
      include: { tags: true },
    }),
  ]);

  if (text) return { type: 'text', material: text };
  if (song) return { type: 'song', material: song };
  if (game) return { type: 'game', material: game };
  return null;
}

// PUT /api/materials/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, content, isPublic, language = 'en', tags = [] } = await req.json();
    const { id } = await params;

    // Verify material belongs to user's organization
    const materialData = await findMaterialById(id, session.user.id);

    if (!materialData) {
      return NextResponse.json({ error: 'Material not found' }, { status: 404 });
    }

    // Create or get existing tags
    const tagObjects = await Promise.all(
      tags.map(async (tagName: string) => {
        const existingTag = await prisma.wtag.findUnique({
          where: { name: tagName },
        });

        if (existingTag) {
          return existingTag;
        }

        return prisma.wtag.create({
          data: { name: tagName },
        });
      })
    );

    const updateData = {
      title,
      content,
      isPublic,
      language,
      tags: {
        disconnect: materialData.material.tags.map(tag => ({ id: tag.id })),
        connect: tagObjects.map(tag => ({ id: tag.id })),
      },
    };

    let updatedMaterial;
    switch (materialData.type) {
      case 'text':
        updatedMaterial = await prisma.text.update({
          where: { id },
          data: updateData,
          include: { tags: true },
        });
        break;
      case 'song':
        updatedMaterial = await prisma.song.update({
          where: { id },
          data: updateData,
          include: { tags: true },
        });
        break;
      case 'game':
        updatedMaterial = await prisma.game.update({
          where: { id },
          data: updateData,
          include: { tags: true },
        });
        break;
    }

    return NextResponse.json({ ...updatedMaterial, type: materialData.type });
  } catch (error) {
    console.error('Error updating material:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/materials/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify material belongs to user's organization
    const materialData = await findMaterialById(id, session.user.id);

    if (!materialData) {
      return NextResponse.json({ error: 'Material not found' }, { status: 404 });
    }

    // Delete the material based on its type
    switch (materialData.type) {
      case 'text':
        await prisma.text.delete({ where: { id } });
        break;
      case 'song':
        await prisma.song.delete({ where: { id } });
        break;
      case 'game':
        await prisma.game.delete({ where: { id } });
        break;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting material:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
