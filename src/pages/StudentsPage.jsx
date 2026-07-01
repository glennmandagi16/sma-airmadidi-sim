import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import { Users, Search, Filter, GraduationCap, Plus, Edit, Trash2, X, Loader2, AlertCircle } from 'lucide-react';
import { apiGetSiswa, apiAddSiswa, apiUpdateSiswa, apiDeleteSiswa } from '../utils/api';

const StudentsPage = () => {
  const [students,     setStudents]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [apiError,     setApiError]     = useState(null);
  const [searchTerm,   setSearchTerm]   = useState('');
  const [selectedClass, setSelectedClass] = useState('Semua');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode,   setModalMode]   = useState('add');
  const [editId,      setEditId]      = useState(null);
  const [saving,      setSaving]      = useState(false);

  // Form states
  const [formName,     setFormName]     = useState('');
  const [formClass,    setFormClass]    = useState('XII');
  const [formNIS,      setFormNIS]      = useState('');
  const [formPassword, setFormPassword] = useState('');

  // ── Ambil data dari API ─────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      const data = await apiGetSiswa();
      setStudents(data);
    } catch (e) {
      setApiError('Tidak dapat terhubung ke server. Pastikan backend berjalan.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Modal helpers ───────────────────────────────────────────────────────────
  const openAddModal = () => {
    setModalMode('add'); setEditId(null);
    setFormName(''); setFormClass('XII'); setFormNIS(''); setFormPassword('');
    setIsModalOpen(true);
  };

  const openEditModal = (student) => {
    setModalMode('edit'); setEditId(student.id);
    setFormName(student.name); setFormClass(student.class);
    setFormNIS(student.studentId); setFormPassword(student.password || '');
    setIsModalOpen(true);
  };

  // ── CRUD ────────────────────────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    if (!formName.trim() || !formNIS.trim()) return;
    setSaving(true);
    try {
      const payload = {
        name:      formName,
        studentId: formNIS.trim(),
        class:     formClass,
        password:  formPassword || 'murid123',
      };
      if (modalMode === 'add') {
        await apiAddSiswa(payload);
      } else {
        await apiUpdateSiswa(editId, payload);
      }
      setIsModalOpen(false);
      await fetchData();
    } catch (e) {
      alert('Gagal menyimpan: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus siswa ini?')) return;
    try {
      await apiDeleteSiswa(id);
      await fetchData();
    } catch (e) {
      alert('Gagal menghapus: ' + e.message);
    }
  };

  // ── Filter ──────────────────────────────────────────────────────────────────
  const filteredStudents = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        s.studentId.includes(searchTerm);
    const matchClass  = selectedClass === 'Semua' || s.class === selectedClass;
    return matchSearch && matchClass;
  });

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ marginLeft: '320px', padding: '40px', width: '100%', minHeight: '100vh' }}>

        {/* Header */}
        <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Daftar Siswa</h1>
            <p style={{ color: 'var(--text-muted)' }}>Data Akademik Siswa SMA Kristen Airmadidi</p>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div className="glass-card" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Search size={18} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Cari nama atau NIS..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ border: 'none', background: 'transparent', padding: '4px', outline: 'none', color: 'white', width: '200px' }}
              />
            </div>
            <button
              onClick={openAddModal}
              style={{ background: 'var(--primary)', color: 'white', padding: '12px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}
            >
              <Plus size={18} /> Tambah Siswa
            </button>
          </div>
        </header>

        {/* Error Banner */}
        {apiError && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '14px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', color: '#f87171' }}>
            <AlertCircle size={20} />
            <span>{apiError}</span>
            <button onClick={fetchData} style={{ marginLeft: 'auto', background: 'rgba(239,68,68,0.2)', color: '#f87171', padding: '4px 12px', borderRadius: '6px', fontSize: '0.8rem' }}>
              Coba Lagi
            </button>
          </div>
        )}

        <div className="glass-card" style={{ padding: '24px', marginBottom: '32px' }}>
          {/* Filter Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Filter size={18} color="var(--text-muted)" />
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Filter Kelas:</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['Semua', 'X', 'XI', 'XII'].map(c => (
                  <button
                    key={c}
                    onClick={() => setSelectedClass(c)}
                    style={{
                      padding: '6px 16px', borderRadius: '20px', fontSize: '0.875rem',
                      background: selectedClass === c ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                      color: selectedClass === c ? 'white' : 'var(--text-muted)',
                      border: 'none', cursor: 'pointer', transition: '0.2s'
                    }}
                  >{c}</button>
                ))}
              </div>
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Menampilkan <strong>{filteredStudents.length}</strong> siswa
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
              <p>Memuat data siswa...</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {filteredStudents.map((student) => (
                <div key={student.id} className="glass-card fade-in" style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flex: 1 }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '15px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontSize: '1.5rem', fontWeight: 'bold' }}>
                      {student.name[0]}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '4px' }}>{student.name}</h4>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <GraduationCap size={14} /> Kelas {student.class}
                        </span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>NIS: {student.studentId}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => openEditModal(student)} style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '8px', borderRadius: '8px' }}>
                      <Edit size={14} />
                    </button>
                    <button onClick={() => handleDelete(student.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '8px', borderRadius: '8px' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {filteredStudents.length === 0 && !loading && (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  Tidak ada siswa yang ditemukan.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="glass-card fade-in" style={{ width: '90%', maxWidth: '500px', padding: '32px', position: 'relative' }}>
            <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', color: 'var(--text-muted)' }}>
              <X size={20} />
            </button>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '24px' }}>
              {modalMode === 'add' ? 'Tambah' : 'Edit'} Siswa
            </h3>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Nama Lengkap</label>
                <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} style={{ width: '100%' }} placeholder="Contoh: Budi Santoso" required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '8px' }}>NIS (Nomor Induk Siswa)</label>
                <input type="text" value={formNIS} onChange={(e) => setFormNIS(e.target.value)} style={{ width: '100%' }} placeholder="Contoh: 2024001" required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Password {modalMode === 'edit' && '(Kosongkan jika tidak diubah)'}</label>
                <input type="password" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} style={{ width: '100%' }} placeholder={modalMode === 'add' ? 'murid123' : '••••••••'} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Kelas</label>
                <select value={formClass} onChange={(e) => setFormClass(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid var(--border)', color: 'white', outline: 'none' }}>
                  <option>X</option><option>XI</option><option>XII</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'rgba(255,255,255,0.05)', color: 'white', padding: '10px 20px', borderRadius: '8px' }}>Batal</button>
                <button type="submit" disabled={saving} style={{ background: 'var(--primary)', color: 'white', padding: '10px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', opacity: saving ? 0.7 : 1 }}>
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

export default StudentsPage;
