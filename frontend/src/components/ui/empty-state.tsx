import { type LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <Icon size={48} className="mb-4 opacity-30 text-[var(--text-muted)]" />
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{title}</h3>
      {description && (
        <p className="text-[var(--text-muted)] mb-6 max-w-sm">{description}</p>
      )}
      {action && (
        <button onClick={action.onClick} className="btn btn-primary mt-2">
          {action.label}
        </button>
      )}
    </div>
  );
}
