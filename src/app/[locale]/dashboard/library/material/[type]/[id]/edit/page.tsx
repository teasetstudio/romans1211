import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { IdAndTypeParams } from '@/types/Params';
import EditForm from '../../../../components/EditForm';
import { isValidMaterialType } from '@/utils';
import { materialService } from '@/lib/MaterialServiceForSSR';
import { TMaterialsIncludedOrganization, TMaterialsIncludedTags } from '@/types/Materials';

type Included = Required<TMaterialsIncludedTags & TMaterialsIncludedOrganization>;

export default async function MaterialEditPage({ params }: IdAndTypeParams) {
  const { id, type } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  if (!isValidMaterialType(type)) notFound();

  const material = await materialService.findByTypeAndIdAndUserId<Included>(type, id, session.user.id, {
    organization: true, 
    tags: true, 
  });

  if (!material) notFound();

  return (
    <div>
      <EditForm material={{ ...material, type }} />
    </div>
  );
}
