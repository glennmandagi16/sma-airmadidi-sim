-- ============================================================
--  DATABASE: SMA KRISTEN AIRMADIDI - SISTEM INFORMASI MANAJEMEN
--  File    : 01_manajemen_pengguna.sql
--  Modul   : Manajemen Pengguna (Admin & Guru)
--  Dibuat  : 2026-06-25
--  Versi   : 1.0
-- ============================================================
--
--  Deskripsi:
--    File ini berisi struktur tabel dan data awal untuk modul
--    Manajemen Pengguna, mencakup:
--      - Tabel `users`  : Akun admin sistem
--      - Tabel `guru`   : Data guru beserta akun login
--      - Tabel `guru_mata_pelajaran` : Relasi guru ↔ mata pelajaran
--      - VIEW `daftar_guru_mapel`    : Laporan guru dan mapel yang diajar
--
--  Urutan eksekusi yang direkomendasikan:
--    1. 01_manajemen_pengguna.sql   (file ini)
--    2. 02_manajemen_siswa.sql
--    3. 03_manajemen_mata_pelajaran.sql
--
-- ============================================================

-- Buat database (opsional, jalankan manual jika belum ada)
-- CREATE DATABASE IF NOT EXISTS sma_airmadidi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE sma_airmadidi;

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE            = 'NO_AUTO_VALUE_ON_ZERO';
SET NAMES               utf8mb4;

-- ============================================================
-- TABEL: users
-- Menyimpan akun pengguna dengan role ADMIN, GURU, dan MURID.
-- Login sistem menggunakan username + password dari tabel ini.
-- ============================================================
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id`         INT          NOT NULL AUTO_INCREMENT,
  `name`       VARCHAR(100) NOT NULL              COMMENT 'Nama lengkap pengguna',
  `username`   VARCHAR(50)  NOT NULL UNIQUE       COMMENT 'Username untuk login',
  `password`   VARCHAR(255) NOT NULL              COMMENT 'Password (plaintext/hashed)',
  `role`       ENUM('ADMIN','GURU','MURID') NOT NULL DEFAULT 'MURID'
                                                  COMMENT 'Peran pengguna dalam sistem',
  `created_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Tabel akun pengguna sistem SMA';

-- -----------------------------------------------
-- Data Awal: Akun Admin
-- -----------------------------------------------
INSERT INTO `users` (`id`, `name`, `username`, `password`, `role`) VALUES
(1, 'Admin SMA Airmadidi', 'admin', 'admin123', 'ADMIN');


-- ============================================================
-- TABEL: guru
-- Menyimpan data identitas dan akun login guru.
-- NIP bersifat opsional (nullable).
-- ============================================================
DROP TABLE IF EXISTS `guru`;
CREATE TABLE `guru` (
  `id`         INT          NOT NULL AUTO_INCREMENT,
  `name`       VARCHAR(100) NOT NULL              COMMENT 'Nama lengkap guru',
  `username`   VARCHAR(50)  NOT NULL UNIQUE       COMMENT 'Username login guru',
  `password`   VARCHAR(255) NOT NULL DEFAULT 'guru123'
                                                  COMMENT 'Password default: guru123',
  `nip`        VARCHAR(30)  NULL                  COMMENT 'Nomor Induk Pegawai (opsional)',
  `created_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_guru_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Tabel data guru SMA';

-- -----------------------------------------------
-- Data Awal: Guru
-- -----------------------------------------------
INSERT INTO `guru` (`id`, `name`, `username`, `password`, `nip`) VALUES
(201, 'Pak Yohanes', 'pakyohanes', 'guru123', NULL),
(202, 'Bu Maria',    'bumaria',    'guru123', NULL);


-- ============================================================
-- TABEL: guru_mata_pelajaran
-- Tabel relasi many-to-many antara guru dan mata pelajaran.
-- Satu guru dapat mengajar banyak mata pelajaran.
-- CATATAN: Tabel `mata_pelajaran` harus dibuat terlebih dahulu
--          (lihat file 03_manajemen_mata_pelajaran.sql).
--          Constraint FK diaktifkan kembali di akhir file.
-- ============================================================
DROP TABLE IF EXISTS `guru_mata_pelajaran`;
CREATE TABLE `guru_mata_pelajaran` (
  `id`                INT NOT NULL AUTO_INCREMENT,
  `guru_id`           INT NOT NULL               COMMENT 'Referensi ke tabel guru',
  `mata_pelajaran_id` INT NOT NULL               COMMENT 'Referensi ke tabel mata_pelajaran',
  PRIMARY KEY (`id`),
  UNIQUE KEY  `uq_guru_mapel` (`guru_id`, `mata_pelajaran_id`),
  CONSTRAINT  `fk_gmp_guru`
    FOREIGN KEY (`guru_id`)           REFERENCES `guru`(`id`)          ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT  `fk_gmp_mapel`
    FOREIGN KEY (`mata_pelajaran_id`) REFERENCES `mata_pelajaran`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Relasi guru dengan mata pelajaran yang diajar';

-- -----------------------------------------------
-- Data Awal: Penugasan Guru
-- Pak Yohanes → Matematika XII (id=1), Fisika XII (id=2)
-- -----------------------------------------------
INSERT INTO `guru_mata_pelajaran` (`guru_id`, `mata_pelajaran_id`) VALUES
(201, 1),
(201, 2);


-- ============================================================
-- VIEW: daftar_guru_mapel
-- Menampilkan daftar guru beserta mata pelajaran yang diajar
-- dalam format laporan yang mudah dibaca.
-- ============================================================
DROP VIEW IF EXISTS `daftar_guru_mapel`;
CREATE VIEW `daftar_guru_mapel` AS
  SELECT
    g.id        AS guru_id,
    g.name      AS nama_guru,
    g.username  AS username_guru,
    g.nip       AS nip_guru,
    mp.id       AS mapel_id,
    mp.name     AS nama_mapel,
    mp.kelas    AS kelas
  FROM  `guru_mata_pelajaran` gmp
  JOIN  `guru`           g   ON gmp.guru_id          = g.id
  JOIN  `mata_pelajaran` mp  ON gmp.mata_pelajaran_id = mp.id
  ORDER BY g.name, mp.kelas, mp.name;


SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- END OF FILE: 01_manajemen_pengguna.sql
-- ============================================================
