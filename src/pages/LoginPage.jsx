import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogIn, GraduationCap } from 'lucide-react';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = login(username, password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      background: 'radial-gradient(circle at top left, #1e293b, #0f172a)'
    }}>
      <div className="glass-card fade-in" style={{
        width: '100%',
        maxWidth: '400px',
        padding: '2.5rem',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'var(--primary)',
            borderRadius: '16px',
            margin: '0 auto 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)'
          }}>
            <GraduationCap size={32} color="white" />
          </div>
          <h1 className="gradient-text" style={{ fontSize: '1.8rem', fontWeight: '800' }}>SIM Akademik</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>SMA Kristen Airmadidi</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Username</label>
            <input
              type="text"
              placeholder="Masukkan username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: '100%' }}
              required
            />
          </div>
          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%' }}
              required
            />
          </div>

          {error && <p style={{ color: 'var(--danger)', fontSize: '0.875rem' }}>{error}</p>}

          <button type="submit" style={{
            background: 'var(--primary)',
            color: 'white',
            padding: '12px',
            borderRadius: '8px',
            marginTop: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontSize: '1rem'
          }}>
            <LogIn size={18} /> Masuk ke Sistem
          </button>
        </form>

        <div style={{ marginTop: '2rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <p>Login Info Untuk Demo:</p>
          <p>Admin: admin / admin123</p>
          <p>Guru: guru / guru123</p>
          <p>Murid: murid / murid123</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
