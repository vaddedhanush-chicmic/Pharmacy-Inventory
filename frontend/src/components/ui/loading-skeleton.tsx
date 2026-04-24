interface SkeletonProps {
  className?: string;
  count?: number;
  height?: string;
}

export function Skeleton({ className = 'h-8 w-full', count = 1, height }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`${className} ${height || ''} skeleton my-2`} />
      ))}
    </>
  );
}

export function TableSkeleton({ rows = 5, columns = 7 }: { rows?: number; columns?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: columns }).map((_, j) => (
            <td key={j}>
              <div className="h-6 skeleton" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
