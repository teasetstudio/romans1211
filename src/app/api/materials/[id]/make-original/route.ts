import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { materialApiService } from '@/lib/MaterialServiceForAPI';
import { AsyncIdParam } from '@/types/Params';

// PATCH /api/materials/[id]/make-original
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

    // Find the material to make original
    const material = await materialApiService.findByIdAndOwnerId(id, session.user.id, {
      original: {
        include: { translations: true },
      },
    });

    if (!material) {
      return NextResponse.json(
        { error: 'Material not found or unauthorized' },
        { status: 404 }
      );
    }

    // If this is already an original material, no need to do anything
    if (!material.originalId) {
      return NextResponse.json(
        { error: 'This material is already an original' },
        { status: 400 }
      );
    }

    // Start a transaction to update all translations
    const updatedMaterial = await materialApiService.changeGroupOriginal(material)

    return NextResponse.json(updatedMaterial);
  } catch (error) {
    console.error('Error making material original:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
