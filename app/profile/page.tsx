import { cookies } from 'next/headers';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

async function getUser() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('sessionToken')?.value;

  if (!sessionToken) {
    redirect('/auth/login');
  }

  let sessionData;
  try {
    const decoded = Buffer.from(sessionToken, 'base64').toString();
    sessionData = JSON.parse(decoded);
  } catch {
    redirect('/auth/login');
  }

  const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/profile`, {
    headers: {
      Cookie: `sessionToken=${sessionToken}`,
    },
  });

  if (!res.ok) {
    redirect('/auth/login');
  }

  const { user } = await res.json();
  return user;
}

export default async function Profile() {
  const user = await getUser();

  return (
    <main style={{
      minHeight: '100vh',
      padding: '80px 24px 40px',
      background: 'radial-gradient(circle at top, #123456 0%, #0B1020 35%, #060b16 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        background: 'rgba(8, 22, 38, 0.95)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(34, 211, 238, 0.3)',
        borderRadius: '28px',
        padding: '64px 48px',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 35px 100px rgba(0,0,0,0.5)',
        textAlign: 'center',
      }}>
        <div style={{
          width: '120px',
          height: '120px',
          background: 'linear-gradient(135deg, #67e8f9, #22d3ee)',
          borderRadius: '50%',
          margin: '0 auto 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '3rem',
          fontWeight: 700,
          color: '#04111f',
          boxShadow: '0 20px 60px rgba(103,232,249,0.3)',
        }}>
          {user.username.charAt(0).toUpperCase()}
        </div>

        <h1 style={{
          fontSize: '3rem',
          background: 'linear-gradient(135deg, #67e8f9 0%, #22d3ee 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: 0,
          marginBottom: '16px',
        }}>
          {user.username}
        </h1>

        <p style={{ color: '#94a3b8', marginBottom: '24px', fontSize: '1.1rem' }}>
          Role: <span style={{ color: '#67e8f9', fontWeight: 600 }}>{user.role}</span>
        </p>

        {user.teamNumber && (
          <div style={{
            background: 'rgba(34, 211, 238, 0.15)',
            border: '1px solid rgba(34, 211, 238, 0.3)',
            borderRadius: '16px',
            padding: '20px 32px',
            marginBottom: '32px',
            display: 'inline-block',
          }}>
            <span style={{ fontSize: '1.5rem', color: '#67e8f9', fontWeight: 700 }}>
              Team {user.teamNumber}
            </span>
          </div>
        )}

        {user.memberships?.[0]?.status && (
          <div style={{
            background: user.memberships[0].status === 'VERIFIED' 
              ? 'rgba(34, 197, 94, 0.2)' 
              : 'rgba(245, 158, 11, 0.2)',
            border: user.memberships[0].status === 'VERIFIED'
              ? '1px solid rgba(34, 197, 94, 0.4)'
              : '1px solid rgba(245, 158, 11, 0.4)',
            borderRadius: '12px',
            padding: '12px 24px',
            marginBottom: '32px',
            color: user.memberships[0].status === 'VERIFIED' ? '#22c55e' : '#f59e0b',
            fontWeight: 600,
          }}>
            Team Membership: {user.memberships[0].status} for Team {user.memberships[0].teamNumber}
          </div>
        )}

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <form action="/api/auth/logout" method="POST" style={{ margin: 0 }}>
            <button
              type="submit"
              style={{
                background: 'rgba(239, 68, 68, 0.9)',
                color: 'white',
                border: 'none',
                padding: '14px 28px',
                borderRadius: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 8px 25px rgba(239,68,68,0.3)',
              }}
            >
              Log Out
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
