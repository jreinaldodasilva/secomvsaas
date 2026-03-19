import { useState, useMemo, useRef, useEffect, ReactNode } from 'react';
import { EmptyState } from '@/components/UI/EmptyState/EmptyState';
import { default as Skeleton } from '@/components/UI/Skeleton/Skeleton';
import { useTranslation } from '@/i18n';
import styles from './DataTable.module.css';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  total?: number;
  page?: number;
  limit?: number;
  isLoading?: boolean;
  onPageChange?: (page: number) => void;
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode | string;
  emptyAction?: { label: string; onClick: () => void } | React.ReactNode;
  onRowClick?: (item: T) => void;
  clientSort?: boolean;
  onSortChange?: (key: string, dir: 'asc' | 'desc') => void;
}

function TableSkeleton({ columns, rows = 5 }: { columns: number; rows?: number }) {
  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className={styles.th}><Skeleton width="80%" height="16px" /></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r} className={`${styles.tr} ${styles.skeletonRow}`}>
              {Array.from({ length: columns }).map((_, c) => (
                <td key={c} className={styles.td}><Skeleton width="90%" height="14px" /></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DataTable<T extends Record<string, any>>({
  columns, data, total = 0, page = 1, limit = 10,
  isLoading, onPageChange, onSearch, searchPlaceholder, emptyMessage, emptyIcon, emptyAction,
  onRowClick, clientSort = false, onSortChange,
}: DataTableProps<T>) {
  const { t } = useTranslation();
  const resolvedSearchPlaceholder = searchPlaceholder ?? t('common.search');
  const resolvedEmptyMessage = emptyMessage ?? t('common.noResults');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [search, setSearch] = useState('');
  const tableRef = useRef<HTMLTableElement>(null);
  const focusedRowRef = useRef(-1);

  const totalPages = Math.ceil(total / limit);

  const sorted = useMemo(() => {
    if (!clientSort || !sortKey) return data;
    return [...data].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      if (av == null || bv == null) return 0;
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir, clientSort]);

  useEffect(() => {
    if (!onRowClick) return;
    const handleKey = (e: KeyboardEvent) => {
      const rows = tableRef.current?.querySelectorAll<HTMLElement>('tbody tr');
      if (!rows?.length) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        focusedRowRef.current = Math.min(focusedRowRef.current + 1, rows.length - 1);
        rows[focusedRowRef.current].focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        focusedRowRef.current = Math.max(focusedRowRef.current - 1, 0);
        rows[focusedRowRef.current].focus();
      } else if ((e.key === 'Enter' || e.key === ' ') && focusedRowRef.current >= 0) {
        e.preventDefault();
        onRowClick(sorted[focusedRowRef.current]);
      }
    };
    const table = tableRef.current;
    table?.addEventListener('keydown', handleKey);
    return () => table?.removeEventListener('keydown', handleKey);
  }, [sorted, onRowClick]);

  const handleSort = (key: string) => {
    const nextDir = sortKey === key && sortDir === 'asc' ? 'desc' : 'asc';
    setSortKey(key);
    setSortDir(nextDir);
    if (!clientSort) onSortChange?.(key, nextDir);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    onSearch?.(value);
  };

  if (isLoading) return <TableSkeleton columns={columns.length} />;

  return (
    <div>
      {onSearch && (
        <div className={styles.search}>
          <input
            type="search"
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder={resolvedSearchPlaceholder}
            aria-label={resolvedSearchPlaceholder}
          />
        </div>
      )}

      {sorted.length === 0 ? (
        <EmptyState title={resolvedEmptyMessage} icon={emptyIcon} action={emptyAction} />
      ) : (
        <>
          <div className={styles.tableContainer}>
            <table className={styles.table} ref={tableRef}>
              <thead>
                <tr>
                  {columns.map(col => (
                    <th
                      key={col.key}
                      className={`${styles.th}${col.sortable ? ` ${styles.sortable}` : ''}`}
                      onClick={col.sortable ? () => handleSort(col.key) : undefined}
                      aria-sort={col.sortable && sortKey === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}
                    >
                      {col.header}
                      {col.sortable && sortKey === col.key && (
                        <span aria-hidden="true">{sortDir === 'asc' ? ' ↑' : ' ↓'}</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((item, i) => (
                  <tr
                    key={item.id || item._id || i}
                    className={`${styles.tr}${onRowClick ? ` ${styles.clickable}` : ''}`}
                    onClick={() => onRowClick?.(item)}
                    tabIndex={onRowClick ? 0 : undefined}
                    role={onRowClick ? 'button' : undefined}
                    onFocus={() => { focusedRowRef.current = i; }}
                  >
                    {columns.map(col => (
                      <td key={col.key} className={styles.td} data-label={col.header}>
                        {col.render ? col.render(item) : item[col.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && onPageChange && (
            <div className={styles.pagination}>
              <button disabled={page <= 1} onClick={() => onPageChange(page - 1)} aria-label={t('common.goToPage', { page: page - 1 })}>{t('common.previous')}</button>
              <span>{page} / {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} aria-label={t('common.goToPage', { page: page + 1 })}>{t('common.next')}</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
