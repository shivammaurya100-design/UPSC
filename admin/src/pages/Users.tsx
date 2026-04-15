import { useState, useEffect, useCallback } from 'react';
import { useAdmin } from '../hooks/useAdmin';
import { getUsers, updateUser } from '../lib/adminApi';
import Modal from '../components/ui/Modal';
import Select from '../components/ui/Select';
import Input from '../components/ui/Input';
import type { UserProfile } from '../types/admin';

const STAGE_OPTIONS = [
  { value: 'prelims', label: 'Prelims' },
  { value: 'mains', label: 'Mains' },
  { value: 'interview', label: 'Interview' },
];

export default function Users() {
  const { token } = useAdmin();
  const [items, setItems] = useState<UserProfile[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<UserProfile | null>(null);
  const limit = 20;

  const load = useCallback(() => {
    if (!token) return;
    setLoading(true);
    getUsers(token, page)
      .then((res) => { setItems(res.data); setTotal(res.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token, page]);

  useEffect(() => { load(); }, [load]);

  const handleUpdate = async (data: { examStage?: string; optionalSubject?: string; targetYear?: number }) => {
    await updateUser(token!, editing!.id, data);
    setEditing(null);
    load();
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">{total} registered users</p>
        </div>
      </div>

      <div className="page-content">
        <div className="data-table-wrap">
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>Loading...</div>
          ) : items.length === 0 ? (
            <div className="empty-state">
              <p>No users found</p>
            </div>
          ) : (
            <>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Exam Stage</th>
                    <th>Target Year</th>
                    <th>Streak</th>
                    <th>XP</th>
                    <th>Accuracy</th>
                    <th>Joined</th>
                    <th style={{ width: 80 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((u) => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 500 }}>{u.name || '—'}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                      <td>
                        <span className="badge badge-accent">{u.exam_stage}</span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{u.target_year}</td>
                      <td>
                        <span style={{ color: 'var(--warning)', fontWeight: 600 }}>
                          {u.streak_days > 0 ? `🔥 ${u.streak_days}d` : '—'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{u.xp}</td>
                      <td style={{ color: u.practiceStats?.accuracy ? 'var(--success)' : 'var(--text-secondary)' }}>
                        {u.practiceStats?.accuracy != null ? `${u.practiceStats.accuracy}%` : '—'}
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <button className="btn-icon" title="Edit user" onClick={() => setEditing(u)}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
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

      {editing && (
        <Modal title="Edit User" onClose={() => setEditing(null)} size="sm">
          <EditUserForm user={editing} onSubmit={handleUpdate} onCancel={() => setEditing(null)} />
        </Modal>
      )}
    </>
  );
}

function EditUserForm({ user, onSubmit, onCancel }: {
  user: UserProfile;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}) {
  const [examStage, setExamStage] = useState<string>(user.exam_stage);
  const [optionalSubject, setOptionalSubject] = useState(user.optional_subject ?? '');
  const [targetYear, setTargetYear] = useState(user.target_year.toString());
  const [submitting, setSubmitting] = useState(false);

  const handle = async () => {
    setSubmitting(true);
    try {
      await onSubmit({
        examStage,
        optionalSubject: optionalSubject.trim() || undefined,
        targetYear: parseInt(targetYear),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Select
        id="examStage"
        label="Exam Stage"
        value={examStage}
        onChange={(e) => setExamStage(e.target.value)}
        options={STAGE_OPTIONS}
      />
      <Input
        id="optionalSubject"
        label="Optional Subject"
        value={optionalSubject}
        onChange={(e) => setOptionalSubject(e.target.value)}
        placeholder="Geography, History, etc."
      />
      <Input
        id="targetYear"
        label="Target Year"
        type="number"
        value={targetYear}
        onChange={(e) => setTargetYear(e.target.value)}
        min="2024"
        max="2035"
      />
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button className="btn btn-ghost" onClick={onCancel} disabled={submitting}>Cancel</button>
        <button className="btn btn-primary" onClick={handle} disabled={submitting}>
          {submitting ? 'Saving...' : 'Update User'}
        </button>
      </div>
    </>
  );
}
