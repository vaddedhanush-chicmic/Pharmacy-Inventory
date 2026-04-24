import { type ReactNode } from 'react';

interface DataTableProps {
  headers: {
    key: string;
    label: string;
    className?: string;
    align?: 'left' | 'center' | 'right';
  }[];
  rows: {
    id: string;
    data: Record<string, ReactNode>;
    rowClass?: string;
  }[];
  isLoading?: boolean;
  loadingRows?: number;
  emptyState?: ReactNode;
  onRowClick?: (rowId: string) => void;
  children?: ReactNode; // For custom table body content
}

export function DataTable({
  headers,
  rows,
  isLoading = false,
  loadingRows = 5,
  emptyState,
  onRowClick,
  children,
}: DataTableProps) {
  const getAlignClass = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-left';
    }
  };

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            {headers.map(header => (
              <th key={header.key} className={`${getAlignClass(header.align)} ${header.className || ''}`}>
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {children}
          {!children && isLoading && (
            <>
              {Array.from({ length: loadingRows }).map((_, i) => (
                <tr key={`skeleton-${i}`}>
                  {headers.map(header => (
                    <td key={header.key}>
                      <div className="h-6 skeleton" />
                    </td>
                  ))}
                </tr>
              ))}
            </>
          )}
          {!children && !isLoading && rows.length === 0 && emptyState && (
            <tr>
              <td colSpan={headers.length}>{emptyState}</td>
            </tr>
          )}
          {!children &&
            !isLoading &&
            rows.map(row => (
              <tr
                key={row.id}
                className={row.rowClass}
                onClick={() => onRowClick?.(row.id)}
                style={onRowClick ? { cursor: 'pointer' } : undefined}
              >
                {headers.map(header => (
                  <td key={header.key} className={getAlignClass(header.align)}>
                    {row.data[header.key]}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
