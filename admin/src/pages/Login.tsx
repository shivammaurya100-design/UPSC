import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../hooks/useAdmin';

export default function Login() {
  const [secret, setSecret] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAdmin();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secret.trim()) { setError('Please enter the admin secret'); return; }
    setLoading(true);
    setError('');
    const ok = await login(secret.trim());
    setLoading(false);
    if (ok) {
      navigate('/');
    } else {
      setError('Invalid admin secret. Please check your .env file and try again.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">A</div>
        <h1 className="login-title">Admin Login</h1>
        <p className="login-subtitle">UPSC Pathfinder Super Admin Panel</p>

        {error && <div className="login-error">{error}</div>}

        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label" htmlFor="secret">Admin Secret</label>
            <input
              id="secret"
              type="password"
              className="form-input"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Enter admin secret..."
              autoFocus
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
          >
            {loading ? 'Verifying...' : 'Sign In'}
          </button>
        </form>

        <p style={{ marginTop: 20, fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          The admin secret is set via the <code style={{ background: 'var(--surface-2)', padding: '1px 4px', borderRadius: 3 }}>ADMIN_SECRET</code> environment variable in your server's <code style={{ background: 'var(--surface-2)', padding: '1px 4px', borderRadius: 3 }}>.env</code> file.
        </p>
      </div>
    </div>
  );
}
