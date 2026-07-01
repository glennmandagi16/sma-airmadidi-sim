-- ============================================================
--  DATABASE: SMA KRISTEN AIRMADIDI - SISTEM INFORMASI MANAJEMEN
--  File    : sma_airmadidi.sql
--  Dibuat  : 2026-06-06
--  Versi   : 1.0
-- ============================================================

-- Buat database (opsional, bisa dijalankan manual)
-- CREATE DATABASE IF NOT EXISTS sma_airmadidi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE sma_airmadidi;

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';
SET NAMES utf8mb4;

-- ============================================================
-- TABEL: users (Admin)
-- ============================================================
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id`         INT          NOT NULL AUTO_INCREMENT,
  `name`       VARCHAR(100) NOT NULL,
  `username`   VARCHAR(50)  NOT NULL UNIQUE,
  `password`   VARCHAR(255) NOT NULL,
  `role`       ENUM('ADMIN','GURU','MURID') NOT NULL DEFAULT 'MURID',
  `created_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data Admin
INSERT INTO `users` (`id`, `name`, `username`, `password`, `role`) VALUES
(1, 'Admin SMA Airmadidi', 'admin', 'admin123', 'ADMIN');


-- ============================================================
-- TABEL: guru
-- ============================================================
DROP TABLE IF EXISTS `guru`;
CREATE TABLE `guru` (
  `id`         INT          NOT NULL AUTO_INCREMENT,
  `name`       VARCHAR(100) NOT NULL,
  `username`   VARCHAR(50)  NOT NULL UNIQUE,
  `password`   VARCHAR(255) NOT NULL DEFAULT 'guru123',
  `nip`        VARCHAR(30)  NULL COMMENT 'Nomor Induk Pegawai',
  `created_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data Guru
INSERT INTO `guru` (`id`, `name`, `username`, `password`, `nip`) VALUES
(201, 'Pak Yohanes',   'pakyohanes', 'guru123', NULL),
(202, 'Bu Maria',      'bumaria',    'guru123', NULL);


-- ============================================================
-- TABEL: siswa
-- ============================================================
DROP TABLE IF EXISTS `siswa`;
CREATE TABLE `siswa` (
  `id`         INT          NOT NULL AUTO_INCREMENT,
  `name`       VARCHAR(100) NOT NULL,
  `nis`        VARCHAR(20)  NOT NULL UNIQUE COMMENT 'Nomor Induk Siswa',
  `password`   VARCHAR(255) NOT NULL DEFAULT 'murid123',
  `kelas`      ENUM('X','XI','XII') NOT NULL DEFAULT 'XII',
  `created_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data Siswa
INSERT INTO `siswa` (`id`, `name`, `nis`, `password`, `kelas`) VALUES
(101, 'Budi Santoso',  '2024001', 'murid123', 'XII'),
(102, 'Siti Aminah',   '2024002', 'murid123', 'XII'),
(103, 'Andi Pratama',  '2024003', 'murid123', 'XI');


-- ============================================================
-- TABEL: mata_pelajaran
-- ============================================================
DROP TABLE IF EXISTS `mata_pelajaran`;
CREATE TABLE `mata_pelajaran` (
  `id`         INT          NOT NULL AUTO_INCREMENT,
  `name`       VARCHAR(100) NOT NULL,
  `kelas`      ENUM('X','XI','XII') NOT NULL,
  `created_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data Mata Pelajaran
INSERT INTO `mata_pelajaran` (`id`, `name`, `kelas`) VALUES
(1, 'Matematika', 'XII'),
(2, 'Fisika',     'XII'),
(3, 'Matematika', 'XI');


-- ============================================================
-- TABEL: guru_mata_pelajaran (Relasi Guru ↔ Mata Pelajaran)
-- ============================================================
DROP TABLE IF EXISTS `guru_mata_pelajaran`;
CREATE TABLE `guru_mata_pelajaran` (
  `id`              INT NOT NULL AUTO_INCREMENT,
  `guru_id`         INT NOT NULL,
  `mata_pelajaran_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_guru_mapel` (`guru_id`, `mata_pelajaran_id`),
  CONSTRAINT `fk_gmp_guru`  FOREIGN KEY (`guru_id`)          REFERENCES `guru`(`id`)          ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_gmp_mapel` FOREIGN KEY (`mata_pelajaran_id`) REFERENCES `mata_pelajaran`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pak Yohanes → Matematika XII, Fisika XII
-- Bu Maria    → Biologi XII (belum ada di mata_pelajaran, skipped), Kimia XII (belum ada)
INSERT INTO `guru_mata_pelajaran` (`guru_id`, `mata_pelajaran_id`) VALUES
(201, 1),
(201, 2);


-- ============================================================
-- TABEL: nilai (Nilai Siswa)
-- ============================================================
DROP TABLE IF EXISTS `nilai`;
CREATE TABLE `nilai` (
  `id`              INT          NOT NULL AUTO_INCREMENT,
  `siswa_id`        INT          NOT NULL,
  `mata_pelajaran_id` INT        NOT NULL,
  `guru_id`         INT          NOT NULL,
  `score`           DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `created_at`      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_nilai_siswa` FOREIGN KEY (`siswa_id`)          REFERENCES `siswa`(`id`)          ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_nilai_mapel` FOREIGN KEY (`mata_pelajaran_id`) REFERENCES `mata_pelajaran`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_nilai_guru`  FOREIGN KEY (`guru_id`)            REFERENCES `guru`(`id`)           ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data Nilai
INSERT INTO `nilai` (`siswa_id`, `mata_pelajaran_id`, `guru_id`, `score`) VALUES
(101, 1, 201, 85.00),
(101, 2, 201, 78.00),
(102, 1, 201, 92.00);


-- ============================================================
-- VIEW: rekapitulasi_nilai (Laporan Gabungan)
-- ============================================================
DROP VIEW IF EXISTS `rekapitulasi_nilai`;
CREATE VIEW `rekapitulasi_nilai` AS
  SELECT
    s.nis                 AS nis_siswa,
    s.name                AS nama_siswa,
    s.kelas               AS kelas,
    mp.name               AS mata_pelajaran,
    mp.kelas              AS kelas_mapel,
    g.name                AS nama_guru,
    n.score               AS nilai,
    n.created_at          AS tanggal_input
  FROM `nilai` n
  JOIN `siswa`         s  ON n.siswa_id          = s.id
  JOIN `mata_pelajaran` mp ON n.mata_pelajaran_id = mp.id
  JOIN `guru`           g  ON n.guru_id            = g.id
  ORDER BY s.kelas, s.name, mp.name;


-- ============================================================
-- VIEW: daftar_guru_mapel (Guru & Mata Pelajaran yang Diajar)
-- ============================================================
DROP VIEW IF EXISTS `daftar_guru_mapel`;
CREATE VIEW `daftar_guru_mapel` AS
  SELECT
    g.id             AS guru_id,
    g.name           AS nama_guru,
    g.username        AS username_guru,
    mp.id            AS mapel_id,
    mp.name          AS nama_mapel,
    mp.kelas         AS kelas
  FROM `guru_mata_pelajaran` gmp
  JOIN `guru`           g  ON gmp.guru_id          = g.id
  JOIN `mata_pelajaran` mp ON gmp.mata_pelajaran_id = mp.id
  ORDER BY g.name, mp.kelas;


SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- END OF FILE
-- ============================================================
