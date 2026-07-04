import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../store/AuthContext';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const usernameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const success = login(username, password);
    if (success) {
      navigate('/', { replace: true });
    } else {
      setIsLoading(false);
      setError('Invalid username or password.');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Sign In</h1>
        <p style={styles.subtitle}>V2 Phone Arcade — Inventory</p>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label htmlFor="login-username" style={styles.label}>Username</label>
            <input
              id="login-username"
              ref={usernameRef}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              autoComplete="username"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label htmlFor="login-password" style={styles.label}>Password</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              style={styles.input}
            />
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={isLoading}
            style={styles.button}
          >
            {isLoading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundImage: 'url(/login-bg.png)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    fontFamily: 'sans-serif',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '40px',
    width: '100%',
    maxWidth: '360px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
  },
  title: {
    margin: '0 0 4px 0',
    fontSize: '22px',
    fontWeight: 700,
    color: '#111',
  },
  subtitle: {
    margin: '0 0 24px 0',
    fontSize: '13px',
    color: '#888',
  },
  error: {
    margin: '0 0 16px 0',
    padding: '10px 12px',
    backgroundColor: '#fff2f2',
    border: '1px solid #fca5a5',
    borderRadius: '6px',
    fontSize: '13px',
    color: '#dc2626',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#444',
  },
  input: {
    padding: '9px 12px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    outline: 'none',
    color: '#111',
    backgroundColor: '#fff',
  },
  button: {
    marginTop: '4px',
    padding: '10px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#fff',
    backgroundColor: '#2563eb',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
};
