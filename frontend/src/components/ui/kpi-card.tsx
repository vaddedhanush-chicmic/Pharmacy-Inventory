import { type LucideIcon } from 'lucide-react';

type KPIVariant = 'default' | 'red' | 'amber' | 'green' | 'blue';

interface KPICardProps {
  icon?: LucideIcon;
  label: string;
  value: string | number;
  subtext?: string;
  variant?: KPIVariant;
  className?: string;
}

export function KPICard({
  icon: Icon,
  label,
  value,
  subtext,
  variant = 'default',
  className = '',
}: KPICardProps) {
  const variantClass = variant === 'default' ? '' : variant;

  return (
    <div className={`stat-card ${variantClass} ${className}`}>
      {Icon && (
        <div className="flex items-center gap-3 mb-2">
          <Icon size={18} className="text-[var(--text-muted)]" />
          <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
            {label}
          </span>
        </div>
      )}
      {!Icon && (
        <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide block mb-2">
          {label}
        </span>
      )}
      <p className="text-3xl font-bold text-[var(--text-primary)]">{value}</p>
      {subtext && <p className="text-xs text-[var(--text-muted)] mt-2">{subtext}</p>}
    </div>
  );
}
