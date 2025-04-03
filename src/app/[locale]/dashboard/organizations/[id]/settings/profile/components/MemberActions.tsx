'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { OrganizationMember } from '@/components/contexts/OrganizationContext';
import { ROUTE_DASHBOARD_ORGANIZATIONS } from '@/res/routes';
import DeleteConfirmationPopup from '@/components/popups/DeleteConfirmationPopup';

interface MemberActionsProps {
  members: OrganizationMember[];
}

export default function MemberActions({ members }: MemberActionsProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [leavingMember, setLeavingMember] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLeave = (memberId: string) => {
    setLeavingMember(memberId);
  };

  const confirmLeave = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/organization-members/${leavingMember}/action?action=leave`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to leave organization`);
      }

      router.push(ROUTE_DASHBOARD_ORGANIZATIONS);
    } catch (error) {
      setLeavingMember(null);
      setLoading(false);
      toast.error(error instanceof Error ? error.message : `Failed to leave organization`);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow mt-8">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Member Actions</h2>
        <div className="space-y-4">
          <button
            onClick={() => {
              const currentMember = members.find(member => member.userId === session?.user?.id);
              if (currentMember) {
                handleLeave(currentMember.id);
              }
            }}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Leaving...' : 'Leave Organization'}
          </button>
        </div>
      </div>

      <DeleteConfirmationPopup
        isOpen={!!leavingMember}
        onClose={() => {
          setLeavingMember(null);
          setLoading(false);
        }}
        onConfirm={confirmLeave}
        confirmText="Are you sure <b>YOU</b> want to <b>LEAVE</b> the organization?"
        isDeleting={loading}
      />
    </div>
  );
} 