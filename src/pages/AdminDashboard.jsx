import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import { UserPlus, BookOpen, Search, Trash2, Edit, X, Database, Download, Loader2, AlertCircle } from 'lucide-react';
import { INITIAL_SUBJECTS, INITIAL_GRADES } from '../utils/mockData';
import { exportToSql } from '../utils/sqlExport';
import {
  apiGetSiswa, apiAddSiswa, apiUpdateSiswa, apiDeleteSiswa,
  apiGetGuru, apiAddGuru, apiUpdateGuru, apiDeleteGuru,
  apiGetMapel,
} from '../utils/api';
import useLocalStorage from '../hooks/useLocalStorage';

const AdminDashboard = () => {
  // ── State data ─────────────────────────────────────────────────────────────
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState(INITIAL_SUBJECTS);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  // Grades masih dari localStorage untuk export SQL
  const [grades] = useLocalStorage('sma_grades', INITIAL_GRADES);

  const [exportSuccess, setExportSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // ── Modal states ────────────────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [formRole, setFormRole] = useState('GURU');
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  // ── Form states ─────────────────────────────────────────────────────────────
  const [formName, setFormName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formClass, setFormClass] = useState('XII');
  const [formSubjects, setFormSubjects] = useState([]);

  // ── Ambil data dari API ─────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      const [siswaData, guruData, mapelData] = await Promise.all([
        apiGetSiswa(),
        apiGetGuru(),
        apiGetMapel()
      ]);
      setStudents(siswaData);
      setTeachers(guruData);
      setSubjects(mapelData);
    } catch (e) {
      setApiError('Tidak dapat terhubung ke server. Pastikan backend berjalan.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Export SQL ──────────────────────────────────────────────────────────────
  const handleExportSql = async () => {
    try {
      const [latestSiswa, latestGuru, latestMapel] = await Promise.all([
        apiGetSiswa(), apiGetGuru(), apiGetMapel(),
      ]);
      exportToSql(latestSiswa, latestGuru, latestMapel, grades);
    } catch {
      exportToSql(students, teachers, subjects, grades);
    }
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  // ── Modal helpers ───────────────────────────────────────────────────────────
  const formattedSubjects = [...new Set(subjects.map(s => `${s.name} (${s.class})`))];

  const openAddModal = (role) => {
    setModalMode('add'); setFormRole(role || 'GURU'); setEditId(null);
    setFormName(''); setFormUsername(''); setFormPassword(''); setFormClass('XII'); setFormSubjects([]);
    setIsModalOpen(true);
  };

  const openEditModal = (user, role) => {
    setModalMode('edit'); setFormRole(role); setEditId(user.id);
    setFormName(user.name);
    setFormUsername(role === 'GURU' ? (user.username || '') : (user.studentId || ''));
    setFormPassword(user.password || '');
    setFormClass(user.class || 'XII');
    setFormSubjects(user.subjects || []);
    setIsModalOpen(true);
  };

  const toggleSubject = (subjectName) => {
    setFormSubjects(prev =>
      prev.includes(subjectName) ? prev.filter(s => s !== subjectName) : [...prev, subjectName]
    );
  };

  // ── CRUD ────────────────────────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    if (!formName.trim()) return;
    setSaving(true);
    try {
      if (formRole === 'GURU') {
        const payload = {
          name: formName,
          username: formUsername.trim() || formName.toLowerCase().replace(/\s+/g, ''),
          password: formPassword || 'guru123',
          subjects: formSubjects,
        };
        if (modalMode === 'add') {
          await apiAddGuru(payload);
        } else {
          await apiUpdateGuru(editId, payload);
        }
      } else {
        const payload = {
          name: formName,
          studentId: formUsername.trim() || Date.now().toString(),
          class: formClass,
          password: formPassword || 'murid123',
        };
        if (modalMode === 'add') {
          await apiAddSiswa(payload);
        } else {
          await apiUpdateSiswa(editId, payload);
        }
      }
      setIsModalOpen(false);
      await fetchData(); // Refresh dari server
    } catch (e) {
      alert('Gagal menyimpan: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, role) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus user ini?')) return;
    try {
      if (role === 'GURU') {
        await apiDeleteGuru(id);
      } else {
        await apiDeleteSiswa(id);
      }
      await fetchData();
    } catch (e) {
      alert('Gagal menghapus: ' + e.message);
    }
  };

  // ── Filter ──────────────────────────────────────────────────────────────────
  const filteredTeachers = teachers.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.username && t.username.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.studentId.includes(searchTerm)
  );

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ marginLeft: '320px', padding: '40px', width: '100%' }}>

        {/* Header */}
        <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Panel Admin</h1>
            <p style={{ color: 'var(--text-muted)' }}>Manajemen Data Pengguna SMA Kristen Airmadidi</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div className="glass-card" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Search size={18} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Cari user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ border: 'none', background: 'transparent', padding: '4px', outline: 'none', color: 'white' }}
              />
            </div>
            <button
              id="btn-export-sql"
              onClick={handleExportSql}
              title="Ekspor semua data ke file SQL"
              style={{
                background: exportSuccess ? 'rgba(34,197,94,0.2)' : 'rgba(99,102,241,0.15)',
                color: exportSuccess ? '#22c55e' : '#818cf8',
                border: `1px solid ${exportSuccess ? 'rgba(34,197,94,0.4)' : 'rgba(99,102,241,0.35)'}`,
                padding: '10px 18px', borderRadius: '10px',
                display: 'flex', alignItems: 'center', gap: '8px',
                fontWeight: '600', fontSize: '0.875rem', cursor: 'pointer',
                transition: 'all 0.3s ease', whiteSpace: 'nowrap'
              }}
            >
              {exportSuccess ? <Download size={18} /> : <Database size={18} />}
              {exportSuccess ? 'Berhasil Diunduh!' : 'Export SQL'}
            </button>
          </div>
        </header>

        {/* Error Banner */}
        {apiError && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '10px', padding: '14px 20px', marginBottom: '24px',
            display: 'flex', alignItems: 'center', gap: '12px', color: '#f87171'
          }}>
            <AlertCircle size={20} />
            <span>{apiError}</span>
            <button onClick={fetchData} style={{ marginLeft: 'auto', background: 'rgba(239,68,68,0.2)', color: '#f87171', padding: '4px 12px', borderRadius: '6px', fontSize: '0.8rem' }}>
              Coba Lagi
            </button>
          </div>
        )}

        {/* Stat Cards */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '32px' }}>
          <StatCard icon={<UserPlus />} label="Total Siswa" value={students.length.toString()} color="#6366f1" />
          <StatCard icon={<UserPlus />} label="Total Guru" value={teachers.length.toString()} color="#a855f7" />
          <StatCard icon={<BookOpen />} label="Mata Pelajaran" value={subjects.length.toString()} color="#22c55e" />
        </div>

        {/* Tabel Pengguna */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.25rem' }}>Manajemen Pengguna</h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => openAddModal('GURU')}
                style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', padding: '8px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(168, 85, 247, 0.3)' }}
              >
                <UserPlus size={18} /> + Guru
              </button>
              <button
                onClick={() => openAddModal('MURID')}
                style={{ background: 'var(--primary)', color: 'white', padding: '8px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <UserPlus size={18} /> + Siswa
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
              <p>Memuat data dari server...</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px' }}>Nama</th>
                  <th style={{ padding: '12px' }}>Username / NISN</th>
                  <th style={{ padding: '12px' }}>Role</th>
                  <th style={{ padding: '12px' }}>Detail Peran</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeachers.map(t => (
                  <TableRow
                    key={t.id}
                    name={t.name}
                    username={t.username || t.name.toLowerCase().replace(/\s+/g, '')}
                    role="GURU"
                    detail={t.subjects && t.subjects.length ? t.subjects.join(', ') : 'Belum mengajar'}
                    onEdit={() => openEditModal(t, 'GURU')}
                    onDelete={() => handleDelete(t.id, 'GURU')}
                  />
                ))}
                {filteredStudents.map(s => (
                  <TableRow
                    key={s.id}
                    name={s.name}
                    username={s.studentId}
                    role="MURID"
                    detail={`Kelas ${s.class}`}
                    onEdit={() => openEditModal(s, 'MURID')}
                    onDelete={() => handleDelete(s.id, 'MURID')}
                  />
                ))}
                {filteredTeachers.length === 0 && filteredStudents.length === 0 && !loading && (
                  <tr>
                    <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      Tidak ada pengguna ditemukan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div className="glass-card fade-in" style={{ width: '90%', maxWidth: '500px', padding: '32px', position: 'relative' }}>
            <button
              onClick={() => setIsModalOpen(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', color: 'var(--text-muted)' }}
            >
              <X size={20} />
            </button>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '24px' }}>
              {modalMode === 'add' ? 'Tambah' : 'Edit'} {formRole === 'GURU' ? 'Guru' : 'Siswa'}
            </h3>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Nama Lengkap</label>
                <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)}
                  style={{ width: '100%' }} placeholder="Contoh: Dr. John Doe" required />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  {formRole === 'GURU' ? 'Username' : 'NIS (Nomor Induk Siswa)'}
                </label>
                <input type="text" value={formUsername} onChange={(e) => setFormUsername(e.target.value)}
                  style={{ width: '100%' }}
                  placeholder={formRole === 'GURU' ? 'Contoh: johndoe' : 'Contoh: 2024099'} required />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Password {modalMode === 'edit' && '(Kosongkan jika tidak diubah)'}
                </label>
                <input type="password" value={formPassword} onChange={(e) => setFormPassword(e.target.value)}
                  style={{ width: '100%' }}
                  placeholder={modalMode === 'add' ? (formRole === 'GURU' ? 'guru123' : 'murid123') : '••••••••'} />
              </div>

              {formRole === 'MURID' ? (
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Kelas</label>
                  <select value={formClass} onChange={(e) => setFormClass(e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid var(--border)', color: 'white', outline: 'none' }}>
                    <option>X</option><option>XI</option><option>XII</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Mata Pelajaran yang Diajar</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '120px', overflowY: 'auto', padding: '10px', background: 'rgba(15, 23, 42, 0.3)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    {formattedSubjects.map(name => (
                      <label key={name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '6px' }}>
                        <input type="checkbox" checked={formSubjects.includes(name)} onChange={() => toggleSubject(name)} style={{ margin: 0 }} />
                        {name}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)}
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'white', padding: '10px 20px', borderRadius: '8px' }}>
                  Batal
                </button>
                <button type="submit" disabled={saving}
                  style={{ background: 'var(--primary)', color: 'white', padding: '10px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', opacity: saving ? 0.7 : 1 }}>
                  {saving && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div className="glass-card" style={{ flex: 1, padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${color}20`, color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {icon}
    </div>
    <div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{label}</p>
      <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{value}</p>
    </div>
  </div>
);

const TableRow = ({ name, username, role, detail, onEdit, onDelete }) => (
  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
    <td style={{ padding: '12px', fontWeight: '500' }}>{name}</td>
    <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{username}</td>
    <td style={{ padding: '12px' }}>
      <span style={{
        padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem',
        background: role === 'GURU' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(34, 197, 94, 0.2)',
        color: role === 'GURU' ? '#a855f7' : '#22c55e'
      }}>{role}</span>
    </td>
    <td style={{ padding: '12px', fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{detail}</td>
    <td style={{ padding: '12px', textAlign: 'right' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button onClick={onEdit} style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '6px', borderRadius: '6px' }}>
          <Edit size={16} />
        </button>
        <button onClick={onDelete} style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '6px', borderRadius: '6px' }}>
          <Trash2 size={16} />
        </button>
      </div>
    </td>
  </tr>
);

export default AdminDashboard;
