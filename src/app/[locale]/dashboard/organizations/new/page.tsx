'use client';

import { useTranslations } from 'next-intl';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from '@/i18n/routing';
import { ROUTE_DASHBOARD_ORGANIZATIONS } from '@/res/routes';
import { OrganizationCreateAttr, useOrganization } from '@/components/contexts/OrganizationContext';
import Button from '@/components/buttons/Button';
import Input from '@/components/inputs/Input';
import { NAMESPACE_DASHBOARD } from '@/res/namespaces';
import toast from 'react-hot-toast';
import H9 from '@/components/typo/H9'; 

const schema = yup.object().shape({
  name: yup.string().required('Organization name is required').min(2, 'Name must be at least 2 characters'),
  description: yup.string().nullable().optional().max(30000, 'Description must be less than 30000 characters'),
});

export default function NewOrganizationPage() {
  const t = useTranslations(NAMESPACE_DASHBOARD);
  const router = useRouter();
  const { organizations, setOrganizations } = useOrganization();

  const methods = useForm<OrganizationCreateAttr>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const { handleSubmit, formState: { isSubmitting } } = methods;

  const onSubmit: SubmitHandler<OrganizationCreateAttr> = async (data) => {
    try {
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create organization');
      }

      const newOrg = await response.json();
      setOrganizations([...organizations, newOrg]);
      toast.success('Organization created successfully');
      router.push(ROUTE_DASHBOARD_ORGANIZATIONS);
    } catch (error) {
      toast.error('Failed to create organization');
      console.error('Error creating organization:', error);
    }
  };

  return (
    <div className="flex-1 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-8">{t('createOrganization')}</h1>
          <p className="mt-2 text-sm text-gray-600">
            Create a new organization to manage your team and resources.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow">
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              <div>
                <H9>{t('organizationName')}</H9>
                <Input
                  name="name"
                  placeholder={t('enterOrganizationName')}
                  type="text"
                />
              </div>
              <div>
                <H9>{t('organizationDescription')}</H9>
                <textarea
                  {...methods.register('description')}
                  placeholder={t('enterOrganizationDescription')}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  rows={4}                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  onClick={() => router.push(ROUTE_DASHBOARD_ORGANIZATIONS)}
                  className="text-gray-700"
                  size="sm"
                  rounded="rounded-lg"
                  paddingClass="p-2"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  bgColor="bg-primary"
                  className="text-white"
                  size="sm"
                  rounded="rounded-lg"
                  paddingClass="p-2"
                >
                  {isSubmitting ? 'Creating...' : 'Create Organization'}
                </Button>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
}
