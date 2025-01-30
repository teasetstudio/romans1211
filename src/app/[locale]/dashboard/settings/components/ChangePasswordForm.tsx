'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import TextInput from '@/components/inputs/TextInput';

interface PasswordSettingsForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ChangePasswordForm() {
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);
  const [isLoadingReset, setIsLoadingReset] = useState(false);
  
  const form = useForm<PasswordSettingsForm>();

  const onSubmit = async (data: PasswordSettingsForm) => {
    try {
      setIsLoadingPassword(true);
      
      if (data.newPassword !== data.confirmPassword) {
        toast.error('New passwords do not match');
        return;
      }

      const response = await fetch('/api/user/settings/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update password');
      }

      toast.success('Password updated successfully');
      form.reset();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to update password');
    } finally {
      setIsLoadingPassword(false);
    }
  };

  const handlePasswordReset = async () => {
    try {
      setIsLoadingReset(true);
      
      const response = await fetch('/api/user/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send reset email');
      }

      toast.success('Password reset email sent. Please check your inbox.');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to send reset email');
    } finally {
      setIsLoadingReset(false);
    }
  };

  return (
    <section className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-semibold mb-4">Change Password</h2>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <TextInput
          type="password"
          label="Current Password"
          {...form.register('currentPassword', {
            required: 'Current password is required'
          })}
          error={form.formState.errors.currentPassword?.message}
          disabled={isLoadingPassword}
        />

        <TextInput
          type="password"
          label="New Password"
          {...form.register('newPassword', {
            required: 'New password is required',
            minLength: {
              value: 8,
              message: 'Password must be at least 8 characters'
            }
          })}
          error={form.formState.errors.newPassword?.message}
          disabled={isLoadingPassword}
        />

        <TextInput
          type="password"
          label="Confirm New Password"
          {...form.register('confirmPassword', {
            required: 'Please confirm your password',
            validate: (value) => 
              value === form.watch('newPassword') || 'Passwords do not match'
          })}
          error={form.formState.errors.confirmPassword?.message}
          disabled={isLoadingPassword}
        />

        <div className="flex justify-between items-center">
          <button
            type="submit"
            disabled={isLoadingPassword}
            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoadingPassword ? 'Updating...' : 'Update Password'}
          </button>

          <button
            type="button"
            onClick={handlePasswordReset}
            disabled={isLoadingReset}
            className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
          >
            {isLoadingReset ? 'Sending...' : 'Forgot Password?'}
          </button>
        </div>
      </form>
    </section>
  );
}
