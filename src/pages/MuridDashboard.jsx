import { useEffect, useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { BarChart, Award, Book } from 'lucide-react';
import { INITIAL_GRADES, INITIAL_SUBJECTS, INITIAL_TEACHERS } from '../utils/mockData';
import { apiGetGuru, apiGetMapel, apiGetNilai } from '../utils/api';

const MuridDashboard = () => {
  const { user } = useAuth();
  const [rawGrades, setGrades] = useLocalStorage('sma_grades', INITIAL_GRADES);
  const [subjects, setSubjects] = useState(INITIAL_SUBJECTS);
  const [teachers, setTeachers] = useState(INITIAL_TEACHERS);
  const [apiGrades, setApiGrades] = useState(null);

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
        const [guruData, mapelData, nilaiData] = await Promise.all([
          apiGetGuru(),
          apiGetMapel(),
          apiGetNilai()
        ]);
        setTeachers(guruData);
        setSubjects(mapelData);
        setApiGrades(nilaiData);
      } catch (e) {
        console.error('Failed to load data from API, using fallback:', e);
      }
    };
    loadApiData();
  }, []);

  // Match grades where studentId equals logged-in user id
  let myGrades = [];
  if (apiGrades !== null) {
    const studentApiGrades = apiGrades.filter(g => g.nis_siswa === user?.studentId);
    myGrades = studentApiGrades.map(g => ({
      subject: g.mata_pelajaran,
      score: g.nilai,
      teacher: g.nama_guru,
      date: g.tanggal_input ? new Date(g.tanggal_input).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Baru Saja'
    }));
  } else {
    const studentGrades = grades.filter(g => g.studentId === user?.id);
    myGrades = studentGrades.length > 0
      ? studentGrades.map(g => {
          const subject = subjects.find(s => s.id === g.subjectId);
          const teacher = teachers.find(t => t.id === g.teacherId);
          return {
            subject: subject ? subject.name : 'Mata Pelajaran',
            score: g.score,
            teacher: teacher ? teacher.name : 'Guru',
            date: g.date || 'Baru Saja'
          };
        })
      : [
          { subject: 'Matematika', score: 88, teacher: 'Arifin Bagunda', date: '10 Mar 2024' },
          { subject: 'Fisika', score: 82, teacher: 'Arifin Bagunda', date: '08 Mar 2024' },
          { subject: 'Bahasa Indonesia', score: 95, teacher: 'Cynthia', date: '05 Mar 2024' },
          { subject: 'Seni Budaya', score: 90, teacher: 'Pak Anton', date: '01 Mar 2024' },
        ];
  }

  const average = myGrades.length > 0 
    ? (myGrades.reduce((sum, g) => sum + g.score, 0) / myGrades.length).toFixed(1)
    : '0.0';

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ marginLeft: '320px', padding: '40px', width: '100%', minHeight: '100vh' }}>
        <header style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Rapor Digital</h1>
          <p style={{ color: 'var(--text-muted)' }}>Selamat datang kembali, {user?.name}. Lihat pencapaian akademik Anda di sini.</p>
        </header>

        <div style={{ display: 'flex', gap: '20px', marginBottom: '32px' }}>
          <StatCard icon={<BarChart />} label="Rata-rata Nilai" value={average} color="#6366f1" />
          <StatCard icon={<Award />} label="Peringkat Kelas" value="3 / 32" color="#a855f7" />
          <StatCard icon={<Book />} label="Mata Pelajaran" value={myGrades.length.toString()} color="#22c55e" />
        </div>

        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>Detail Nilai Semester Ganjil</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px' }}>Mata Pelajaran</th>
                <th style={{ padding: '12px' }}>Guru Pengampu</th>
                <th style={{ padding: '12px' }}>Tanggal Update</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Nilai</th>
              </tr>
            </thead>
            <tbody>
              {myGrades.map((g, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px', fontWeight: '600' }}>{g.subject}</td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{g.teacher}</td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{g.date}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <div style={{ 
                      display: 'inline-block',
                      padding: '8px 16px',
                      borderRadius: '12px',
                      background: g.score >= 80 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: g.score >= 80 ? '#22c55e' : '#ef4444',
                      fontWeight: 'bold'
                    }}>
                      {g.score}
                    </div>
                  </td>
                </tr>
              ))}
              {myGrades.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Belum ada nilai diinput
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

const StatCard = ({ icon, label, value, color }) => (
  <div className="glass-card" style={{ flex: 1, padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
    <div style={{ 
      width: '48px', height: '48px', borderRadius: '12px', background: `${color}20`, color: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      {icon}
    </div>
    <div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{label}</p>
      <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{value}</p>
    </div>
  </div>
);

export default MuridDashboard;
