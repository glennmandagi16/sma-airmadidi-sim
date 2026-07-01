import { useState, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { Check, Save, Trash2, AlertCircle } from 'lucide-react';
import { INITIAL_STUDENTS, INITIAL_SUBJECTS, INITIAL_GRADES } from '../utils/mockData';
import { apiGetSiswa, apiGetMapel } from '../utils/api';

const GuruDashboard = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [subjects, setSubjects] = useState(INITIAL_SUBJECTS);
  const [rawGrades, setGrades] = useLocalStorage('sma_grades', INITIAL_GRADES);

  // Safe check for data migration (if old object format exists in localStorage)
  const grades = Array.isArray(rawGrades) ? rawGrades : INITIAL_GRADES;

  useEffect(() => {
    if (!Array.isArray(rawGrades)) {
      setGrades(INITIAL_GRADES);
    }
  }, [rawGrades, setGrades]);

  useEffect(() => {
    const loadApiData = async () => {
      try {
        const [siswaData, mapelData] = await Promise.all([
          apiGetSiswa(),
          apiGetMapel()
        ]);
        setStudents(siswaData);
        setSubjects(mapelData);
      } catch (e) {
        console.error('Failed to load data from API, using fallback:', e);
      }
    };
    loadApiData();
  }, []);

  // Filter subjects taught by this teacher
  const teacherSubjects = user?.subjects && user.subjects.length > 0
    ? subjects.filter(s => user.subjects.includes(s.name))
    : subjects;

  const [selectedSubject, setSelectedSubject] = useState(() => {
    return teacherSubjects[0] || subjects[0] || { id: 1, name: 'Matematika', class: 'XII' };
  });

  // Sync selected subject if the teacher/subjects list changes
  useEffect(() => {
    if (teacherSubjects.length > 0) {
      const exists = teacherSubjects.some(s => s.id === selectedSubject?.id);
      if (!exists) {
        setSelectedSubject(teacherSubjects[0]);
      }
    }
  }, [user, subjects]);

  const classStudents = students.filter(s => s.class === selectedSubject?.class);

  // Local grades state for batch editing
  const [localGrades, setLocalGrades] = useState({});

  useEffect(() => {
    if (!selectedSubject) return;
    const initialLocal = {};
    classStudents.forEach(student => {
      const record = grades.find(g => g.studentId === student.id && g.subjectId === selectedSubject.id);
      initialLocal[student.id] = record ? record.score : '';
    });
    setLocalGrades(initialLocal);
  }, [selectedSubject, grades, students]);

  const handleGradeChange = (studentId, val) => {
    setLocalGrades(prev => ({
      ...prev,
      [studentId]: val === '' ? '' : Math.min(100, Math.max(0, parseInt(val) || 0))
    }));
  };

  const handleSaveAll = () => {
    if (!selectedSubject) return;
    let updatedGrades = [...grades];
    
    Object.keys(localGrades).forEach(studentIdStr => {
      const studentId = parseInt(studentIdStr);
      const score = localGrades[studentIdStr];
      const idx = updatedGrades.findIndex(g => g.studentId === studentId && g.subjectId === selectedSubject.id);

      if (idx !== -1) {
        if (score === '') {
          // Delete
          updatedGrades = updatedGrades.filter((_, i) => i !== idx);
        } else {
          // Update
          updatedGrades[idx] = {
            ...updatedGrades[idx],
            score: parseInt(score),
            date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
            teacherId: user?.id || 201
          };
        }
      } else {
        if (score !== '') {
          // Create
          updatedGrades.push({
            studentId,
            subjectId: selectedSubject.id,
            score: parseInt(score),
            date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
            teacherId: user?.id || 201
          });
        }
      }
    });

    setGrades(updatedGrades);
    alert(`Semua nilai untuk mata pelajaran ${selectedSubject.name} (${selectedSubject.class}) berhasil disimpan!`);
  };

  const handleResetGrade = (studentId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus nilai siswa ini?')) {
      setLocalGrades(prev => ({ ...prev, [studentId]: '' }));
      setGrades(grades.filter(g => !(g.studentId === studentId && g.subjectId === selectedSubject.id)));
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ marginLeft: '320px', padding: '40px', width: '100%', minHeight: '100vh' }}>
        <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Penginputan Nilai</h1>
            <p style={{ color: 'var(--text-muted)' }}>
              Mata Pelajaran: {selectedSubject?.name || '-'} - Kelas: {selectedSubject?.class || '-'}
            </p>
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: '8px' }}>
            Guru Pengampu: <strong>{user?.name}</strong>
          </div>
        </header>

        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Pilih Mapel:</span>
              <select 
                value={selectedSubject?.id || ''}
                onChange={(e) => setSelectedSubject(subjects.find(s => s.id === parseInt(e.target.value)))}
                style={{
                  background: 'var(--card-bg)',
                  color: 'white',
                  border: '1px solid var(--border)',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                {teacherSubjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.class})</option>)}
              </select>
            </div>
            <button 
              onClick={handleSaveAll}
              style={{ 
                background: 'var(--success)', 
                color: 'white', 
                padding: '10px 20px', 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Save size={18} /> Simpan Semua Nilai
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px' }}>ID Siswa</th>
                <th style={{ padding: '12px' }}>Nama Siswa</th>
                <th style={{ padding: '12px' }}>Kelas</th>
                <th style={{ padding: '12px', width: '150px' }}>Nilai Akhir</th>
                <th style={{ padding: '12px' }}>Status Kelulusan</th>
                <th style={{ padding: '12px', textAlign: 'center', width: '100px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {classStudents.map(student => {
                const currentScore = localGrades[student.id];
                const isGraded = currentScore !== '' && currentScore !== undefined;
                return (
                  <tr key={student.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{student.studentId}</td>
                    <td style={{ padding: '12px', fontWeight: '600' }}>{student.name}</td>
                    <td style={{ padding: '12px' }}>{student.class}</td>
                    <td style={{ padding: '12px' }}>
                      <input 
                        type="number" 
                        value={currentScore !== undefined ? currentScore : ''} 
                        onChange={(e) => handleGradeChange(student.id, e.target.value)}
                        placeholder="Nilai"
                        style={{ width: '80px', textAlign: 'center', padding: '6px' }}
                        min="0"
                        max="100"
                      />
                    </td>
                    <td style={{ padding: '12px' }}>
                      {!isGraded ? (
                        <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem' }}>
                          <AlertCircle size={14} /> Belum Dinilai
                        </span>
                      ) : currentScore >= 75 ? (
                        <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem', fontWeight: '600' }}>
                          <Check size={14} /> Tuntas
                        </span>
                      ) : (
                        <span style={{ color: 'var(--danger)', fontSize: '0.875rem', fontWeight: '600' }}>Remedial</span>
                      )}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      {isGraded && (
                        <button 
                          onClick={() => handleResetGrade(student.id)}
                          style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '6px 12px', borderRadius: '6px' }}
                          title="Hapus Nilai"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {classStudents.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Tidak ada siswa di kelas {selectedSubject?.class}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GuruDashboard;
