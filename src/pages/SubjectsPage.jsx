import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import { BookOpen, Search, Plus, Trash2, Edit, Save, Loader2, AlertCircle } from 'lucide-react';
import { apiGetMapel, apiAddMapel, apiUpdateMapel, apiDeleteMapel } from '../utils/api';

const SubjectsPage = () => {
  const [subjects,    setSubjects]   = useState([]);
  const [loading,     setLoading]    = useState(true);
  const [apiError,    setApiError]   = useState(null);
  const [saving,      setSaving]     = useState(false);
  const [searchTerm,  setSearchTerm] = useState('');
  const [newSubject,  setNewSubject] = useState({ name: '', class: 'XII' });
  const [editId,      setEditId]     = useState(null);

  // ── Ambil data dari API ─────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      const data = await apiGetMapel();
      setSubjects(data);
    } catch (e) {
      setApiError('Tidak dapat terhubung ke server. Pastikan backend berjalan.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── CRUD ────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newSubject.name.trim()) return;
    setSaving(true);
    try {
      if (editId) {
        await apiUpdateMapel(editId, { name: newSubject.name, class: newSubject.class });
        setEditId(null);
      } else {
        await apiAddMapel({ name: newSubject.name, class: newSubject.class });
      }
      setNewSubject({ name: '', class: 'XII' });
      await fetchData();
    } catch (e) {
      alert('Gagal menyimpan: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (sub) => {
    setEditId(sub.id);
    setNewSubject({ name: sub.name, class: sub.class });
  };

  const cancelEdit = () => {
    setEditId(null);
    setNewSubject({ name: '', class: 'XII' });
  };

  const deleteSubject = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus mata pelajaran ini?')) return;
    try {
      await apiDeleteMapel(id);
      if (editId === id) cancelEdit();
      await fetchData();
    } catch (e) {
      alert('Gagal menghapus: ' + e.message);
    }
  };

  // ── Filter ──────────────────────────────────────────────────────────────────
  const filteredSubjects = subjects.filter(sub =>
    sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.class.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ marginLeft: '320px', padding: '40px', width: '100%', minHeight: '100vh' }}>

        {/* Header */}
        <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Manajemen Mata Pelajaran</h1>
            <p style={{ color: 'var(--text-muted)' }}>Kurikulum Akademik SMA Kristen Airmadidi</p>
          </div>
          <div className="glass-card" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Search size={18} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Cari mata pelajaran..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'transparent', padding: '4px', outline: 'none', color: 'white' }}
            />
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

        <div className="glass-card" style={{ padding: '32px', marginBottom: '32px' }}>
          {/* Form Tambah/Edit */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem' }}>
                {editId ? 'Ubah Mata Pelajaran' : 'Daftar Mata Pelajaran'}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                {editId ? 'Perbarui informasi mata pelajaran' : 'List kurikulum aktif per kelas'}
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Nama Mapel</label>
                <input
                  type="text"
                  placeholder="Contoh: Kimia"
                  value={newSubject.name}
                  onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                  style={{ padding: '10px', width: '180px', borderRadius: '8px' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Kelas</label>
                <select
                  value={newSubject.class}
                  onChange={(e) => setNewSubject({ ...newSubject, class: e.target.value })}
                  style={{ padding: '10px', borderRadius: '8px', background: 'var(--bg-dark)', color: 'white', border: '1px solid var(--border)', cursor: 'pointer' }}
                >
                  <option>X</option><option>XI</option><option>XII</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {editId && (
                  <button type="button" onClick={cancelEdit} style={{ background: 'rgba(255,255,255,0.05)', color: 'white', padding: '12px 20px', borderRadius: '8px', fontWeight: '600' }}>
                    Batal
                  </button>
                )}
                <button type="submit" disabled={saving} style={{ background: 'var(--primary)', color: 'white', padding: '12px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', opacity: saving ? 0.7 : 1 }}>
                  {saving
                    ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    : editId ? <Save size={18} /> : <Plus size={18} />
                  }
                  {saving ? 'Menyimpan...' : editId ? 'Simpan' : 'Tambah Mapel'}
                </button>
              </div>
            </form>
          </div>

          {/* List Mapel */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
              <p>Memuat data mata pelajaran...</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {['X', 'XI', 'XII'].map(classGrade => {
                const classSubs = filteredSubjects.filter(sub => sub.class === classGrade);
                return (
                  <div key={classGrade} style={{ 
                    background: 'rgba(255, 255, 255, 0.01)', 
                    padding: '20px', 
                    borderRadius: '12px', 
                    border: '1px solid rgba(255, 255, 255, 0.03)' 
                  }}>
                    <h3 style={{ 
                      fontSize: '1.15rem', 
                      fontWeight: 'bold', 
                      marginBottom: '16px', 
                      color: 'var(--primary)', 
                      borderLeft: '4px solid var(--primary)', 
                      paddingLeft: '10px' 
                    }}>
                      Kelas {classGrade}
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                      {classSubs.map((sub) => (
                        <div key={sub.id} className="glass-card fade-in" style={{
                          padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          transition: 'transform 0.2s',
                          border: editId === sub.id ? '1px solid var(--primary)' : '1px solid var(--border)'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                              <BookOpen size={18} />
                            </div>
                            <div>
                              <h4 style={{ fontSize: '1rem', fontWeight: '600' }}>{sub.name}</h4>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button onClick={() => startEdit(sub)} style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
                              <Edit size={14} />
                            </button>
                            <button onClick={() => deleteSubject(sub.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                      {classSubs.length === 0 && (
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', padding: '10px' }}>
                          Belum ada mata pelajaran untuk Kelas {classGrade}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubjectsPage;
