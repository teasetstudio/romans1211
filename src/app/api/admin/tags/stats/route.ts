import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Interface for tag usage statistics
interface TagUsageStats {
  id: string;
  name: string;
  totalUsage: number;
  textCount: number;
  songCount: number;
  gameCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface TagStats {
  totalTags: number;
  usedTags: number;
  unusedTags: number;
  mostUsedTags: TagUsageStats[];
  recentTags: {
    id: string;
    name: string;
    createdAt: Date;
    totalUsage: number;
  }[];
  tagDistribution: {
    textsOnly: number;
    songsOnly: number;
    gamesOnly: number;
    multipleTypes: number;
  };
  averageUsagePerTag: number;
}

// GET /api/admin/tags/stats - Get comprehensive tag statistics
export async function GET(req: NextRequest) {
  try {
    // Get query parameters
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const recentDays = parseInt(url.searchParams.get('recentDays') || '30');

    // Calculate date for recent tags
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - recentDays);

    // Get all tags with their usage counts
    const tagsWithUsage = await prisma.wtag.findMany({
      include: {
        _count: {
          select: {
            texts: true,
            songs: true,
            games: true,
          },
        },
        texts: {
          select: { id: true },
        },
        songs: {
          select: { id: true },
        },
        games: {
          select: { id: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Process tag usage statistics
    const tagUsageStats: TagUsageStats[] = tagsWithUsage.map(tag => ({
      id: tag.id,
      name: tag.name,
      totalUsage: tag._count.texts + tag._count.songs + tag._count.games,
      textCount: tag._count.texts,
      songCount: tag._count.songs,
      gameCount: tag._count.games,
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt,
    }));

    // Get most used tags (sorted by total usage)
    const mostUsedTags = tagUsageStats
      .filter(tag => tag.totalUsage > 0)
      .sort((a, b) => b.totalUsage - a.totalUsage)
      .slice(0, limit);

    // Get recent tags (created within the specified days)
    const recentTags = tagUsageStats
      .filter(tag => tag.createdAt >= recentDate)
      .slice(0, limit)
      .map(tag => ({
        id: tag.id,
        name: tag.name,
        createdAt: tag.createdAt,
        totalUsage: tag.totalUsage,
      }));

    // Calculate tag distribution
    const tagDistribution = {
      textsOnly: 0,
      songsOnly: 0,
      gamesOnly: 0,
      multipleTypes: 0,
    };

    tagUsageStats.forEach(tag => {
      const hasTexts = tag.textCount > 0;
      const hasSongs = tag.songCount > 0;
      const hasGames = tag.gameCount > 0;
      const typeCount = [hasTexts, hasSongs, hasGames].filter(Boolean).length;

      if (typeCount === 0) {
        // Unused tag - don't count in distribution
        return;
      } else if (typeCount === 1) {
        if (hasTexts) tagDistribution.textsOnly++;
        else if (hasSongs) tagDistribution.songsOnly++;
        else if (hasGames) tagDistribution.gamesOnly++;
      } else {
        tagDistribution.multipleTypes++;
      }
    });

    // Calculate basic statistics
    const totalTags = tagUsageStats.length;
    const usedTags = tagUsageStats.filter(tag => tag.totalUsage > 0).length;
    const unusedTags = totalTags - usedTags;
    const totalUsage = tagUsageStats.reduce((sum, tag) => sum + tag.totalUsage, 0);
    const averageUsagePerTag = usedTags > 0 ? totalUsage / usedTags : 0;

    const stats: TagStats = {
      totalTags,
      usedTags,
      unusedTags,
      mostUsedTags,
      recentTags,
      tagDistribution,
      averageUsagePerTag: Math.round(averageUsagePerTag * 100) / 100, // Round to 2 decimal places
    };

    return NextResponse.json({
      message: 'Tag statistics retrieved successfully',
      stats,
      metadata: {
        limit,
        recentDays,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching tag statistics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}