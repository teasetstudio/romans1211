import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Hardcoded admin password for security
const ADMIN_PASSWORD = 'admin123!@#';

// Helper function to verify admin password
function verifyAdminPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}

// GET /api/admin/unused-tags - Find unused tags
export async function GET(req: NextRequest) {
  try {
    // Check admin password
    const adminPassword = req.headers.get('x-admin-password');
    if (!adminPassword || !verifyAdminPassword(adminPassword)) {
      return NextResponse.json({ error: 'Unauthorized - Invalid admin password' }, { status: 401 });
    }

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

// DELETE /api/admin/unused-tags - Delete unused tags by ID array
export async function DELETE(req: NextRequest) {
  try {
    // Check admin password
    const adminPassword = req.headers.get('x-admin-password');
    if (!adminPassword || !verifyAdminPassword(adminPassword)) {
      return NextResponse.json({ error: 'Unauthorized - Invalid admin password' }, { status: 401 });
    }

    const body = await req.json();
    const { tagIds } = body;

    if (!tagIds || !Array.isArray(tagIds) || tagIds.length === 0) {
      return NextResponse.json({ error: 'tagIds array is required and must not be empty' }, { status: 400 });
    }

    // Validate that all provided IDs are strings
    if (!tagIds.every(id => typeof id === 'string')) {
      return NextResponse.json({ error: 'All tag IDs must be strings' }, { status: 400 });
    }

    // First, verify that all tags exist and are actually unused
    const tagsToDelete = await prisma.wtag.findMany({
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

    // Delete the unused tags
    const deleteResult = await prisma.wtag.deleteMany({
      where: {
        id: {
          in: tagsToDelete.map(tag => tag.id)
        }
      }
    });

    return NextResponse.json({
      message: `Successfully deleted ${deleteResult.count} unused tags`,
      deletedTags: tagsToDelete,
      deletedCount: deleteResult.count
    });
  } catch (error) {
    console.error('Error deleting unused tags:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
