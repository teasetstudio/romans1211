import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Hardcoded admin password for security (same as other admin endpoints)
const ADMIN_PASSWORD = 'admin123!@#';

// Helper function to verify admin password
function verifyAdminPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}

// Interface for material with tags
interface MaterialWithTags {
  id: string;
  title: string;
  content: string;
  language: string;
  isPublic: boolean;
  organizationId: string;
  originalId: string | null;
  createdAt: Date;
  updatedAt: Date;
  type: 'text' | 'song' | 'game';
  tags: {
    id: string;
    name: string;
  }[];
  organization: {
    id: string;
    name: string;
  };
}

// GET /api/admin/materials/by-tag - Find materials by tag name
export async function GET(req: NextRequest) {
  try {
    // Check admin password
    const adminPassword = req.headers.get('x-admin-password');
    if (!adminPassword || !verifyAdminPassword(adminPassword)) {
      return NextResponse.json({ error: 'Unauthorized - Invalid admin password' }, { status: 401 });
    }

    // Get query parameters
    const url = new URL(req.url);
    const tagName = url.searchParams.get('tagName');
    const materialType = url.searchParams.get('type') as 'text' | 'song' | 'game' | null;
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const page = parseInt(url.searchParams.get('page') || '1');

    if (!tagName) {
      return NextResponse.json({ error: 'tagName parameter is required' }, { status: 400 });
    }

    const offset = (page - 1) * limit;
    const materials: MaterialWithTags[] = [];

    // Define which material types to search
    const typesToSearch: ('text' | 'song' | 'game')[] = materialType 
      ? [materialType] 
      : ['text', 'song', 'game'];

    // Search each material type
    for (const type of typesToSearch) {
      const typeResults = await (prisma[type] as any).findMany({
        where: {
          tags: {
            some: {
              name: {
                equals: tagName,
                mode: 'insensitive'
              }
            }
          }
        },
        include: {
          tags: {
            select: {
              id: true,
              name: true
            }
          },
          organization: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });

      // Add type information to each result
      const typedResults = typeResults.map((material: any) => ({
        ...material,
        type
      }));

      materials.push(...typedResults);
    }

    // Sort all materials by updatedAt desc
    materials.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    // Apply pagination
    const paginatedMaterials = materials.slice(offset, offset + limit);
    const totalCount = materials.length;
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      message: `Found ${totalCount} materials with tag "${tagName}"`,
      materials: paginatedMaterials,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      metadata: {
        tagName,
        materialType: materialType || 'all',
        searchedTypes: typesToSearch
      }
    });
  } catch (error) {
    console.error('Error finding materials by tag:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
