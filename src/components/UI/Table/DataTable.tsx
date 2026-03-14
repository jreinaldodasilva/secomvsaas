import { useState, useMemo, ReactNode } from 'react';
import { Spinner } from '../Loading/Loading';
import { EmptyState } from '../EmptyState/EmptyState';
import { t } from '../../../i18n';

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
}

export function DataTable<T extends Record<string, any>>({
  columns, data, total = 0, page = 1, limit = 10,
  isLoading, onPageChange, onSearch, searchPlaceholder = t('common.search'), emptyMessage = t('common.noResults'),
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [search, setSearch] = useState('');

  const totalPages = Math.ceil(total / limit);

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      if (av == null || bv == null) return 0;
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    onSearch?.(value);
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="data-table">
      {onSearch && (
        <div className="data-table-search" style={{ marginBottom: 12 }}>
          <input
            type="text"
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
          />
        </div>
      )}

      {sorted.length === 0 ? (
        <EmptyState title={emptyMessage} />
      ) : (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {columns.map(col => (
                  <th
                    key={col.key}
                    onClick={col.sortable ? () => handleSort(col.key) : undefined}
                    style={{ cursor: col.sortable ? 'pointer' : 'default', textAlign: 'left', padding: '8px 12px', borderBottom: '2px solid #eee' }}
                  >
                    {col.header}
                    {col.sortable && sortKey === col.key && (sortDir === 'asc' ? ' ↑' : ' ↓')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((item, i) => (
                <tr key={(item as any).id || (item as any)._id || i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  {columns.map(col => (
                    <td key={col.key} style={{ padding: '8px 12px' }}>
                      {col.render ? col.render(item) : item[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && onPageChange && (
            <div className="data-table-pagination" style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
              <button disabled={page <= 1} onClick={() => onPageChange(page - 1)}>{t('common.previous')}</button>
              <span>{page} / {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>{t('common.next')}</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
