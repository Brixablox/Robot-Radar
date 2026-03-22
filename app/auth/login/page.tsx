"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '16px 20px',
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(148,163,184,0.2)',
  borderRadius: '12px',
  color: 'white',
  fontSize: '1rem',
  transition: 'all 0.2s ease',
};

const buttonStyle: React.CSSProperties = {
  width: '100%',
  padding: '16px',
  borderRadius: '12px',
  border: 'none',
  color: '#04111f',
  fontSize: '1.05rem',
  fontWeight: 700,
  transition: 'all 0.2s ease',
};

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      let data;
      if (!res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          data = await res.json();
          throw new Error(data?.error || `HTTP ${res.status}`);
        } else {
          const text = await res.text();
          console.error('Login API returned non-JSON:', res.status, text.slice(0, 200));
          throw new Error(`Server error (${res.status}) - check console. Likely missing DATABASE_URL`);
        }
      }

      data = await res.json();

      router.push('/profile');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at top, #123456 0%, #0B1020 35%, #060b16 100%)',
      padding: '40px 20px',
    }}>
      <div style={{
        background: 'rgba(8, 22, 38, 0.9)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(34, 211, 238, 0.2)',
        borderRadius: '24px',
        padding: '48px',
        maxWidth: '420px',
        width: '100%',
        boxShadow: '0 25px 80px rgba(0,0,0,0.4)',
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          background: 'linear-gradient(135deg, #67e8f9 0%, #22d3ee 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: 0,
          marginBottom: '32px',
          textAlign: 'center',
        }}>
          Log In
        </h1>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#e2e8f0', fontWeight: 600 }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={inputStyle}
              placeholder="Enter username"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#e2e8f0', fontWeight: 600 }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              placeholder="Enter password"
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '12px',
              padding: '12px 16px',
              color: '#f87171',
              textAlign: 'center',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...buttonStyle,
              background: loading ? 'rgba(34, 211, 238, 0.4)' : 'linear-gradient(135deg, #22d3ee, #0891b2)',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Logging In...' : 'Log In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', color: '#94a3b8', fontSize: '0.95rem' }}>
          No account?{' '}
          <a href="/auth/signup" style={{ color: '#67e8f9', textDecoration: 'none', fontWeight: 600 }}>
            Sign up
          </a>
        </p>
      </div>
    </main>
  );
}
