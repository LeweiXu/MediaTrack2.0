import { useState, useEffect, useCallback } from 'react';
import { getEntries, updateEntry } from '../api.jsx';
import { statusLabel, fmtDate, progressPercent, progressLabel, extractItems, MEDIUMS, STATUSES, ORIGINS } from '../utils.jsx';
import AddEntryModal from './components/AddEntryModal.jsx';
import EntryDetailModal from './components/EntryDetailModal.jsx';

const SORT_FIELDS = [
  { key: 'title',        label: 'Title' },
  { key: 'medium',       label: 'Medium' },
  { key: 'rating',       label: 'Rating' },
  { key: 'status',       label: 'Status' },
  { key: 'year',         label: 'Year' },
  { key: 'updated_at',   label: 'Updated' },
  { key: 'completed_at', label: 'Completed' },
];

const LIMIT = 40;

export default function Library({ initialFilters = {} }) {
  const [entries,      setEntries]      = useState([]);
  const [total,        setTotal]        = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [counts,       setCounts]       = useState({});
  const [showAdd,      setShowAdd]      = useState(false);
  const [detailEntry,  setDetailEntry]  = useState(null);

  const [search,       setSearch]       = useState(initialFilters.title  || '');
  const [statusFilter, setStatusFilter] = useState(initialFilters.status || '');
  const [mediumFilter, setMediumFilter] = useState(initialFilters.medium || '');
  const [originFilter, setOriginFilter] = useState(initialFilters.origin || '');
  const [sort,         setSort]         = useState('title');
  const [order,        setOrder]        = useState('asc');
  const [page,         setPage]         = useState(1);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = {
        ...(search       && { title:  search }),
        ...(statusFilter && { status: statusFilter }),
        ...(mediumFilter && { medium: mediumFilter }),
        ...(originFilter && { origin: originFilter }),
        sort, order, limit: LIMIT, offset: (page - 1) * LIMIT,
      };

      const data  = await getEntries(params);
      const items = extractItems(data);
      setEntries(items);
      setTotal(data?.total ?? items.length);

      // build sidebar counts on first unfiltered load
      if (page === 1 && !search) {
        const allData = await getEntries({ limit: 2000 }).catch(() => data);
        const all     = extractItems(allData);
        const c = { _total: all.length };
        all.forEach(e => {
          c[e.status] = (c[e.status] || 0) + 1;
          if (e.medium) c[e.medium] = (c[e.medium] || 0) + 1;
        });
        setCounts(c);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, mediumFilter, originFilter, sort, order, page]);

  // reset to page 1 when filters/sort change
  useEffect(() => { setPage(1); }, [search, statusFilter, mediumFilter, originFilter, sort, order]);
  useEffect(() => { load(); }, [load]);

  function handleSort(field) {
    if (sort === field) setOrder(o => o === 'asc' ? 'desc' : 'asc');
    else { setSort(field); setOrder('asc'); }
  }

  async function handleStatusChange(id, newStatus) {
    try {
      await updateEntry(id, { status: newStatus });
      setEntries(es => es.map(e => e.id === id ? { ...e, status: newStatus } : e));
    } catch (e) {
      alert('Update failed: ' + e.message);
    }
  }

  const handleUpdated = (updated) => {
    setEntries(es => es.map(e => e.id === updated.id ? updated : e));
    setDetailEntry(updated);
  };
  const handleDeleted = (id) => { setEntries(es => es.filter(e => e.id !== id)); setTotal(t => t - 1); setDetailEntry(null); };

  const clearFilters = () => { setSearch(''); setStatusFilter(''); setMediumFilter(''); setOriginFilter(''); };
  const hasFilters   = search || statusFilter || mediumFilter || originFilter;
  const totalPages   = Math.ceil(total / LIMIT);

  const SortTh = ({ field, children }) => (
    <th className="sortable"
      onClick={() => handleSort(field)}
      style={{ color: sort === field ? 'var(--accent)' : undefined }}>
      {children}
      {sort === field && <span style={{ marginLeft: 4, opacity: 0.7 }}>{order === 'asc' ? '↑' : '↓'}</span>}
    </th>
  );

  function exportCSV() {
    const rows = [
      ['Title','Medium','Origin','Year','Status','Rating','Progress','Total'],
      ...entries.map(e => [e.title, e.medium, e.origin, e.year, e.status, e.rating, e.progress, e.total]),
    ].map(r => r.map(v => `"${v ?? ''}"`).join(',')).join('\n');
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([rows], { type: 'text/csv' })),
      download: 'library.csv',
    });
    a.click();
  }

  return (
    <div className="layout-3col">
      {/* ── Left sidebar ── */}
      <div className="sidebar-left">
        <div className="sidebar-section">
          <span className="sidebar-label">Status</span>
          {[['', 'All'], ['current','Current'], ['planned','Planned'],
            ['completed','Completed'], ['on_hold','On Hold'], ['dropped','Dropped']
          ].map(([v, l]) => (
            <div key={v}
              className={`sidebar-item${statusFilter === v ? ' active' : ''}`}
              onClick={() => setStatusFilter(v)}>
              {l}
              <span className="sidebar-count">{v === '' ? (counts._total || 0) : (counts[v] || 0)}</span>
            </div>
          ))}
        </div>

        <div className="sidebar-divider" />

        <div className="sidebar-section">
          <span className="sidebar-label">Medium</span>
          <div className={`sidebar-item${mediumFilter === '' ? ' active' : ''}`} onClick={() => setMediumFilter('')}>All</div>
          {MEDIUMS.map(m => (
            <div key={m} className={`sidebar-item${mediumFilter === m ? ' active' : ''}`} onClick={() => setMediumFilter(m)}>
              {m} <span className="sidebar-count">{counts[m] || 0}</span>
            </div>
          ))}
        </div>

        <div className="sidebar-divider" />

        <div className="sidebar-section">
          <span className="sidebar-label">Origin</span>
          <div className={`sidebar-item${originFilter === '' ? ' active' : ''}`} onClick={() => setOriginFilter('')}>All</div>
          {ORIGINS.map(o => (
            <div key={o} className={`sidebar-item${originFilter === o ? ' active' : ''}`} onClick={() => setOriginFilter(o)}>
              {o}
            </div>
          ))}
        </div>
      </div>

      {/* ── Main ── */}
      <div className="main-content">
        <div className="page-head">
          <div className="page-head-left">
            <span className="page-title">Library</span>
            <span className="page-desc">{total} entries</span>
          </div>
          <button className="btn" onClick={() => setShowAdd(true)}>+ Add Entry</button>
        </div>

        <div className="filter-bar">
          <input placeholder="Search titles…" value={search} style={{ width: 200 }}
            onChange={e => setSearch(e.target.value)} />
          <select value={sort} onChange={e => setSort(e.target.value)}>
            {SORT_FIELDS.map(f => <option key={f.key} value={f.key}>Sort: {f.label}</option>)}
          </select>
          <button className="icon-btn" style={{ padding: '5px 10px' }}
            onClick={() => setOrder(o => o === 'asc' ? 'desc' : 'asc')}>
            {order === 'asc' ? '↑ Asc' : '↓ Desc'}
          </button>
          {hasFilters && (
            <button className="icon-btn" onClick={clearFilters}>✕ Clear</button>
          )}
          <span className="filter-count">{loading ? '…' : `${entries.length} shown`}</span>
        </div>

        {error && (
          <div className="state-block">
            <div className="state-title">Error</div>
            <div className="state-detail">{error}</div>
            <button className="btn btn-outline" style={{ marginTop: 12 }} onClick={load}>Retry</button>
          </div>
        )}

        {!error && loading && (
          <div className="state-block">
            <span className="loading-dots">Loading library</span>
          </div>
        )}

        {!error && !loading && entries.length === 0 && (
          <div className="state-block">
            <div className="state-title">No entries found</div>
            <div className="state-detail">Try adjusting your filters.</div>
          </div>
        )}

        {!error && !loading && entries.length > 0 && (
          <>
              <table className="media-table">
              <thead>
                <tr>
                  <SortTh field="title">Title</SortTh>
                  <SortTh field="medium">Medium</SortTh>
                  <SortTh field="year">Year</SortTh>
                  <th>Progress</th>
                  <SortTh field="status">Status</SortTh>
                  <SortTh field="rating">Rating</SortTh>
                  <SortTh field="updated_at">Updated</SortTh>
                  <SortTh field="completed_at">Completed</SortTh>
                </tr>
              </thead>
              <tbody>
                {entries.map(e => {
                  const pct = progressPercent(e);
                  return (
                    <tr key={e.id} style={{ cursor: 'pointer' }} onClick={() => setDetailEntry(e)}>
                      <td>
                        <div className="cover-cell">
                          <div className="cover-thumb">
                            {e.cover_url && (
                              <img src={e.cover_url} alt=""
                                onError={ev => { ev.target.style.display = 'none'; }} />
                            )}
                          </div>
                          <span className="media-name">{e.title}</span>
                        </div>
                      </td>
                      <td><span style={{ color: 'var(--dim)' }}>{e.medium}</span></td>
                      <td><span style={{ color: 'var(--dim)' }}>{e.year || '—'}</span></td>
                      <td>
                        <div className="progress-cell">
                          {progressLabel(e)}
                          {pct > 0 && (
                            <div className="progress-mini">
                              <div className="progress-mini-fill" style={{ width: `${pct}%` }} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td onClick={ev => ev.stopPropagation()}>
                        <select className="inline-select" value={e.status}
                          onChange={ev => handleStatusChange(e.id, ev.target.value)}>
                          {STATUSES.map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
                        </select>
                      </td>
                      <td>
                        <span className="rating-cell">
                          {e.rating != null ? e.rating : '—'}<span>/10</span>
                        </span>
                      </td>
                      <td><span style={{ color: 'var(--dim)' }}>{fmtDate(e.updated_at)}</span></td>
                      <td><span style={{ color: 'var(--dim)' }}>{fmtDate(e.completed_at)}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', paddingBottom: 16 }}>
                <button className="icon-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                <span style={{ fontSize: 11, color: 'var(--dim)' }}>Page {page} of {totalPages}</span>
                <button className="icon-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Right sidebar ── */}
      <div className="sidebar-right">
        <p className="panel-title">Sort</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 18 }}>
          {SORT_FIELDS.map(f => (
            <div key={f.key} className="sidebar-item"
              style={{ padding: '4px 0', fontSize: 11 }}
              onClick={() => handleSort(f.key)}>
              {f.label}
              {sort === f.key && (
                <span style={{ color: 'var(--accent)' }}>{order === 'asc' ? ' ↑' : ' ↓'}</span>
              )}
            </div>
          ))}
        </div>

        <p className="panel-title">Export</p>
        <button className="icon-btn" style={{ textAlign: 'left', padding: '6px 10px', width: '100%' }}
          onClick={exportCSV}>
          Export CSV (this view)
        </button>

        <div style={{ marginTop: 20 }}>
          <p className="panel-title">Showing</p>
          <div className="stat-box" style={{ marginBottom: 8 }}>
            <span className="stat-val">{entries.length}</span>
            <span className="stat-lbl">Entries</span>
          </div>
          {statusFilter && (
            <div style={{ fontSize: 11, color: 'var(--dim)', marginTop: 6 }}>
              Filter: <span style={{ color: 'var(--accent)' }}>{statusLabel(statusFilter)}</span>
            </div>
          )}
          {mediumFilter && (
            <div style={{ fontSize: 11, color: 'var(--dim)', marginTop: 4 }}>
              Medium: <span style={{ color: 'var(--accent)' }}>{mediumFilter}</span>
            </div>
          )}
        </div>
      </div>

      {showAdd && (
        <AddEntryModal
          onClose={() => setShowAdd(false)}
          onCreated={() => { load(); setShowAdd(false); }}
        />
      )}

      {detailEntry && (
        <EntryDetailModal
          entry={detailEntry}
          onClose={() => setDetailEntry(null)}
          onUpdated={handleUpdated}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
