'use client';

import ChangeNameForm from './components/ChangeNameForm';
import ChangePasswordForm from './components/ChangePasswordForm';

export default function DashboardSettingsPage() {

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Settings</h1>
      
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <span
            className="py-4 px-1 border-b-2 font-medium text-sm border-indigo-500 text-indigo-600"
          >
            Profile
          </span>
          
        </nav>
      </div>
      
      <div className="space-y-6">
        <ChangeNameForm />
        <ChangePasswordForm />
      </div>
    </div>
  );
}