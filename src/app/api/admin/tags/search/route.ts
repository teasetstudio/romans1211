import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Interface for tag with usage stats
interface TagWithStats {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  usageStats: {
    totalUsage: number;
    textCount: number;
    songCount: number;
    gameCount: number;
  };
}

// GET /api/admin/tags/search - Find tag by name with usage statistics
export async function GET(req: NextRequest) {
  try {
    // Get query parameters
    const url = new URL(req.url);
    const tagName = url.searchParams.get('tagName');
    const exact = url.searchParams.get('exact') === 'true';

    if (!tagName) {
      return NextResponse.json({ error: 'tagName parameter is required' }, { status: 400 });
    }

    // Search for tags
    const tags = await prisma.wtag.findMany({
      where: exact 
        ? {
            name: {
              equals: tagName,
              mode: 'insensitive'
            }
          }
        : {
            name: {
              contains: tagName,
              mode: 'insensitive'
            }
          },
      include: {
        _count: {
          select: {
            texts: true,
            songs: true,
            games: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Transform to include usage stats
    const tagsWithStats: TagWithStats[] = tags.map(tag => ({
      id: tag.id,
      name: tag.name,
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt,
      usageStats: {
        totalUsage: tag._count.texts + tag._count.songs + tag._count.games,
        textCount: tag._count.texts,
        songCount: tag._count.songs,
        gameCount: tag._count.games
      }
    }));

    return NextResponse.json({
      message: `Found ${tags.length} tag(s) matching "${tagName}"`,
      tags: tagsWithStats,
      metadata: {
        searchTerm: tagName,
        exactMatch: exact,
        resultCount: tags.length
      }
    });
  } catch (error) {
    console.error('Error searching for tags:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
