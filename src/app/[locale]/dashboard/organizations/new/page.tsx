'use client';

import { useTranslations } from 'next-intl';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from '@/i18n/routing';
import { ROUTE_DASHBOARD_ORGANIZATIONS } from '@/res/routes';
import { useOrganization } from '@/components/contexts/OrganizationContext';
import Button from '@/components/buttons/Button';
import Input from '@/components/inputs/Input';
import { NAMESPACE_COMMON } from '@/res/namespaces';
import toast from 'react-hot-toast';

interface IFormValues {
  name: string;
}

const schema = yup.object().shape({
  name: yup.string().required('Organization name is required').min(2, 'Name must be at least 2 characters'),
});

export default function NewOrganizationPage() {
  const t = useTranslations(NAMESPACE_COMMON);
  const router = useRouter();
  const { organizations, setOrganizations } = useOrganization();

  const methods = useForm<IFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
    },
  });

  const { handleSubmit, formState: { isSubmitting } } = methods;

  const onSubmit: SubmitHandler<IFormValues> = async (data) => {
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
          <h1 className="text-2xl font-semibold text-gray-900">Create New Organization</h1>
          <p className="mt-2 text-sm text-gray-600">
            Create a new organization to manage your team and resources.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow">
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              <div>
                <Input
                  name="name"
                  placeholder="Enter organization name"
                  type="text"
                />
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
