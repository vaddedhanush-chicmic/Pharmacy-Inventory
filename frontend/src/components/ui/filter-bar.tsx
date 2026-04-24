import { type ReactNode } from 'react';

interface FilterBarProps {
  children: ReactNode;
  className?: string;
}

export function FilterBar({ children, className = '' }: FilterBarProps) {
  return (
    <div className={`flex flex-wrap items-center gap-4 mb-5 ${className}`}>
      {children}
    </div>
  );
}

interface TabFilterProps {
  tabs: {
    id: string;
    label: string;
    icon?: any;
  }[];
  activeTab: string;
  onChange: (tabId: string) => void;
}

export function TabFilter({ tabs, activeTab, onChange }: TabFilterProps) {
  return (
    <div className="flex border border-[var(--border-input)] rounded-lg p-0.5 gap-0.5">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
            activeTab === tab.id
              ? 'bg-[var(--accent)] text-white'
              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-table-stripe)]'
          }`}
        >
          {tab.icon && <tab.icon size={12} />}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
