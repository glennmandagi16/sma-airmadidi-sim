// Mock Database for development
export const INITIAL_STUDENTS = [
  { id: 101, name: 'Budi Santoso', class: 'XII', studentId: '2024001' },
  { id: 102, name: 'Siti Aminah', class: 'XII', studentId: '2024002' },
  { id: 103, name: 'Andi Pratama', class: 'XI', studentId: '2024003' },
];

export const INITIAL_TEACHERS = [
  { id: 201, name: 'Arifin Bagunda', subjects: ['Matematika', 'Fisika'] },
  { id: 202, name: 'Cynthia', subjects: ['Biologi', 'Kimia'] },
];

export const INITIAL_SUBJECTS = [
  { id: 1, name: 'Matematika', class: 'XII' },
  { id: 2, name: 'Fisika', class: 'XII' },
  { id: 3, name: 'Matematika', class: 'XI' },
];

export const INITIAL_GRADES = [
  { studentId: 101, subjectId: 1, score: 85, teacherId: 201 },
  { studentId: 101, subjectId: 2, score: 78, teacherId: 201 },
  { studentId: 102, subjectId: 1, score: 92, teacherId: 201 },
];
