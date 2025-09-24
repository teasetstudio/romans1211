import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { materialApiService } from '@/lib/MaterialServiceForAPI';
import { TMaterialType } from '@/types/Materials';

// PATCH /api/materials/[id]/change-type/[type]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; type: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, type } = await params;

    // Validate the new type
    const validTypes: TMaterialType[] = ['text', 'song', 'game'];
    if (!validTypes.includes(type as TMaterialType)) {
      return NextResponse.json(
        { error: 'Invalid material type. Must be one of: text, song, game' },
        { status: 400 }
      );
    }

    const newType = type as TMaterialType;

    // Find the current material and determine its current type
    const currentMaterial = await materialApiService.findByIdAndUserId({
      id,
      userId: session.user.id,
      orgPermissions: 'edit',
    }, {
      tags: true,
      translations: true,
    });

    if (!currentMaterial) {
      return NextResponse.json(
        { error: 'Material not found or unauthorized' },
        { status: 404 }
      );
    }

    const currentType = currentMaterial.type;

    // Check if the material is already of the requested type
    if (currentType === newType) {
      return NextResponse.json(
        { error: `Material is already of type '${newType}'` },
        { status: 400 }
      );
    }

    // Perform the type change with translation migration
    const updatedData = await materialApiService.changeType(
      currentType,
      newType,
      id
    );

    return NextResponse.json(updatedData);

  } catch (error) {
    console.error('Error changing material type:', error);
    
    // Handle specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Material is already of the specified type')) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      if (error.message.includes('Invalid material type')) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      if (error.message.includes('Material not found')) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
