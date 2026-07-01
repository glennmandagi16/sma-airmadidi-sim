/**
 * sqlExport.js
 * Utility untuk mengekspor data dari localStorage ke format file SQL (.sql)
 * SMA Kristen Airmadidi - Sistem Informasi Manajemen
 */

/**
 * Escape string SQL untuk menghindari SQL injection pada data
 */
const escapeSql = (val) => {
  if (val === null || val === undefined) return 'NULL';
  return `'${String(val).replace(/'/g, "''").replace(/\\/g, '\\\\')}'`;
};

/**
 * Format tanggal sekarang untuk header SQL
 */
const getNow = () => {
  const d = new Date();
  return d.toISOString().replace('T', ' ').substring(0, 19);
};

/**
 * Generate konten SQL dari data yang diberikan
 * @param {Array} students  - Array data siswa
 * @param {Array} teachers  - Array data guru
 * @param {Array} subjects  - Array data mata pelajaran
 * @param {Array} grades    - Array data nilai (opsional)
 * @returns {string} - Konten SQL lengkap
 */
export const generateSqlContent = (students = [], teachers = [], subjects = [], grades = []) => {
  const lines = [];
  const now = getNow();

  // ── HEADER ──────────────────────────────────────────────────────────────
  lines.push(`-- ============================================================`);
  lines.push(`--  DATABASE  : sma_airmadidi`);
  lines.push(`--  DIEKSPOR  : ${now} WIB`);
  lines.push(`--  SISTEM    : SMA Kristen Airmadidi - SIM`);
  lines.push(`--  TOTAL     : ${teachers.length} Guru | ${students.length} Siswa | ${subjects.length} Mapel`);
  lines.push(`-- ============================================================`);
  lines.push(``);
  lines.push(`SET FOREIGN_KEY_CHECKS = 0;`);
  lines.push(`SET NAMES utf8mb4;`);
  lines.push(``);

  // ── TABEL: GURU ──────────────────────────────────────────────────────────
  lines.push(`-- ────────────────────────────────────────────────────────────`);
  lines.push(`-- TABEL: guru`);
  lines.push(`-- ────────────────────────────────────────────────────────────`);
  lines.push(`DROP TABLE IF EXISTS \`guru\`;`);
  lines.push(`CREATE TABLE \`guru\` (`);
  lines.push(`  \`id\`         INT          NOT NULL AUTO_INCREMENT,`);
  lines.push(`  \`name\`       VARCHAR(100) NOT NULL,`);
  lines.push(`  \`username\`   VARCHAR(50)  NOT NULL,`);
  lines.push(`  \`password\`   VARCHAR(255) NOT NULL DEFAULT 'guru123',`);
  lines.push(`  \`subjects\`   TEXT         NULL COMMENT 'Mata pelajaran yang diajar (JSON array)',`);
  lines.push(`  \`created_at\` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,`);
  lines.push(`  PRIMARY KEY (\`id\`),`);
  lines.push(`  UNIQUE KEY \`uq_guru_username\` (\`username\`)`);
  lines.push(`) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`);
  lines.push(``);

  if (teachers.length > 0) {
    lines.push(`INSERT INTO \`guru\` (\`id\`, \`name\`, \`username\`, \`password\`, \`subjects\`) VALUES`);
    const rows = teachers.map((t, i) => {
      const username = t.username || t.name.toLowerCase().replace(/\s+/g, '');
      const password = t.password || 'guru123';
      const subjects = t.subjects ? JSON.stringify(t.subjects) : null;
      const comma = i < teachers.length - 1 ? ',' : ';';
      return `(${t.id}, ${escapeSql(t.name)}, ${escapeSql(username)}, ${escapeSql(password)}, ${escapeSql(subjects)})${comma}`;
    });
    lines.push(...rows);
  } else {
    lines.push(`-- (Belum ada data guru)`);
  }
  lines.push(``);

  // ── TABEL: SISWA ─────────────────────────────────────────────────────────
  lines.push(`-- ────────────────────────────────────────────────────────────`);
  lines.push(`-- TABEL: siswa`);
  lines.push(`-- ────────────────────────────────────────────────────────────`);
  lines.push(`DROP TABLE IF EXISTS \`siswa\`;`);
  lines.push(`CREATE TABLE \`siswa\` (`);
  lines.push(`  \`id\`         INT          NOT NULL AUTO_INCREMENT,`);
  lines.push(`  \`name\`       VARCHAR(100) NOT NULL,`);
  lines.push(`  \`nis\`        VARCHAR(20)  NOT NULL COMMENT 'Nomor Induk Siswa',`);
  lines.push(`  \`password\`   VARCHAR(255) NOT NULL DEFAULT 'murid123',`);
  lines.push(`  \`kelas\`      ENUM('X','XI','XII') NOT NULL DEFAULT 'XII',`);
  lines.push(`  \`created_at\` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,`);
  lines.push(`  PRIMARY KEY (\`id\`),`);
  lines.push(`  UNIQUE KEY \`uq_siswa_nis\` (\`nis\`)`);
  lines.push(`) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`);
  lines.push(``);

  if (students.length > 0) {
    lines.push(`INSERT INTO \`siswa\` (\`id\`, \`name\`, \`nis\`, \`password\`, \`kelas\`) VALUES`);
    const rows = students.map((s, i) => {
      const password = s.password || 'murid123';
      const comma = i < students.length - 1 ? ',' : ';';
      return `(${s.id}, ${escapeSql(s.name)}, ${escapeSql(s.studentId)}, ${escapeSql(password)}, ${escapeSql(s.class)})${comma}`;
    });
    lines.push(...rows);
  } else {
    lines.push(`-- (Belum ada data siswa)`);
  }
  lines.push(``);

  // ── TABEL: MATA PELAJARAN ────────────────────────────────────────────────
  lines.push(`-- ────────────────────────────────────────────────────────────`);
  lines.push(`-- TABEL: mata_pelajaran`);
  lines.push(`-- ────────────────────────────────────────────────────────────`);
  lines.push(`DROP TABLE IF EXISTS \`mata_pelajaran\`;`);
  lines.push(`CREATE TABLE \`mata_pelajaran\` (`);
  lines.push(`  \`id\`         INT          NOT NULL AUTO_INCREMENT,`);
  lines.push(`  \`name\`       VARCHAR(100) NOT NULL,`);
  lines.push(`  \`kelas\`      ENUM('X','XI','XII') NOT NULL,`);
  lines.push(`  \`created_at\` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,`);
  lines.push(`  PRIMARY KEY (\`id\`)`);
  lines.push(`) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`);
  lines.push(``);

  if (subjects.length > 0) {
    lines.push(`INSERT INTO \`mata_pelajaran\` (\`id\`, \`name\`, \`kelas\`) VALUES`);
    const rows = subjects.map((s, i) => {
      const comma = i < subjects.length - 1 ? ',' : ';';
      return `(${s.id}, ${escapeSql(s.name)}, ${escapeSql(s.class)})${comma}`;
    });
    lines.push(...rows);
  } else {
    lines.push(`-- (Belum ada data mata pelajaran)`);
  }
  lines.push(``);

  // ── TABEL: NILAI ─────────────────────────────────────────────────────────
  if (grades.length > 0) {
    lines.push(`-- ────────────────────────────────────────────────────────────`);
    lines.push(`-- TABEL: nilai`);
    lines.push(`-- ────────────────────────────────────────────────────────────`);
    lines.push(`DROP TABLE IF EXISTS \`nilai\`;`);
    lines.push(`CREATE TABLE \`nilai\` (`);
    lines.push(`  \`id\`              INT          NOT NULL AUTO_INCREMENT,`);
    lines.push(`  \`siswa_id\`        INT          NOT NULL,`);
    lines.push(`  \`mata_pelajaran_id\` INT         NOT NULL,`);
    lines.push(`  \`guru_id\`         INT          NOT NULL,`);
    lines.push(`  \`score\`           DECIMAL(5,2) NOT NULL DEFAULT 0.00,`);
    lines.push(`  \`created_at\`      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,`);
    lines.push(`  PRIMARY KEY (\`id\`)`);
    lines.push(`) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`);
    lines.push(``);
    lines.push(`INSERT INTO \`nilai\` (\`siswa_id\`, \`mata_pelajaran_id\`, \`guru_id\`, \`score\`) VALUES`);
    const rows = grades.map((g, i) => {
      const comma = i < grades.length - 1 ? ',' : ';';
      return `(${g.studentId}, ${g.subjectId}, ${g.teacherId}, ${g.score || 0})${comma}`;
    });
    lines.push(...rows);
    lines.push(``);
  }

  // ── FOOTER ───────────────────────────────────────────────────────────────
  lines.push(`SET FOREIGN_KEY_CHECKS = 1;`);
  lines.push(``);
  lines.push(`-- ============================================================`);
  lines.push(`-- END OF EXPORT`);
  lines.push(`-- ============================================================`);

  return lines.join('\n');
};

/**
 * Unduh konten sebagai file .sql
 * @param {string} content - Konten SQL
 * @param {string} filename - Nama file (default: sma_airmadidi_export.sql)
 */
export const downloadSqlFile = (content, filename = 'sma_airmadidi_export.sql') => {
  const blob = new Blob([content], { type: 'application/sql;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href     = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

/**
 * Export semua data dari localStorage ke file .sql
 * Fungsi utama yang dipanggil dari komponen React
 */
export const exportToSql = (students, teachers, subjects, grades = []) => {
  const timestamp = new Date().toISOString().replace(/[:T]/g, '-').substring(0, 16);
  const filename  = `sma_airmadidi_${timestamp}.sql`;
  const content   = generateSqlContent(students, teachers, subjects, grades);
  downloadSqlFile(content, filename);
};
