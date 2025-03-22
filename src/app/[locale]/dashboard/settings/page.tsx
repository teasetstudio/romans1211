'use client';

import React, { useState } from 'react';
import ChangeNameForm from './components/ChangeNameForm';
import ChangePasswordForm from './components/ChangePasswordForm';
import AddOrganizationMemberForm from './components/AddOrganizationMemberForm';
import OrganizationMembersList from './components/OrganizationMembersList';

export default function DashboardSettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'organization'>('profile');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Settings</h1>
      
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'profile'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('organization')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'organization'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Organization
          </button>
        </nav>
      </div>
      
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <ChangeNameForm />
          <ChangePasswordForm />
        </div>
      )}
      
      {activeTab === 'organization' && (
        <div className="space-y-6">
          <AddOrganizationMemberForm />
          <OrganizationMembersList />
        </div>
      )}
    </div>
  );
}