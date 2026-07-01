-- ============================================================
--  DATABASE: SMA KRISTEN AIRMADIDI - SISTEM INFORMASI MANAJEMEN
--  File    : 03_manajemen_mata_pelajaran.sql
--  Modul   : Manajemen Mata Pelajaran
--  Dibuat  : 2026-06-25
--  Versi   : 1.0
-- ============================================================
--
--  Deskripsi:
--    File ini berisi struktur tabel dan data awal untuk modul
--    Manajemen Mata Pelajaran, mencakup:
--      - Tabel `mata_pelajaran` : Daftar mata pelajaran per kelas
--      - VIEW `ringkasan_mapel` : Statistik jumlah mapel per kelas
--      - VIEW `mapel_dengan_guru`: Mapel beserta guru yang mengajar
--
--  Urutan eksekusi yang direkomendasikan:
--    1. 01_manajemen_pengguna.sql
--    2. 02_manajemen_siswa.sql
--    3. 03_manajemen_mata_pelajaran.sql  (file ini)
--
--  Catatan:
--    Tabel ini direferensikan oleh:
--      - guru_mata_pelajaran (file 01)
--      - nilai               (file 02)
--    Jika menjalankan semua file sekaligus, pastikan
--    FOREIGN_KEY_CHECKS = 0 aktif (sudah diatur di bawah).
--
-- ============================================================

-- Buat database (opsional, jalankan manual jika belum ada)
-- CREATE DATABASE IF NOT EXISTS sma_airmadidi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE sma_airmadidi;

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE            = 'NO_AUTO_VALUE_ON_ZERO';
SET NAMES               utf8mb4;

-- ============================================================
-- TABEL: mata_pelajaran
-- Menyimpan daftar kurikulum mata pelajaran yang aktif.
-- Setiap mata pelajaran dikaitkan dengan kelas tertentu
-- (X, XI, atau XII). Nama mapel yang sama dapat muncul
-- di kelas berbeda (misal: Matematika Kelas X dan XII).
-- ============================================================
DROP TABLE IF EXISTS `mata_pelajaran`;
CREATE TABLE `mata_pelajaran` (
  `id`         INT          NOT NULL AUTO_INCREMENT,
  `name`       VARCHAR(100) NOT NULL              COMMENT 'Nama mata pelajaran',
  `kelas`      ENUM('X','XI','XII') NOT NULL      COMMENT 'Kelas yang mengikuti mapel ini',
  `created_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_mapel_kelas` (`kelas`),
  INDEX `idx_mapel_name`  (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Tabel kurikulum mata pelajaran SMA';

-- -----------------------------------------------
-- Data Awal: Mata Pelajaran
-- -----------------------------------------------
INSERT INTO `mata_pelajaran` (`id`, `name`, `kelas`) VALUES
-- Kelas XII
(1, 'Matematika', 'XII'),
(2, 'Fisika',     'XII'),
(3, 'Kimia',      'XII'),
(4, 'Biologi',    'XII'),
(5, 'Bahasa Indonesia', 'XII'),
(6, 'Bahasa Inggris',   'XII'),
-- Kelas XI
(7,  'Matematika',      'XI'),
(8,  'Fisika',          'XI'),
(9,  'Kimia',           'XI'),
(10, 'Biologi',         'XI'),
(11, 'Bahasa Indonesia','XI'),
(12, 'Bahasa Inggris',  'XI'),
-- Kelas X
(13, 'Matematika',      'X'),
(14, 'Fisika',          'X'),
(15, 'Kimia',           'X'),
(16, 'Biologi',         'X'),
(17, 'Bahasa Indonesia','X'),
(18, 'Bahasa Inggris',  'X');

-- -----------------------------------------------
-- Catatan: Data di atas adalah data lengkap kurikulum.
-- Sesuaikan dengan kondisi sekolah jika diperlukan.
-- Data minimal yang digunakan pada aplikasi saat ini:
--   (1, 'Matematika', 'XII')
--   (2, 'Fisika',     'XII')  -- (dipakai versi sebelumnya: id=2 → Fisika)
--   (7, 'Matematika', 'XI')   -- (dipakai versi sebelumnya: id=3 → Matematika XI)
-- -----------------------------------------------


-- ============================================================
-- VIEW: ringkasan_mapel
-- Menampilkan statistik jumlah mata pelajaran per kelas.
-- Berguna untuk laporan kurikulum dan dashboard admin.
-- ============================================================
DROP VIEW IF EXISTS `ringkasan_mapel`;
CREATE VIEW `ringkasan_mapel` AS
  SELECT
    kelas,
    COUNT(*) AS total_mapel,
    GROUP_CONCAT(name ORDER BY name SEPARATOR ', ') AS daftar_mapel
  FROM  `mata_pelajaran`
  GROUP BY kelas
  ORDER BY FIELD(kelas, 'X', 'XI', 'XII');


-- ============================================================
-- VIEW: mapel_dengan_guru
-- Menampilkan setiap mata pelajaran beserta guru yang mengajar.
-- Mata pelajaran tanpa guru pengampu tetap ditampilkan (LEFT JOIN).
-- ============================================================
DROP VIEW IF EXISTS `mapel_dengan_guru`;
CREATE VIEW `mapel_dengan_guru` AS
  SELECT
    mp.id        AS mapel_id,
    mp.name      AS nama_mapel,
    mp.kelas     AS kelas,
    g.id         AS guru_id,
    g.name       AS nama_guru,
    g.username   AS username_guru,
    g.nip        AS nip_guru
  FROM  `mata_pelajaran` mp
  LEFT JOIN `guru_mata_pelajaran` gmp ON mp.id = gmp.mata_pelajaran_id
  LEFT JOIN `guru`                g   ON gmp.guru_id = g.id
  ORDER BY FIELD(mp.kelas, 'X', 'XI', 'XII'), mp.name, g.name;


SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- END OF FILE: 03_manajemen_mata_pelajaran.sql
-- ============================================================
