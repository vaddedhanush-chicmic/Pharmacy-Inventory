type BadgeVariant = 'green' | 'red' | 'amber' | 'blue' | 'teal';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ label, variant = 'blue', className = '' }: BadgeProps) {
  const variantClass = `badge-${variant}`;
  return (
    <span className={`badge ${variantClass} ${className}`}>
      {label}
    </span>
  );
}

// Helper component for stock status badges
export function StockBadge({
  expired,
  expiring,
  lowStock,
  outOfStock,
}: {
  expired?: boolean;
  expiring?: boolean;
  lowStock?: boolean;
  outOfStock?: boolean;
}) {
  if (expired) return <Badge label="Expired" variant="red" />;
  if (expiring) return <Badge label="Expiring" variant="amber" />;
  if (lowStock) return <Badge label="Low Stock" variant="amber" />;
  if (outOfStock) return <Badge label="Out" variant="red" />;
  return <Badge label="In Stock" variant="green" />;
}
