import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { materialApiService } from '@/lib/MaterialServiceForAPI';
import { apiTagService } from '@/lib/TagServiceForAPI';

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
    const material = await materialApiService.findByIdAndOwnerId(id, session.user.id, {
      tags: true,
    });

    if (!material) {
      return NextResponse.json({ error: 'Material not found' }, { status: 404 });
    }

    // If trying to make a translation public, validate that the original is public
    if (material.originalId && isPublic) {
      const validationResult = await materialApiService.validatePublicTranslation(
        material.type,
        material.originalId,
        isPublic
      );
      if (!validationResult.isValid) {
        return NextResponse.json({ error: validationResult.error }, { status: 400 });
      }
    }

    // If making an original material private, make all its translations private too
    if (!material.originalId && material.isPublic && !isPublic) {
      await materialApiService.makeTranslationsPrivate(material.type, material.id);
    }

    // Create or get existing tags
    const tagObjects = await apiTagService.findOrCreate(tags);

    const updateData = {
      title,
      content,
      isPublic,
      language,
      tags: {
        disconnect: material.tags?.map(tag => ({ id: tag.id })),
        connect: tagObjects.map(tag => ({ id: tag.id })),
      },
    };

    const updatedMaterial = await materialApiService.update(material.type, id, updateData);

    return NextResponse.json(updatedMaterial);
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
    const { searchParams } = new URL(req.url);
    const deleteAll = searchParams.get('deleteAll') === 'true';

    // Find the material and check if it has translations
    const material = await materialApiService.findByIdAndOwnerId(id, session.user.id, {
      translations: true,
    });

    if (!material) {
      return NextResponse.json(
        { error: 'Material not found or unauthorized' },
        { status: 404 }
      );
    }

    // If this is an original with translations
    if (material.translations && material.translations.length > 0) {
      if (!deleteAll) {
        return NextResponse.json({
          error: 'Cannot delete original material with translations. Either change the original first or set deleteAll=true to delete all translations.',
          hasTranslations: true,
          translationsCount: material.translations.length
        }, { status: 400 });
      }

      await materialApiService.deleteWithTranslations(material.type, id);
    } else {
      // Regular delete for materials without translations
      await materialApiService.deleteById(material.type, id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting material:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
