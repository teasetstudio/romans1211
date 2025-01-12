import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, Session } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// POST /api/materials
export async function POST(req: NextRequest) {
  try {
    const session: Session | null = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!session?.user.id) {
      return NextResponse.json({ error: 'No UserID' }, { status: 400 });
    }
    const body = await req.json();

    const { title, content, organizationId, isPublic = false, type, language = 'en', tags = [] } = body;

    if (!title || !content || !organizationId || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify organization belongs to user
    const organization = await prisma.organization.findFirst({
      where: {
        id: organizationId,
        userId: session.user.id,
      },
    });

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Create or get existing tags
    const tagObjects = await Promise.all(
      tags.map(async (tagName: string) => {
        const existingTag = await prisma.wtag.findUnique({
          where: { name: tagName },
        });

        if (existingTag) return existingTag;

        return prisma.wtag.create({
          data: { name: tagName },
        });
      })
    );

    const baseData = {
      title,
      content,
      organizationId,
      isPublic,
      language,
    };

    let material;
    if (type === 'text' || type === 'song' || type === 'game') {
      const createData = {
        ...baseData,
        tags: {
          connect: tagObjects.map(tag => ({ id: tag.id }))
        }
      };

      // @ts-ignore
      material = await prisma[type].create({
        data: createData,
        include: { 
          tags: true,
          organization: true 
        },
      });
    } else {
      return NextResponse.json({ error: 'Invalid material type' }, { status: 400 });
    }

    return NextResponse.json(material);
  } catch (error) {
    console.error('Error creating material:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
