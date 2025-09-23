import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/admin/tags/unused - Find unused tags
export async function GET() {
  try {
    // Find all tags that are not used by any Text, Song, or Game
    const unusedTags = await prisma.wtag.findMany({
      where: {
        AND: [
          { texts: { none: {} } },
          { songs: { none: {} } },
          { games: { none: {} } },
        ]
      },
      orderBy: {
        name: 'asc'
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json({
      message: `Found ${unusedTags.length} unused tags`,
      unusedTags
    });
  } catch (error) {
    console.error('Error finding unused tags:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/unused-tags - Delete unused tags by ID array or delete all unused tags
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { tagIds, deleteAll, exceptIds } = body;

    // Validate exceptIds if provided
    if (exceptIds && (!Array.isArray(exceptIds) || !exceptIds.every(id => typeof id === 'string'))) {
      return NextResponse.json({ error: 'exceptIds must be an array of strings' }, { status: 400 });
    }

    let tagsToDelete;

    if (deleteAll === true) {
      // Find all unused tags, excluding the ones in exceptIds
      const whereCondition: {
        AND: Array<Record<string, unknown>>;
        id?: { notIn: string[] };
      } = {
        AND: [
          { texts: { none: {} } },
          { songs: { none: {} } },
          { games: { none: {} } }
        ]
      };

      // Exclude specified IDs if provided
      if (exceptIds && exceptIds.length > 0) {
        whereCondition.id = { notIn: exceptIds };
      }

      tagsToDelete = await prisma.wtag.findMany({
        where: whereCondition,
        select: {
          id: true,
          name: true
        }
      });

      if (tagsToDelete.length === 0) {
        return NextResponse.json({ 
          message: 'No unused tags found to delete',
          exceptIds: exceptIds || []
        });
      }
    } else {
      // Original behavior - delete specific tag IDs
      if (!tagIds || !Array.isArray(tagIds) || tagIds.length === 0) {
        return NextResponse.json({ error: 'tagIds array is required and must not be empty when deleteAll is not true' }, { status: 400 });
      }

      // Validate that all provided IDs are strings
      if (!tagIds.every(id => typeof id === 'string')) {
        return NextResponse.json({ error: 'All tag IDs must be strings' }, { status: 400 });
      }

      // First, verify that all tags exist and are actually unused
      tagsToDelete = await prisma.wtag.findMany({
        where: {
          id: { in: tagIds },
          AND: [
            { texts: { none: {} } },
            { songs: { none: {} } },
            { games: { none: {} } }
          ]
        },
        select: {
          id: true,
          name: true
        }
      });

      if (tagsToDelete.length === 0) {
        return NextResponse.json({ 
          error: 'No unused tags found with the provided IDs', 
          providedIds: tagIds 
        }, { status: 400 });
      }

      // Check if some tags are being used (safety check)
      const usedTags = await prisma.wtag.findMany({
        where: {
          id: { in: tagIds },
          OR: [
            { texts: { some: {} } },
            { songs: { some: {} } },
            { games: { some: {} } }
          ]
        },
        select: {
          id: true,
          name: true
        }
      });

      if (usedTags.length > 0) {
        return NextResponse.json({ 
          error: 'Some tags are currently in use and cannot be deleted', 
          usedTags: usedTags,
          unusedTags: tagsToDelete
        }, { status: 400 });
      }
    }

    // Delete the unused tags
    const deleteResult = await prisma.wtag.deleteMany({
      where: {
        id: {
          in: tagsToDelete.map(tag => tag.id)
        }
      }
    });

    const responseMessage = deleteAll === true 
      ? `Successfully deleted ${deleteResult.count} unused tags (deleteAll mode)`
      : `Successfully deleted ${deleteResult.count} unused tags`;

    return NextResponse.json({
      message: responseMessage,
      deletedTags: tagsToDelete,
      deletedCount: deleteResult.count,
      ...(deleteAll === true && { exceptIds: exceptIds || [] })
    });
  } catch (error) {
    console.error('Error deleting unused tags:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
