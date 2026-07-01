-- ============================================================
--  DATABASE: SMA KRISTEN AIRMADIDI - SISTEM INFORMASI MANAJEMEN
--  File    : 02_manajemen_siswa.sql
--  Modul   : Manajemen Siswa
--  Dibuat  : 2026-06-25
--  Versi   : 1.0
-- ============================================================
--
--  Deskripsi:
--    File ini berisi struktur tabel dan data awal untuk modul
--    Manajemen Siswa, mencakup:
--      - Tabel `siswa`  : Data identitas dan akun login siswa
--      - Tabel `nilai`  : Nilai siswa per mata pelajaran
--      - VIEW `rekapitulasi_nilai` : Laporan nilai gabungan
--
--  Urutan eksekusi yang direkomendasikan:
--    1. 01_manajemen_pengguna.sql
--    2. 02_manajemen_siswa.sql     (file ini)
--    3. 03_manajemen_mata_pelajaran.sql
--
--  Catatan Dependensi:
--    Tabel `nilai` memerlukan tabel `siswa`, `mata_pelajaran`,
--    dan `guru` sudah ada. Pastikan file 01 dan 03 dijalankan
--    sebelum membuat data nilai.
--
-- ============================================================

-- Buat database (opsional, jalankan manual jika belum ada)
-- CREATE DATABASE IF NOT EXISTS sma_airmadidi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE sma_airmadidi;

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE            = 'NO_AUTO_VALUE_ON_ZERO';
SET NAMES               utf8mb4;

-- ============================================================
-- TABEL: siswa
-- Menyimpan data identitas siswa beserta akun login.
-- NIS (Nomor Induk Siswa) bersifat unik per siswa.
-- Kelas dibatasi pada nilai X, XI, atau XII.
-- ============================================================
DROP TABLE IF EXISTS `siswa`;
CREATE TABLE `siswa` (
  `id`         INT          NOT NULL AUTO_INCREMENT,
  `name`       VARCHAR(100) NOT NULL              COMMENT 'Nama lengkap siswa',
  `nis`        VARCHAR(20)  NOT NULL UNIQUE       COMMENT 'Nomor Induk Siswa',
  `password`   VARCHAR(255) NOT NULL DEFAULT 'murid123'
                                                  COMMENT 'Password default: murid123',
  `kelas`      ENUM('X','XI','XII') NOT NULL DEFAULT 'XII'
                                                  COMMENT 'Kelas aktif siswa',
  `created_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_siswa_kelas` (`kelas`),
  INDEX `idx_siswa_nis`   (`nis`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Tabel data siswa SMA';

-- -----------------------------------------------
-- Data Awal: Siswa
-- -----------------------------------------------
INSERT INTO `siswa` (`id`, `name`, `nis`, `password`, `kelas`) VALUES
(101, 'Budi Santoso', '2024001', 'murid123', 'XII'),
(102, 'Siti Aminah',  '2024002', 'murid123', 'XII'),
(103, 'Andi Pratama', '2024003', 'murid123', 'XI');


-- ============================================================
-- TABEL: nilai
-- Menyimpan nilai akademik siswa per mata pelajaran.
-- Setiap record dihubungkan ke siswa, mata pelajaran, dan guru
-- yang memberikan nilai tersebut.
-- Skala nilai: 0.00 – 100.00
-- ============================================================
DROP TABLE IF EXISTS `nilai`;
CREATE TABLE `nilai` (
  `id`                INT          NOT NULL AUTO_INCREMENT,
  `siswa_id`          INT          NOT NULL  COMMENT 'Referensi ke tabel siswa',
  `mata_pelajaran_id` INT          NOT NULL  COMMENT 'Referensi ke tabel mata_pelajaran',
  `guru_id`           INT          NOT NULL  COMMENT 'Guru yang memberikan nilai',
  `score`             DECIMAL(5,2) NOT NULL DEFAULT 0.00
                                            COMMENT 'Nilai siswa (0.00 - 100.00)',
  `created_at`        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_nilai_siswa`    (`siswa_id`),
  INDEX `idx_nilai_mapel`    (`mata_pelajaran_id`),
  INDEX `idx_nilai_guru`     (`guru_id`),
  CONSTRAINT `fk_nilai_siswa`
    FOREIGN KEY (`siswa_id`)          REFERENCES `siswa`(`id`)          ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_nilai_mapel`
    FOREIGN KEY (`mata_pelajaran_id`) REFERENCES `mata_pelajaran`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_nilai_guru`
    FOREIGN KEY (`guru_id`)           REFERENCES `guru`(`id`)           ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Tabel nilai akademik siswa';

-- -----------------------------------------------
-- Data Awal: Nilai Siswa
-- Budi Santoso  → Matematika XII = 85, Fisika XII = 78
-- Siti Aminah   → Matematika XII = 92
-- -----------------------------------------------
INSERT INTO `nilai` (`siswa_id`, `mata_pelajaran_id`, `guru_id`, `score`) VALUES
(101, 1, 201, 85.00),
(101, 2, 201, 78.00),
(102, 1, 201, 92.00);


-- ============================================================
-- VIEW: rekapitulasi_nilai
-- Laporan gabungan nilai siswa dengan detail nama siswa,
-- mata pelajaran, kelas, nama guru, dan tanggal input nilai.
-- Diurutkan berdasarkan kelas → nama siswa → mata pelajaran.
-- ============================================================
DROP VIEW IF EXISTS `rekapitulasi_nilai`;
CREATE VIEW `rekapitulasi_nilai` AS
  SELECT
    s.nis          AS nis_siswa,
    s.name         AS nama_siswa,
    s.kelas        AS kelas_siswa,
    mp.name        AS mata_pelajaran,
    mp.kelas       AS kelas_mapel,
    g.name         AS nama_guru,
    n.score        AS nilai,
    CASE
      WHEN n.score >= 90 THEN 'A'
      WHEN n.score >= 80 THEN 'B'
      WHEN n.score >= 70 THEN 'C'
      WHEN n.score >= 60 THEN 'D'
      ELSE 'E'
    END            AS predikat,
    n.created_at   AS tanggal_input
  FROM  `nilai`         n
  JOIN  `siswa`         s   ON n.siswa_id          = s.id
  JOIN  `mata_pelajaran` mp ON n.mata_pelajaran_id = mp.id
  JOIN  `guru`           g  ON n.guru_id            = g.id
  ORDER BY s.kelas, s.name, mp.name;


SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- END OF FILE: 02_manajemen_siswa.sql
-- ============================================================
