import { useState, useEffect, useCallback } from 'react';
import { useAdmin } from '../hooks/useAdmin';
import { getFlashcards, createFlashcard, updateFlashcard, deleteFlashcard } from '../lib/adminApi';
import Modal from '../components/ui/Modal';
import Select from '../components/ui/Select';
import FlashcardForm from '../components/forms/FlashcardForm';
import type { Flashcard } from '../types/admin';
import { TOPIC_OPTIONS } from '../types/admin';

export default function Flashcards() {
  const { token } = useAdmin();
  const [items, setItems] = useState<Flashcard[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [topicFilter, setTopicFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Flashcard | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deleting, setDeleting] = useState<Flashcard | null>(null);
  const limit = 20;

  const load = useCallback(() => {
    if (!token) return;
    setLoading(true);
    getFlashcards(token, { topic: topicFilter || undefined, page })
      .then((res) => { setItems(res.data); setTotal(res.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token, page, topicFilter]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (data: any) => {
    await createFlashcard(token!, data);
    setShowAdd(false);
    setPage(1);
    load();
  };

  const handleUpdate = async (data: any) => {
    await updateFlashcard(token!, editing!.id, data);
    setEditing(null);
    load();
  };

  const handleDelete = async () => {
    await deleteFlashcard(token!, deleting!.id);
    setDeleting(null);
    load();
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Flashcards</h1>
          <p className="page-subtitle">{total} total flashcards</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add Flashcard
        </button>
      </div>

      <div className="page-content">
        <div className="data-table-wrap">
          <div className="table-toolbar">
            <Select
              value={topicFilter}
              onChange={(e) => { setTopicFilter(e.target.value); setPage(1); }}
              options={TOPIC_OPTIONS}
              placeholder="Filter by topic..."
            />
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>Loading...</div>
          ) : items.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M10 9v6M14 9v6" />
              </svg>
              <p>No flashcards found</p>
              <button className="btn btn-primary" onClick={() => setShowAdd(true)}>Add the first flashcard</button>
            </div>
          ) : (
            <>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Front</th>
                    <th>Back</th>
                    <th>Topic</th>
                    <th>SRS (EF / Interval)</th>
                    <th style={{ width: 100 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((f) => (
                    <tr key={f.id}>
                      <td><span className="cell-truncate" style={{ maxWidth: 220 }} title={f.front}>{f.front}</span></td>
                      <td><span className="cell-truncate" style={{ maxWidth: 220 }} title={f.back}>{f.back}</span></td>
                      <td><span className="badge badge-accent">{f.topic_id}</span></td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                        {f.ease_factor.toFixed(1)} / {f.interval}d
                      </td>
                      <td>
                        <div className="table-actions">
                          <button className="btn-icon" title="Edit" onClick={() => setEditing(f)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button className="btn-icon" title="Delete" onClick={() => setDeleting(f)} style={{ color: 'var(--danger)' }}>
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
        <Modal title="Add Flashcard" onClose={() => setShowAdd(false)}>
          <FlashcardForm onSubmit={handleCreate} onCancel={() => setShowAdd(false)} />
        </Modal>
      )}

      {editing && (
        <Modal title="Edit Flashcard" onClose={() => setEditing(null)}>
          <FlashcardForm initial={editing} onSubmit={handleUpdate} onCancel={() => setEditing(null)} />
        </Modal>
      )}

      {deleting && (
        <Modal title="Delete Flashcard" onClose={() => setDeleting(null)} size="sm"
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setDeleting(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            </>
          }
        >
          <p>Are you sure you want to delete this flashcard?</p>
          <p style={{ marginTop: 8, color: 'var(--text-secondary)', fontSize: 13 }}>{deleting.front}</p>
        </Modal>
      )}
    </>
  );
}
