import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Interface for the request body
interface ReplaceTagRequest {
  materialId: string;
  oldTagId: string;
  newTagId: string;
}

// Interface for the response
interface ReplaceTagResponse {
  success: boolean;
  message: string;
  material: {
    id: string;
    title: string;
    type: string;
    tags: { id: string; name: string }[];
  };
  changes: {
    removedTag: { id: string; name: string };
    addedTag: { id: string; name: string };
  };
}

// POST /api/admin/materials/replace-tag - Replace one tag with another on a material
export async function POST(req: NextRequest) {
  try {
    const body: ReplaceTagRequest = await req.json();
    const { materialId, oldTagId, newTagId } = body;

    // Validate required fields
    if (!materialId || !oldTagId || !newTagId) {
      return NextResponse.json({ 
        error: 'Missing required fields: materialId, oldTagId, newTagId' 
      }, { status: 400 });
    }

    // Check if old and new tags are the same
    if (oldTagId === newTagId) {
      return NextResponse.json({ 
        error: 'Old tag and new tag cannot be the same' 
      }, { status: 400 });
    }

    // Verify both tags exist
    const [oldTag, newTag] = await Promise.all([
      prisma.wtag.findUnique({ where: { id: oldTagId } }),
      prisma.wtag.findUnique({ where: { id: newTagId } })
    ]);

    if (!oldTag) {
      return NextResponse.json({ error: 'Old tag not found' }, { status: 404 });
    }

    if (!newTag) {
      return NextResponse.json({ error: 'New tag not found' }, { status: 404 });
    }

    // Search for the material across all types
    let material: any = null;
    let materialType: 'text' | 'song' | 'game' | null = null;

    const materialTypes: ('text' | 'song' | 'game')[] = ['text', 'song', 'game'];
    
    for (const type of materialTypes) {
      const found = await (prisma[type] as any).findUnique({
        where: { id: materialId },
        include: {
          tags: { select: { id: true, name: true } },
          organization: { select: { id: true, name: true } }
        }
      });

      if (found) {
        material = found;
        materialType = type;
        break;
      }
    }

    if (!material || !materialType) {
      return NextResponse.json({ error: 'Material not found' }, { status: 404 });
    }

    // Check if material has the old tag
    const hasOldTag = material.tags.some((tag: any) => tag.id === oldTagId);
    if (!hasOldTag) {
      return NextResponse.json({ 
        error: 'Material does not have the specified old tag' 
      }, { status: 400 });
    }

    // Check if material already has the new tag
    const hasNewTag = material.tags.some((tag: any) => tag.id === newTagId);
    if (hasNewTag) {
      return NextResponse.json({ 
        error: 'Material already has the new tag' 
      }, { status: 400 });
    }

    // Perform the tag replacement in a transaction
    const updatedMaterial = await prisma.$transaction(async (tx) => {
      // Remove the old tag
      await (tx[materialType] as any).update({
        where: { id: materialId },
        data: {
          tags: {
            disconnect: { id: oldTagId }
          }
        }
      });

      // Add the new tag
      const result = await (tx[materialType] as any).update({
        where: { id: materialId },
        data: {
          tags: {
            connect: { id: newTagId }
          }
        },
        include: {
          tags: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      return result;
    });

    const response: ReplaceTagResponse = {
      success: true,
      message: `Successfully replaced tag "${oldTag.name}" with "${newTag.name}" on ${materialType} "${material.title}"`,
      material: {
        id: updatedMaterial.id,
        title: updatedMaterial.title,
        type: materialType,
        tags: updatedMaterial.tags
      },
      changes: {
        removedTag: {
          id: oldTag.id,
          name: oldTag.name
        },
        addedTag: {
          id: newTag.id,
          name: newTag.name
        }
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error replacing tag on material:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/admin/materials/replace-tag - Get information about a material's tags (for preview)
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const materialId = url.searchParams.get('materialId');

    if (!materialId) {
      return NextResponse.json({ 
        error: 'Missing required parameter: materialId' 
      }, { status: 400 });
    }

    // Search for the material across all types
    let material: any = null;
    let materialType: 'text' | 'song' | 'game' | null = null;

    const materialTypes: ('text' | 'song' | 'game')[] = ['text', 'song', 'game'];
    
    for (const type of materialTypes) {
      const found = await (prisma[type] as any).findUnique({
        where: { id: materialId },
        include: {
          tags: { select: { id: true, name: true } },
          organization: { select: { id: true, name: true } }
        }
      });

      if (found) {
        material = found;
        materialType = type;
        break;
      }
    }

    if (!material || !materialType) {
      return NextResponse.json({ error: 'Material not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Material information retrieved successfully',
      material: {
        id: material.id,
        title: material.title,
        type: materialType,
        language: material.language,
        isPublic: material.isPublic,
        organization: material.organization,
        tags: material.tags,
        createdAt: material.createdAt,
        updatedAt: material.updatedAt
      }
    });
  } catch (error) {
    console.error('Error getting material information:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
