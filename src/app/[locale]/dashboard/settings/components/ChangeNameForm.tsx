'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import TextInput from '@/components/inputs/TextInput';
import { IconEdit } from '@/res/icons'

interface NameSettingsForm {
  name: string;
}

export default function ChangeNameForm() {
  const { data: session, update: updateSession } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const form = useForm<NameSettingsForm>({
    defaultValues: {
      name: session?.user?.name || ''
    }
  });

  const onSubmit = async (data: NameSettingsForm) => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/user/settings/name', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update name');
      }

      const result = await response.json();
      const newSession = await updateSession({ name: result.newName });
      form.setValue('name', newSession?.user.name);
      toast.success('Name updated successfully');
      setIsEditing(false);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to update name');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    setIsEditing(false);
  };

  return (
    <section className="bg-white rounded-lg shadow p-6">
      {!isEditing ? (
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-500 mb-1">Name</div>
            <div className="text-lg font-medium text-gray-900">{session?.user?.name}</div>
          </div>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-500 rounded-md hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <IconEdit size={16} className="text-indigo-600" />
            Edit name
          </button>
        </div>
      ) : (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <TextInput
            label="Name"
            {...form.register('name', { required: 'Name is required' })}
            error={form.formState.errors.name?.message}
            disabled={isLoading}
          />

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
