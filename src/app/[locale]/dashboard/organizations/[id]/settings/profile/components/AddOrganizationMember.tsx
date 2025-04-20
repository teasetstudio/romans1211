'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useParams } from "next/navigation";

interface AddOrganizationMemberProps {
  fetchMembers: () => Promise<void>;
}

export default function AddOrganizationMember({ fetchMembers }: AddOrganizationMemberProps) {
  const params = useParams();
  const [memberForm, setMemberForm] = useState({
    email: '',
    permissions: ["READ"] as string[]
  });
  const [addingMember, setAddingMember] = useState(false);
  
  // Handle permission toggle
  const togglePermission = (permission: string) => {
    setMemberForm(prev => {
      if (prev.permissions.includes(permission)) {
        return {
          ...prev,
          permissions: prev.permissions.filter(p => p !== permission)
        };
      } else {
        return {
          ...prev,
          permissions: [...prev.permissions, permission]
        };
      }
    });
  };
  
  // Add member function
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingMember(true);
    
    try {
      if (!memberForm.email) {
        throw new Error('Email is required');
      }
      
      if (memberForm.permissions.length === 0) {
        throw new Error('At least one permission must be selected');
      }
      
      const response = await fetch('/api/organization-members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationId: params.id,
          email: memberForm.email,
          permissions: memberForm.permissions,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add member');
      }
      
      toast.success('Member added successfully');
      setMemberForm({
        email: '',
        permissions: []
      });
      // Refresh the member list
      fetchMembers();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to add member');
    } finally {
      setAddingMember(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow mt-8">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Organization Member</h2>
        
        <form onSubmit={handleAddMember} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={memberForm.email}
              onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
              placeholder="Enter member's email"
            />
            <p className="mt-1 text-sm text-gray-500">
              The user must already be registered in the system.
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Permissions
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {/* General permissions */}
              <div className="bg-gray-50 p-3 rounded-md">
                <h3 className="font-medium mb-2 text-gray-800">General</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={memberForm.permissions.includes("ADMIN")}
                      onChange={() => togglePermission("ADMIN")}
                      className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span className="ml-2 text-sm text-gray-700">Admin</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={memberForm.permissions.includes("MANAGE")}
                      onChange={() => togglePermission("MANAGE")}
                      className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span className="ml-2 text-sm text-gray-700">Manage</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={memberForm.permissions.includes("CREATE")}
                      onChange={() => togglePermission("CREATE")}
                      className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span className="ml-2 text-sm text-gray-700">Create</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={memberForm.permissions.includes("EDIT")}
                      onChange={() => togglePermission("EDIT")}
                      className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span className="ml-2 text-sm text-gray-700">Edit</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={memberForm.permissions.includes("DELETE")}
                      onChange={() => togglePermission("DELETE")}
                      className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span className="ml-2 text-sm text-gray-700">Delete</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={true}
                      disabled
                      className="rounded h-4 w-4"
                    />
                    <span className="ml-2 text-sm text-gray-700">Read</span>
                  </label>
                </div>
              </div>
              
              {/* Library permissions */}
              {/* <div className="bg-gray-50 p-3 rounded-md">
                <h3 className="font-medium mb-2 text-gray-800">Library</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={memberForm.permissions.includes("ADMIN_LIBRARY")}
                      onChange={() => togglePermission("ADMIN_LIBRARY")}
                      className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span className="ml-2 text-sm text-gray-700">Admin</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={memberForm.permissions.includes("MANAGE_LIBRARY")}
                      onChange={() => togglePermission("MANAGE_LIBRARY")}
                      className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span className="ml-2 text-sm text-gray-700">Manage</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={memberForm.permissions.includes("CREATE_LIBRARY")}
                      onChange={() => togglePermission("CREATE_LIBRARY")}
                      className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span className="ml-2 text-sm text-gray-700">Create</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={memberForm.permissions.includes("EDIT_LIBRARY")}
                      onChange={() => togglePermission("EDIT_LIBRARY")}
                      className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span className="ml-2 text-sm text-gray-700">Edit</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={memberForm.permissions.includes("DELETE_LIBRARY")}
                      onChange={() => togglePermission("DELETE_LIBRARY")}
                      className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span className="ml-2 text-sm text-gray-700">Delete</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={memberForm.permissions.includes("READ_LIBRARY")}
                      onChange={() => togglePermission("READ_LIBRARY")}
                      className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span className="ml-2 text-sm text-gray-700">Read</span>
                  </label>
                </div>
              </div> */}
              
              {/* Courses permissions */}
              {/* <div className="bg-gray-50 p-3 rounded-md">
                <h3 className="font-medium mb-2 text-gray-800">Courses</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={memberForm.permissions.includes("ADMIN_COURSES")}
                      onChange={() => togglePermission("ADMIN_COURSES")}
                      className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span className="ml-2 text-sm text-gray-700">Admin</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={memberForm.permissions.includes("MANAGE_COURSES")}
                      onChange={() => togglePermission("MANAGE_COURSES")}
                      className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span className="ml-2 text-sm text-gray-700">Manage</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={memberForm.permissions.includes("CREATE_COURSES")}
                      onChange={() => togglePermission("CREATE_COURSES")}
                      className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span className="ml-2 text-sm text-gray-700">Create</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={memberForm.permissions.includes("EDIT_COURSES")}
                      onChange={() => togglePermission("EDIT_COURSES")}
                      className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span className="ml-2 text-sm text-gray-700">Edit</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={memberForm.permissions.includes("DELETE_COURSES")}
                      onChange={() => togglePermission("DELETE_COURSES")}
                      className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span className="ml-2 text-sm text-gray-700">Delete</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={memberForm.permissions.includes("READ_COURSES")}
                      onChange={() => togglePermission("READ_COURSES")}
                      className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span className="ml-2 text-sm text-gray-700">Read</span>
                  </label>
                </div>
              </div> */}
            </div>
          </div>
          
          <div className="flex justify-end pt-4 border-t">
            <button
              type="submit"
              disabled={addingMember}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {addingMember ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 