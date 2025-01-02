'use client';

import clsx from 'clsx';
import { ReactNode } from 'react';

export interface Tab {
  id: string;
  label: string;
}

interface TabGroupProps<T extends Tab> {
  tabs: ReadonlyArray<T>;
  activeTab: string;
  onChange: (tabId: string) => void;
  children: ReactNode;
}

export default function TabGroup<T extends Tab>({
  tabs,
  activeTab,
  onChange,
  children,
}: TabGroupProps<T>) {
  return (
    <div>
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={clsx(
                'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium',
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              )}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}
