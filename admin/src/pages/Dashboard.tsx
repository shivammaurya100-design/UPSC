import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../hooks/useAdmin';
import { getDashboard } from '../lib/adminApi';
import type { DashboardStats } from '../types/admin';

export default function Dashboard() {
  const { secret } = useAdmin();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentMCQs, setRecentMCQs] = useState<any[]>([]);
  const [recentArticles, setRecentArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!secret) return;
    getDashboard(secret).then((res) => {
      setStats(res.data.stats);
      setRecentMCQs(res.data.recentMCQs ?? []);
      setRecentArticles(res.data.recentArticles ?? []);
    }).catch(console.error).finally(() => setLoading(false));
  }, [secret]);

  const statItems = stats ? [
    { label: 'Total MCQs', value: stats.mcqs, color: 'var(--accent)', bg: 'var(--accent-light)' },
    { label: 'Flashcards', value: stats.flashcards, color: 'var(--warning)', bg: 'var(--warning-light)' },
    { label: 'Articles', value: stats.articles, color: 'var(--success)', bg: 'var(--success-light)' },
    { label: 'Users', value: stats.users, color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' },
    { label: 'Posts', value: stats.posts, color: '#06B6D4', bg: 'rgba(6,182,212,0.12)' },
  ] : [];

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of your UPSC Pathfinder content</p>
        </div>
      </div>

      <div className="page-content">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>Loading...</div>
        ) : (
          <>
            <div className="stat-grid">
              {statItems.map((s) => (
                <div key={s.label} className="stat-card">
                  <div className="stat-icon" style={{ background: s.bg }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke={s.color} strokeWidth="2">
                      <path d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                  </div>
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div className="data-table-wrap">
                <div className="section-header" style={{ padding: '16px 16px 12px' }}>
                  <span className="section-title">Recent MCQs</span>
                  <Link to="/mcqs" style={{ fontSize: 12, color: 'var(--accent)' }}>View all →</Link>
                </div>
                {recentMCQs.length === 0 ? (
                  <div className="empty-state" style={{ padding: 24 }}>
                    <p>No MCQs yet</p>
                  </div>
                ) : (
                  <div className="recent-list">
                    {recentMCQs.map((m) => (
                      <div key={m.id} className="recent-item">
                        <div className="recent-item-dot" />
                        <div className="recent-item-text">
                          <div className="recent-item-title">{m.question}</div>
                          <div className="recent-item-meta">
                            {m.topic_id} · {m.source}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="data-table-wrap">
                <div className="section-header" style={{ padding: '16px 16px 12px' }}>
                  <span className="section-title">Recent Articles</span>
                  <Link to="/articles" style={{ fontSize: 12, color: 'var(--accent)' }}>View all →</Link>
                </div>
                {recentArticles.length === 0 ? (
                  <div className="empty-state" style={{ padding: 24 }}>
                    <p>No articles yet</p>
                  </div>
                ) : (
                  <div className="recent-list">
                    {recentArticles.map((a) => (
                      <div key={a.id} className="recent-item">
                        <div className="recent-item-dot" />
                        <div className="recent-item-text">
                          <div className="recent-item-title">{a.title}</div>
                          <div className="recent-item-meta">
                            {a.source}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
              <Link to="/mcqs" className="btn btn-primary">Manage MCQs</Link>
              <Link to="/flashcards" className="btn btn-ghost">Manage Flashcards</Link>
              <Link to="/articles" className="btn btn-ghost">Manage Articles</Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}
