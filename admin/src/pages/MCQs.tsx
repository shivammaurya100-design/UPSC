import { useState, useEffect, useCallback } from 'react';
import { useAdmin } from '../hooks/useAdmin';
import { getMCQs, createMCQ, updateMCQ, deleteMCQ, bulkImportMCQs } from '../lib/adminApi';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import MCQForm from '../components/forms/MCQForm';
import type { MCQ } from '../types/admin';
import { TOPIC_OPTIONS } from '../types/admin';

export default function MCQs() {
  const { secret } = useAdmin();
  const [items, setItems] = useState<MCQ[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [topicFilter, setTopicFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<MCQ | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deleting, setDeleting] = useState<MCQ | null>(null);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkResult, setBulkResult] = useState<string>('');
  const limit = 20;

  const load = useCallback(() => {
    if (!secret) return;
    setLoading(true);
    getMCQs(secret, { topic: topicFilter || undefined, page, search: search || undefined })
      .then((res) => { setItems(res.data); setTotal(res.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [secret, page, topicFilter, search]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (data: any) => {
    await createMCQ(secret!, data);
    setShowAdd(false);
    setPage(1);
    load();
  };

  const handleUpdate = async (data: any) => {
    await updateMCQ(secret!, editing!.id, data);
    setEditing(null);
    load();
  };

  const handleDelete = async () => {
    await deleteMCQ(secret!, deleting!.id);
    setDeleting(null);
    load();
  };

  const handleBulk = async () => {
    if (!bulkFile) return;
    const text = await bulkFile.text();
    const items = JSON.parse(text);
    const res = await bulkImportMCQs(secret!, items);
    setBulkResult(`Imported ${res.imported} MCQs successfully!`);
    setBulkFile(null);
    setTimeout(() => { setBulkResult(''); load(); }, 2000);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">MCQs</h1>
          <p className="page-subtitle">{total} total MCQs</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <label className="btn btn-ghost" style={{ cursor: 'pointer' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Bulk Import
            <input type="file" accept=".json" style={{ display: 'none' }}
              onChange={(e) => { setBulkFile(e.target.files?.[0] ?? null); if (e.target.files?.[0]) handleBulk(); }} />
          </label>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add MCQ
          </button>
        </div>
      </div>

      <div className="page-content">
        {bulkResult && (
          <div style={{ background: 'var(--success-light)', color: 'var(--success)', padding: '10px 16px', borderRadius: 'var(--radius-sm)', marginBottom: 16, fontSize: 13 }}>
            {bulkResult}
          </div>
        )}

        <div className="data-table-wrap">
          <div className="table-toolbar">
            <Input
              placeholder="Search questions..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
            <Select
              value={topicFilter}
              onChange={(e) => { setTopicFilter(e.target.value); setPage(1); }}
              options={TOPIC_OPTIONS}
              placeholder="All topics"
            />
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>Loading...</div>
          ) : items.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M9 9h.01M15 9h.01" />
              </svg>
              <p>No MCQs found</p>
              <button className="btn btn-primary" onClick={() => setShowAdd(true)}>Add the first MCQ</button>
            </div>
          ) : (
            <>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Question</th>
                    <th>Topic</th>
                    <th>Source</th>
                    <th>Year</th>
                    <th style={{ width: 100 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((m) => (
                    <tr key={m.id}>
                      <td><span className="cell-truncate" title={m.question}>{m.question}</span></td>
                      <td>
                        <span className="badge badge-accent">{m.topic_id}</span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{m.source}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{m.year ?? '—'}</td>
                      <td>
                        <div className="table-actions">
                          <button className="btn-icon" title="Edit" onClick={() => setEditing(m)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button className="btn-icon" title="Delete" onClick={() => setDeleting(m)} style={{ color: 'var(--danger)' }}>
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
                  <span className="pagination-info">
                    Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
                  </span>
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
        <Modal title="Add New MCQ" onClose={() => setShowAdd(false)} size="lg">
          <MCQForm onSubmit={handleCreate} onCancel={() => setShowAdd(false)} />
        </Modal>
      )}

      {editing && (
        <Modal title="Edit MCQ" onClose={() => setEditing(null)} size="lg">
          <MCQForm initial={editing} onSubmit={handleUpdate} onCancel={() => setEditing(null)} />
        </Modal>
      )}

      {deleting && (
        <Modal title="Delete MCQ" onClose={() => setDeleting(null)} size="sm"
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setDeleting(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            </>
          }
        >
          <p>Are you sure you want to delete this MCQ? This action cannot be undone.</p>
          <p style={{ marginTop: 8, color: 'var(--text-secondary)', fontSize: 13 }}>{deleting.question}</p>
        </Modal>
      )}
    </>
  );
}
