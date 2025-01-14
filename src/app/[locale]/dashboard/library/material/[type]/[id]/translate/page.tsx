import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { IdAndTypeParams } from '@/types/Params';
import { isValidMaterialType } from '@/utils';
import { TMaterialsIncludedOrganization, TMaterialsIncludedTags } from '@/types/Materials';
import { materialService } from '@/lib/MaterialServiceForSSR';
import CreateTranslationForm from '../../../../components/CreateTranslationForm';
import { Link } from '@/i18n/routing';
import { getDashboardMaterialUrl } from '@/utils/urls';

type Included = Required<TMaterialsIncludedTags & TMaterialsIncludedOrganization>;

export default async function MaterialTranslatePage({ params }: IdAndTypeParams) {
  const { id, type } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  if (!isValidMaterialType(type)) notFound();

  // Dynamic model selection based on type
  const material = await materialService.findByTypeAndIdAndUserId<Included>(type, id, session.user.id, {
    organization: true, 
    tags: true, 
  });

  if (!material) notFound()

    // If this is already a translation, redirect to the original
  if (material.originalId) {
    return <div className="container mx-auto p-6">
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              This is already a translation. Please go to the{' '}
              <Link href={getDashboardMaterialUrl({ type, id: material.originalId })} className="font-medium underline text-yellow-700 hover:text-yellow-600">
                original material
              </Link>{' '}
              to create new translations.
            </p>
          </div>
        </div>
      </div>
    </div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Translation</h1>
          <p className="text-gray-600">
            Creating a translation for: <span className="font-medium">{material.title}</span>
          </p>
          <div className="mt-2 text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full inline-block">
            Original Language: {material.language.toUpperCase()}
          </div>
        </div>

        <CreateTranslationForm material={material} type={type} />
      </div>
    </div>
  );
}
