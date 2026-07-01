import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  FileEdit, 
  BarChart, 
  Settings, 
  LogOut, 
  GraduationCap 
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = {
    ADMIN: [
      { icon: <Users size={20} />, label: 'Manajemen User', path: '/' },
      { icon: <Users size={20} />, label: 'Daftar Siswa', path: '/students' },
      { icon: <BookOpen size={20} />, label: 'Mata Pelajaran', path: '/subjects' },
      { icon: <Settings size={20} />, label: 'Pengaturan', path: '/settings' },
    ],
    GURU: [
      { icon: <FileEdit size={20} />, label: 'Input Nilai', path: '/' },
      { icon: <Users size={20} />, label: 'Daftar Siswa', path: '/students' },
    ],
    MURID: [
      { icon: <BarChart size={20} />, label: 'Lihat Nilai', path: '/' },
    ]
  };

  const navItems = menuItems[role] || [];

  return (
    <div className="glass-card" style={{
      width: '280px',
      height: 'calc(100vh - 40px)',
      margin: '20px',
      padding: '2rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      zIndex: 100
    }}>
      <div 
        style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '3rem', cursor: 'pointer' }}
        onClick={() => navigate('/')}
      >
        <div style={{
          width: '36px',
          height: '36px',
          background: 'var(--primary)',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <GraduationCap size={20} color="white" />
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>SIM Akademik</h2>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <div 
              key={index} 
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                fontWeight: isActive ? '600' : '400',
                transition: 'all 0.2s'
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </div>
          );
        })}
      </div>

      <div style={{ paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem', padding: '0 8px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'var(--secondary)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '1.1rem'
          }}>
            {user?.name[0]}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontSize: '0.9rem', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{role}</p>
          </div>
        </div>
        
        <button onClick={logout} style={{
          width: '100%',
          padding: '12px',
          borderRadius: '12px',
          background: 'rgba(239, 68, 68, 0.1)',
          color: 'var(--danger)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          justifyContent: 'center'
        }}>
          <LogOut size={18} /> Keluar
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
