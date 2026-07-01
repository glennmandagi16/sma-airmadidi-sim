import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { Settings, User, Bell, Shield, Save } from 'lucide-react';
import { INITIAL_TEACHERS, INITIAL_STUDENTS } from '../utils/mockData';

const SettingsPage = () => {
  const { user, role, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profil');
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: ''
  });

  // Password update states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        username: user.username || '',
        email: `${user.username}@smaairmadidi.sch.id`
      });
    }
  }, [user]);

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      updateUser({
        name: formData.name,
        username: formData.username
      });
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (!currentPassword || !newPassword) {
      setPasswordError('Semua field password harus diisi');
      return;
    }

    if (user.role === 'ADMIN') {
      if (currentPassword !== 'admin123') {
        setPasswordError('Password saat ini salah');
        return;
      }
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      return;
    }

    if (user.role === 'GURU') {
      const savedTeachers = localStorage.getItem('sma_teachers');
      const teachersList = savedTeachers ? JSON.parse(savedTeachers) : INITIAL_TEACHERS;
      const teacher = teachersList.find(t => t.id === user.id);
      const expectedPassword = teacher?.password || 'guru123';
      
      if (currentPassword !== expectedPassword) {
        setPasswordError('Password saat ini salah');
        return;
      }

      updateUser({ password: newPassword });
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
    } else if (user.role === 'MURID') {
      const savedStudents = localStorage.getItem('sma_students');
      const studentsList = savedStudents ? JSON.parse(savedStudents) : INITIAL_STUDENTS;
      const student = studentsList.find(s => s.id === user.id);
      const expectedPassword = student?.password || 'murid123';

      if (currentPassword !== expectedPassword) {
        setPasswordError('Password saat ini salah');
        return;
      }

      updateUser({ password: newPassword });
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profil':
        return (
          <div className="fade-in">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '24px' }}>Detail Profil</h3>
            <div style={{ display: 'flex', gap: '32px', marginBottom: '32px', alignItems: 'center' }}>
              <div style={{
                width: '100px', height: '100px', borderRadius: '50%', background: 'var(--secondary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 'bold'
              }}>
                {user?.name[0]}
              </div>
              <div>
                <button style={{ background: 'var(--primary)', color: 'white', padding: '10px 16px', borderRadius: '8px', fontSize: '0.875rem' }}>Ganti Foto</button>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '8px' }}>JPG, GIF atau PNG. Maksimal 2MB.</p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={labelStyle}>Nama Lengkap</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name} 
                    onChange={handleInputChange}
                    style={inputStyle} 
                  />
                </div>
                <div>
                  <label style={labelStyle}>Username</label>
                  <input 
                    type="text" 
                    name="username"
                    value={formData.username} 
                    onChange={handleInputChange}
                    style={inputStyle} 
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email} 
                  onChange={handleInputChange}
                  style={inputStyle} 
                />
              </div>
              <div>
                <label style={labelStyle}>Peran / Jabatan</label>
                <input type="text" value={role} disabled style={{ ...inputStyle, background: 'rgba(255,255,255,0.05)', cursor: 'not-allowed' }} />
              </div>
              
              {showSuccess && (
                <div style={{ 
                  padding: '12px', 
                  borderRadius: '8px', 
                  background: 'rgba(34, 197, 94, 0.1)', 
                  color: '#4ade80',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  ✅ Perubahan berhasil disimpan!
                </div>
              )}

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px', marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  style={{...saveButtonStyle, opacity: isSaving ? 0.7 : 1, cursor: isSaving ? 'not-allowed' : 'pointer'}}
                >
                  <Save size={18} /> {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        );
      case 'notifikasi':
        return (
          <div className="fade-in">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '24px' }}>Preferensi Notifikasi</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <NotificationToggle label="Email Notifikasi" description="Terima update akademik melalui email" active />
              <NotificationToggle label="Pengumuman Sekolah" description="Notifikasi untuk agenda dan libur sekolah" active />
              <NotificationToggle label="Update Nilai" description="Beritahu jika ada nilai baru diinput" />
            </div>
          </div>
        );
      case 'keamanan':
        return (
          <div className="fade-in">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '24px' }}>Keamanan Akun</h3>
            <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label style={labelStyle}>Password Saat Ini</label>
                <input 
                  type="password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  style={inputStyle} 
                  placeholder="••••••••" 
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Password Baru</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={inputStyle} 
                  placeholder="••••••••" 
                  required
                />
              </div>
              {passwordError && (
                <div style={{ color: 'var(--danger)', fontSize: '0.875rem' }}>
                  ❌ {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div style={{ color: 'var(--success)', fontSize: '0.875rem' }}>
                  ✅ Password berhasil diperbarui!
                </div>
              )}
              <button type="submit" style={{ background: 'var(--primary)', color: 'white', padding: '12px', borderRadius: '8px', width: 'fit-content' }}>Perbarui Password</button>
            </form>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', marginTop: '24px' }}>
              <p onClick={() => alert('Akun dinonaktifkan')} style={{ color: 'var(--danger)', cursor: 'pointer', fontSize: '0.875rem' }}>Nonaktifkan Akun Saya</p>
            </div>
          </div>
        );
      case 'aplikasi':
        return (
          <div className="fade-in">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '24px' }}>Tentang Aplikasi</h3>
            <div className="glass-card" style={{ padding: '20px', background: 'rgba(255,255,255,0.02)' }}>
              <p style={{ marginBottom: '12px' }}><strong>SIM Akademik SMA Kristen Airmadidi</strong></p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Versi: 1.0.0-build.2026</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '12px' }}>Aplikasi ini dikembangkan untuk memudahkan manajemen data siswa, nilai, dan kurikulum secara digital dan modern.</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ marginLeft: '320px', padding: '40px', width: '100%', minHeight: '100vh' }}>
        <header style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Pengaturan Sistem</h1>
          <p style={{ color: 'var(--text-muted)' }}>Konfigurasi akun dan profil sekolah SMA Kristen Airmadidi</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
          <div className="glass-card" style={{ padding: '16px', height: 'fit-content' }}>
            <SettingNavItem icon={<User size={18} />} label="Profil Saya" active={activeTab === 'profil'} onClick={() => setActiveTab('profil')} />
            <SettingNavItem icon={<Bell size={18} />} label="Notifikasi" active={activeTab === 'notifikasi'} onClick={() => setActiveTab('notifikasi')} />
            <SettingNavItem icon={<Shield size={18} />} label="Keamanan" active={activeTab === 'keamanan'} onClick={() => setActiveTab('keamanan')} />
            <SettingNavItem icon={<Settings size={18} />} label="Aplikasi" active={activeTab === 'aplikasi'} onClick={() => setActiveTab('aplikasi')} />
          </div>

          <div className="glass-card" style={{ padding: '32px' }}>
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

const NotificationToggle = ({ label, description, active }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
    <div>
      <p style={{ fontWeight: '600' }}>{label}</p>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{description}</p>
    </div>
    <div style={{
      width: '40px', height: '20px', borderRadius: '20px', background: active ? 'var(--primary)' : '#334155',
      position: 'relative', cursor: 'pointer'
    }}>
      <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'white', position: 'absolute', top: '2px', left: active ? '22px' : '2px', transition: '0.2s' }}></div>
    </div>
  </div>
);

const SettingNavItem = ({ icon, label, active, onClick }) => (
  <div onClick={onClick} style={{
    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px',
    background: active ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
    color: active ? 'var(--primary)' : 'var(--text-muted)',
    cursor: 'pointer', fontWeight: active ? '600' : '400', marginBottom: '8px', transition: '0.2s'
  }}>
    {icon} <span>{label}</span>
  </div>
);

const labelStyle = { display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '8px' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid var(--border)', color: 'white', outline: 'none' };
const saveButtonStyle = { background: 'var(--primary)', color: 'white', padding: '12px 24px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold' };

export default SettingsPage;
