import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { Prisma } from '@prisma/client';

// GET /api/tags/search?query=example
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get search query from URL params
    const url = new URL(req.url);
    const query = url.searchParams.get('query') || '';
    const organizationId = url.searchParams.get('organizationId');
    const searchInPublicLibrary = url.searchParams.get('searchInPublicLibrary') === 'true';

    // Base filter
    const filter: Prisma.WtagWhereInput = {
      name: {
        contains: query,
        mode: 'insensitive',
      }
    };

    // Add organization filter if provided
    if (organizationId) {
      const organizationConditions = [
        {
          texts: {
            some: {
              organizationId,
            },
          },
        },
        {
          songs: {
            some: {
              organizationId,
            },
          },
        },
        {
          games: {
            some: {
              organizationId,
            },
          },
        },
      ];

      // If searchInPublicLibrary is true, also include public materials excluding this organization
      if (searchInPublicLibrary) {
        const publicConditions = [
          {
            texts: {
              some: {
                isPublic: true,
                NOT: {
                  organizationId,
                },
              },
            },
          },
          {
            songs: {
              some: {
                isPublic: true,
                NOT: {
                  organizationId,
                },
              },
            },
          },
          {
            games: {
              some: {
                isPublic: true,
                NOT: {
                  organizationId,
                },
              },
            },
          },
        ];
        
        filter.OR = [...organizationConditions, ...publicConditions];
      } else {
        filter.OR = organizationConditions;
      }
    }

    // Search for tags with name containing the query
    const tags = await prisma.wtag.findMany({
      where: filter,
      orderBy: {
        name: 'asc',
      },
      take: 20, // Limit results
    });

    // Return just the tag names in response
    return NextResponse.json({ 
      tags: tags.map(tag => tag.name)
    });
  } catch (error) {
    console.error('Error searching tags:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 