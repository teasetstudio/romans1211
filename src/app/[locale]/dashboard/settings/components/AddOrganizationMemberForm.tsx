'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';

// Define the schema for the form
const formSchema = z.object({
  organizationId: z.string().min(1, { message: 'Please select an organization' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  permissions: z.array(z.string()).min(1, { message: 'Please select at least one permission' }),
});

type FormValues = z.infer<typeof formSchema>;

// Define the permission options
const permissionOptions = [
  { value: 'ADMIN', label: 'Admin (Full control)' },
  { value: 'MANAGE', label: 'Manage (Can manage resources)' },
  { value: 'EDIT', label: 'Edit (Can edit resources)' },
  { value: 'VIEW', label: 'View (Can view resources)' },
  { value: 'ADMIN_LIBRARY', label: 'Admin Library (Full control over library)' },
  { value: 'MANAGE_LIBRARY', label: 'Manage Library (Can manage library content)' },
  { value: 'EDIT_LIBRARY', label: 'Edit Library (Can edit library content)' },
  { value: 'VIEW_LIBRARY', label: 'View Library (Can view library content)' },
  { value: 'ADMIN_EVENT_COURSES', label: 'Admin Courses (Full control over courses)' },
  { value: 'MANAGE_EVENT_COURSES', label: 'Manage Courses (Can manage courses)' },
  { value: 'EDIT_EVENT_COURSES', label: 'Edit Courses (Can edit courses)' },
  { value: 'VIEW_EVENT_COURSES', label: 'View Courses (Can view courses)' },
];

export default function AddOrganizationMemberForm() {
  const [organizations, setOrganizations] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      organizationId: '',
      email: '',
      permissions: ['VIEW'],
    },
  });

  // Fetch organizations on component mount
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await fetch('/api/organizations');
        if (!response.ok) {
          throw new Error('Failed to fetch organizations');
        }
        const data = await response.json();
        setOrganizations(data);
      } catch (error) {
        console.error('Error fetching organizations:', error);
        toast.error('Failed to load organizations');
      }
    };

    fetchOrganizations();
  }, []);

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/organization-members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to add member');
      }

      toast.success('Member added successfully');
      reset();
    } catch (error) {
      console.error('Error adding member:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add member');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-2xl font-semibold mb-4">Add Organization Member</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="organizationId" className="block text-sm font-medium text-gray-700 mb-1">
            Organization
          </label>
          <select
            id="organizationId"
            {...register('organizationId')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select an organization</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
          {errors.organizationId && (
            <p className="mt-1 text-sm text-red-600">{errors.organizationId.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="user@example.com"
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {permissionOptions.map((option) => (
              <div key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  id={`permission-${option.value}`}
                  value={option.value}
                  {...register('permissions')}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label
                  htmlFor={`permission-${option.value}`}
                  className="ml-2 block text-sm text-gray-900"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
          {errors.permissions && (
            <p className="mt-1 text-sm text-red-600">{errors.permissions.message}</p>
          )}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? 'Adding...' : 'Add Member'}
          </button>
        </div>
      </form>
    </div>
  );
} 