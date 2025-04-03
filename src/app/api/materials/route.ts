import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, Session } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { materialService } from '@/lib/MaterialServiceForSSR';
import { ORG_CREATE_PERMISSIONS } from '@/lib/permissions';
import { organizationService } from '@/lib/OrganizationServiceForSSR';

// GET /api/materials
export async function GET(req: NextRequest) {
  try {
    const session: Session | null = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get search parameters from URL
    const searchParams = req.nextUrl.searchParams;
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const searchTerm = searchParams.get('searchTerm');
    const tags = searchParams.getAll('tags');
    const isPublic = searchParams.get('isPublic') === 'true' ? true : 
                     searchParams.get('isPublic') === 'false' ? false : null;
    const organizationId = searchParams.get('organizationId');
    const originalOnly = searchParams.get('originalOnly') === 'true';

    // Check if user has access to the organization
    if (organizationId) {
      const organization = await organizationService.getOrganizationByIdAndUserId(organizationId, session.user.id);
      if (!organization) {
        return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
      }
    }
    // Get materials using the service
    const result = await materialService.findInCatalog({
      type: type || undefined,
      page,
      limit,
      searchTerm: searchTerm || undefined,
      tags: tags.length > 0 ? tags : undefined,
      isPublic,
      organizationId: organizationId || undefined,
      // ownerId: session.user.id,
      originalOnly,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching materials:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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

    const { 
      title, 
      content, 
      organizationId, 
      isPublic = false, 
      type, 
      language = 'en', 
      tags = [],
      originalId = null // ID of the original material this is a translation of
    } = body;

    if (!title || !content || !organizationId || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const userId = session.user.id;
    // Verify organization belongs to user
    const organization = await prisma.organization.findFirst({
      where: {
        OR: [
          { id: organizationId, ownerId: userId },
          { members: { some: { userId, permissions: { hasSome: ORG_CREATE_PERMISSIONS } } } }
        ]
      },
      include: {
        members: {
          where: {
            userId,
          },
        },
      },
    });

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // If this is a translation, verify the original exists and belongs to the same organization
    let originalMaterial;
    if (originalId) { 
      // @ts-ignore
      originalMaterial = await prisma[type].findFirst({
        where: {
          id: originalId,
          organizationId: organizationId,
        },
      });

      if (!originalMaterial) {
        return NextResponse.json({ error: 'Original material not found' }, { status: 404 });
      }
    }

    // If trying to make a translation public, validate that the original is public
    if (originalMaterial && originalMaterial.isPublic === false && isPublic) {
      return NextResponse.json({ error: 'Cannot make translation public when original is not public'  }, { status: 400 });
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

    // Create the material with translation relationship if applicable
    let material;
    if (type === 'text' || type === 'song' || type === 'game') {
      // @ts-ignore
      material = await prisma[type].create({
        data: {
          title,
          content,
          language,
          isPublic,
          originalId,
          organizationId,
          tags: {
            connect: tagObjects.map((tag) => ({ id: tag.id })),
          },
        },
        include: {
          organization: true,
          tags: true,
          translations: true,
          original: !!originalId,
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
