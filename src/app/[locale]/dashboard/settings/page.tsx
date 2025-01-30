'use client';

import React from 'react';
import ChangeNameForm from './components/ChangeNameForm';
import ChangePasswordForm from './components/ChangePasswordForm';

export default function DashboardSettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Profile Settings</h1>
      
      <div className="space-y-6">
        <ChangeNameForm />
        <ChangePasswordForm />
      </div>
    </div>
  );
}