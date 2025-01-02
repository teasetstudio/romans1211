import React from 'react';

export default function DashboardSettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Dashboard Settings</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Profile Settings</h2>
          <p className="text-gray-600">
            Update your personal information and change your password.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Notification Preferences</h2>
          <p className="text-gray-600">
            Manage how you receive notifications and alerts.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Privacy Settings</h2>
          <p className="text-gray-600">
            Control your privacy settings and data sharing preferences.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Account Management</h2>
          <p className="text-gray-600">
            View your account status and manage subscriptions.
          </p>
        </section>
      </div>
    </div>
  );
}
