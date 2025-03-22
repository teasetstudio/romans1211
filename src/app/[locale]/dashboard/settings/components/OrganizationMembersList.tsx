'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { IconTrash, IconEdit, IconCheck, IconX } from '@tabler/icons-react';

type OrganizationMember = {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  permissions: string[];
  organizationId: string;
};

type Organization = {
  id: string;
  name: string;
};

// Define the permission options
const permissionOptions = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'MANAGE', label: 'Manage' },
  { value: 'EDIT', label: 'Edit' },
  { value: 'VIEW', label: 'View' },
  { value: 'ADMIN_LIBRARY', label: 'Admin Library' },
  { value: 'MANAGE_LIBRARY', label: 'Manage Library' },
  { value: 'EDIT_LIBRARY', label: 'Edit Library' },
  { value: 'VIEW_LIBRARY', label: 'View Library' },
  { value: 'ADMIN_EVENT_COURSES', label: 'Admin Courses' },
  { value: 'MANAGE_EVENT_COURSES', label: 'Manage Courses' },
  { value: 'EDIT_EVENT_COURSES', label: 'Edit Courses' },
  { value: 'VIEW_EVENT_COURSES', label: 'View Courses' },
];

export default function OrganizationMembersList() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string>('');
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editPermissions, setEditPermissions] = useState<string[]>([]);

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
        if (data.length > 0) {
          setSelectedOrganizationId(data[0].id);
        }
      } catch (error) {
        console.error('Error fetching organizations:', error);
        toast.error('Failed to load organizations');
      }
    };

    fetchOrganizations();
  }, []);

  // Fetch members when organization changes
  useEffect(() => {
    if (!selectedOrganizationId) return;

    const fetchMembers = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/organization-members?organizationId=${selectedOrganizationId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch members');
        }
        const data = await response.json();
        setMembers(data);
      } catch (error) {
        console.error('Error fetching members:', error);
        toast.error('Failed to load members');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, [selectedOrganizationId]);

  const handleOrganizationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOrganizationId(e.target.value);
  };

  const startEditing = (member: OrganizationMember) => {
    setEditingMemberId(member.id);
    setEditPermissions([...member.permissions]);
  };

  const cancelEditing = () => {
    setEditingMemberId(null);
    setEditPermissions([]);
  };

  const handlePermissionChange = (permission: string) => {
    setEditPermissions(prev => {
      if (prev.includes(permission)) {
        return prev.filter(p => p !== permission);
      } else {
        return [...prev, permission];
      }
    });
  };

  const savePermissions = async (memberId: string) => {
    try {
      const response = await fetch(`/api/organization-members/${memberId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ permissions: editPermissions }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update permissions');
      }

      // Update the member in the local state
      setMembers(prev => 
        prev.map(member => 
          member.id === memberId 
            ? { ...member, permissions: editPermissions } 
            : member
        )
      );

      toast.success('Permissions updated successfully');
      cancelEditing();
    } catch (error) {
      console.error('Error updating permissions:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update permissions');
    }
  };

  const deleteMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) {
      return;
    }

    try {
      const response = await fetch(`/api/organization-members/${memberId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove member');
      }

      // Remove the member from the local state
      setMembers(prev => prev.filter(member => member.id !== memberId));
      toast.success('Member removed successfully');
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to remove member');
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-4">Organization Members</h2>
      
      <div className="mb-4">
        <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-1">
          Select Organization
        </label>
        <select
          id="organization"
          value={selectedOrganizationId}
          onChange={handleOrganizationChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          {organizations.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-4">Loading members...</div>
      ) : members.length === 0 ? (
        <div className="text-center py-4 text-gray-500">No members found for this organization.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permissions
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {members.map((member) => (
                <tr key={member.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{member.user.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{member.user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    {editingMemberId === member.id ? (
                      <div className="flex flex-wrap gap-2">
                        {permissionOptions.map((option) => (
                          <div key={option.value} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`edit-permission-${member.id}-${option.value}`}
                              checked={editPermissions.includes(option.value)}
                              onChange={() => handlePermissionChange(option.value)}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label
                              htmlFor={`edit-permission-${member.id}-${option.value}`}
                              className="ml-1 text-xs text-gray-900"
                            >
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {member.permissions.map((permission) => (
                          <span
                            key={permission}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800"
                          >
                            {permission}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {editingMemberId === member.id ? (
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => savePermissions(member.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Save"
                        >
                          <IconCheck size={18} />
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="text-red-600 hover:text-red-900"
                          title="Cancel"
                        >
                          <IconX size={18} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => startEditing(member)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit permissions"
                        >
                          <IconEdit size={18} />
                        </button>
                        <button
                          onClick={() => deleteMember(member.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Remove member"
                        >
                          <IconTrash size={18} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 