import { useState, useEffect, useCallback } from 'react';
import { useAdmin } from '../hooks/useAdmin';
import { getArticles, createArticle, updateArticle, deleteArticle } from '../lib/adminApi';
import Modal from '../components/ui/Modal';
import Select from '../components/ui/Select';
import ArticleForm from '../components/forms/ArticleForm';
import type { NewsArticle } from '../types/admin';

const IMPORTANCE_OPTIONS = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export default function Articles() {
  const { token } = useAdmin();
  const [items, setItems] = useState<NewsArticle[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [importanceFilter, setImportanceFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<NewsArticle | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deleting, setDeleting] = useState<NewsArticle | null>(null);
  const limit = 20;

  const load = useCallback(() => {
    if (!token) return;
    setLoading(true);
    getArticles(token, { importance: importanceFilter || undefined, page })
      .then((res) => { setItems(res.data); setTotal(res.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token, page, importanceFilter]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (data: any) => {
    await createArticle(token!, data);
    setShowAdd(false);
    setPage(1);
    load();
  };

  const handleUpdate = async (data: any) => {
    await updateArticle(token!, editing!.id, data);
    setEditing(null);
    load();
  };

  const handleDelete = async () => {
    await deleteArticle(token!, deleting!.id);
    setDeleting(null);
    load();
  };

  const totalPages = Math.ceil(total / limit);

  const importanceBadge = (imp: string) => {
    if (imp === 'high') return <span className="badge badge-high">High</span>;
    if (imp === 'medium') return <span className="badge badge-medium">Medium</span>;
    return <span className="badge badge-low">Low</span>;
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Articles</h1>
          <p className="page-subtitle">{total} total articles</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add Article
        </button>
      </div>

      <div className="page-content">
        <div className="data-table-wrap">
          <div className="table-toolbar">
            <Select
              value={importanceFilter}
              onChange={(e) => { setImportanceFilter(e.target.value); setPage(1); }}
              options={IMPORTANCE_OPTIONS}
              placeholder="Filter by importance..."
            />
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>Loading...</div>
          ) : items.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14,2 14,8 20,8" />
              </svg>
              <p>No articles found</p>
              <button className="btn btn-primary" onClick={() => setShowAdd(true)}>Add the first article</button>
            </div>
          ) : (
            <>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Source</th>
                    <th>Importance</th>
                    <th>Tags</th>
                    <th>Published</th>
                    <th style={{ width: 100 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((a) => (
                    <tr key={a.id}>
                      <td><span className="cell-truncate" title={a.title}>{a.title}</span></td>
                      <td style={{ color: 'var(--text-secondary)' }}>{a.source || '—'}</td>
                      <td>{importanceBadge(a.importance)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {(a.tags ?? []).slice(0, 2).map((t) => (
                            <span key={t} className="badge badge-accent" style={{ fontSize: 10 }}>{t}</span>
                          ))}
                          {(a.tags ?? []).length > 2 && (
                            <span className="badge badge-accent" style={{ fontSize: 10 }}>+{a.tags.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                        {a.published_at ? new Date(a.published_at).toLocaleDateString() : '—'}
                      </td>
                      <td>
                        <div className="table-actions">
                          <button className="btn-icon" title="Edit" onClick={() => setEditing(a)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button className="btn-icon" title="Delete" onClick={() => setDeleting(a)} style={{ color: 'var(--danger)' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div className="pagination">
                  <span className="pagination-info">{(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}</span>
                  <div className="pagination-controls">
                    <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(page - 1)}>← Prev</button>
                    <button className="btn btn-ghost btn-sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next →</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showAdd && (
        <Modal title="Add Article" onClose={() => setShowAdd(false)} size="lg">
          <ArticleForm onSubmit={handleCreate} onCancel={() => setShowAdd(false)} />
        </Modal>
      )}

      {editing && (
        <Modal title="Edit Article" onClose={() => setEditing(null)} size="lg">
          <ArticleForm initial={editing} onSubmit={handleUpdate} onCancel={() => setEditing(null)} />
        </Modal>
      )}

      {deleting && (
        <Modal title="Delete Article" onClose={() => setDeleting(null)} size="sm"
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setDeleting(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            </>
          }
        >
          <p>Are you sure you want to delete this article?</p>
          <p style={{ marginTop: 8, color: 'var(--text-secondary)', fontSize: 13 }}>{deleting.title}</p>
        </Modal>
      )}
    </>
  );
}
