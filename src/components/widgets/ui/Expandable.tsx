"use client";

import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { IconPlus } from '@/res/icons';

interface ExpandableProps {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
}

export default function Expandable({ 
  title, 
  children, 
  defaultExpanded = false,
  className = ''
}: ExpandableProps) {
  return (
    <Disclosure defaultOpen={defaultExpanded}>
      {({ open }) => (
        <div className={className}>
          <div className={`bg-gray3 border border-gray3 rounded-2xl ${!open && 'hover:bg-gray2 transition-colors'}`}>
            <DisclosureButton
              className="w-full p-5"
            >
              <div className="flex justify-between items-center">
                <div className="text-left flex-1">
                  {title}
                </div>

                <IconPlus
                  className={`w-7 transition transform ${open && 'rotate-45'}`}
                  alt="x"
                />
              </div>
            </DisclosureButton>

            <DisclosurePanel className="border-t border-gray3 p-5">
              {children}
            </DisclosurePanel>
          </div>
        </div>
      )}
    </Disclosure>
  );
}
