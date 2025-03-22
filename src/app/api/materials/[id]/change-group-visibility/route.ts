import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { materialApiService } from '@/lib/MaterialServiceForAPI';
import { AsyncIdParam } from '@/types/Params';

// PATCH /api/materials/[id]/change-group-visibility
export async function PATCH(
  req: NextRequest,
  { params }: { params: AsyncIdParam }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { isPublic } = await req.json();

    // Verify material exists and belongs to user's organization
    const material = await materialApiService.findByIdAndOwnerId(id, session.user.id, {
      translations: true,
    });

    if (!material) {
      return NextResponse.json({ error: 'Material not found' }, { status: 404 });
    }

    const originalId = material.originalId || material.id;

    // Update all translations in the group to be public
    const updatedMaterial = await materialApiService.updateTranslationGroupVisivility(material.type, originalId, isPublic);

    return NextResponse.json(updatedMaterial);
  } catch (error) {
    console.error('Error making translations public:', error);
    return NextResponse.json(
      { error: 'Failed to make translations public' },
      { status: 500 }
    );
  }
}
