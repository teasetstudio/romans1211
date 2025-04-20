'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import DeleteConfirmationPopup from '@/components/popups/DeleteConfirmationPopup';
import { useOrganization, OrganizationMember } from '@/components/contexts/OrganizationContext';
import { useSession } from 'next-auth/react';


interface OrganizationMembersProps {
  members: OrganizationMember[];
  loadingMembers: boolean;
  afterRemoveMember: () => Promise<void>;
  isAdmin: boolean;
}

export default function OrganizationMembers({ 
  members, 
  loadingMembers,
  afterRemoveMember,
  isAdmin,
}: OrganizationMembersProps) {
  const { selectedOrganization } = useOrganization();
  const { data: session } = useSession();
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingMember, setEditingMember] = useState<OrganizationMember | null>(null);
  const [editingPermissions, setEditingPermissions] = useState<string[]>([]);

  const handleRemoveMember = async (memberId: string) => {
    setMemberToDelete(memberId);
  };

  const handleEditPermissions = (member: OrganizationMember) => {
    setEditingMember(member);
    setEditingPermissions([...member.permissions]);
  };

  const togglePermission = (permission: string) => {
    setEditingPermissions(prev => {
      if (prev.includes(permission)) {
        return prev.filter(p => p !== permission);
      } else {
        return [...prev, permission];
      }
    });
  };

  const handleUpdatePermissions = async () => {
    if (!editingMember) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/organization-members/${editingMember.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          permissions: editingPermissions,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update permissions');
      }

      toast.success('Permissions updated successfully');
      setEditingMember(null);
      // Refresh the member list
      await afterRemoveMember();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to update permissions');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!memberToDelete) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/organization-members/${memberToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to remove member');
      }

      toast.success('Member removed successfully');
      // Refresh the member list
      await afterRemoveMember();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove member');
    } finally {
      setMemberToDelete(null);
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow mt-8">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Organization Members</h2>
        {loadingMembers ? (
          <div className="text-center py-6">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
            <p className="mt-2 text-sm text-gray-500">Loading members...</p>
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-10 border rounded-lg bg-gray-50">
            <p className="text-gray-500">No members found in this organization.</p>
          </div>
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
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Permissions
                  </th>
                  {isAdmin && (
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {members.map((member) => (
                  <tr key={member.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{member.user.name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{member.user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {member.isAccepted ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {member.permissions.slice(0, 3).map((perm) => (
                          <span key={perm} className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                            {perm.replace(/_/g, ' ')}
                          </span>
                        ))}
                        {member.permissions.length > 3 && (
                          <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-800">
                            +{member.permissions.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    {isAdmin && member.userId !== session?.user?.id && selectedOrganization?.ownerId === session?.user?.id && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditPermissions(member)}
                          className="text-blue-600 hover:text-blue-900 mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Remove
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Permissions Modal */}
      <Dialog
        open={!!editingMember}
        onClose={() => setEditingMember(null)}
        className="relative z-50"
      >
        <DialogBackdrop 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm"
          aria-hidden="true"
        />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-2xl bg-white rounded-xl shadow-xl">
            {editingMember && 
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Edit Permissions for {editingMember.user.name || editingMember.user.email}
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {/* General permissions */}
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="font-medium mb-3 text-gray-800">General</h3>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={editingPermissions.includes("ADMIN")}
                          onChange={() => togglePermission("ADMIN")}
                          className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                        />
                        <span className="ml-2 text-sm text-gray-700">Admin</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={editingPermissions.includes("MANAGE")}
                          onChange={() => togglePermission("MANAGE")}
                          className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                        />
                        <span className="ml-2 text-sm text-gray-700">Manage</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={editingPermissions.includes("CREATE")}
                          onChange={() => togglePermission("CREATE")}
                          className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                        />
                        <span className="ml-2 text-sm text-gray-700">Create</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={editingPermissions.includes("EDIT")}
                          onChange={() => togglePermission("EDIT")}
                          className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                        />
                        <span className="ml-2 text-sm text-gray-700">Edit</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={editingPermissions.includes("DELETE")}
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
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setEditingMember(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdatePermissions}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            }
          </DialogPanel>
        </div>
        
      </Dialog>

      <DeleteConfirmationPopup
        isOpen={!!memberToDelete}
        onClose={() => {
          setMemberToDelete(null);
          setLoading(false);
        }}
        onConfirm={handleConfirmDelete}
        confirmText={`Are you sure you want to remove member ${members.find(member => member.id === memberToDelete)?.user.name} from the organization?`}
        isDeleting={loading}
      />
    </div>
  );
}
