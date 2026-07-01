/**
 * db.js — Koneksi Pool ke MySQL dengan Fallback ke SQLite
 * SMA Kristen Airmadidi - Backend API
 */

import mysql from 'mysql2/promise';
import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

let dbType = 'mysql';
let mysqlPool = null;
let sqliteDb = null;

const pool = {
  // Method to allow calling db.query() directly
  async query(sql, params = []) {
    if (dbType === 'mysql') {
      return mysqlPool.query(sql, params);
    } else {
      return new Promise((resolve, reject) => {
        // Translation helper for SQLite queries
        let sqliteSql = sql;
        // 1. replace INSERT IGNORE with INSERT OR IGNORE
        sqliteSql = sqliteSql.replace(/\bINSERT IGNORE\b/gi, 'INSERT OR IGNORE');
        // 2. replace ORDER BY FIELD with CASE sorting
        sqliteSql = sqliteSql.replace(/ORDER BY FIELD\(kelas,\s*'X',\s*'XI',\s*'XII'\)/gi, "ORDER BY CASE kelas WHEN 'X' THEN 1 WHEN 'XI' THEN 2 WHEN 'XII' THEN 3 END");
        
        const isSelect = sqliteSql.trim().toUpperCase().startsWith('SELECT');

        if (isSelect) {
          sqliteDb.all(sqliteSql, params, (err, rows) => {
            if (err) {
              if (err.message.includes('UNIQUE constraint failed')) {
                err.code = 'ER_DUP_ENTRY';
              }
              return reject(err);
            }
            resolve([rows]);
          });
        } else {
          sqliteDb.run(sqliteSql, params, function(err) {
            if (err) {
              if (err.message.includes('UNIQUE constraint failed')) {
                err.code = 'ER_DUP_ENTRY';
              }
              return reject(err);
            }
            resolve([{ insertId: this.lastID, affectedRows: this.changes }]);
          });
        }
      });
    }
  },

  async getConnection() {
    if (dbType === 'mysql') {
      return mysqlPool.getConnection();
    } else {
      // Mock connection for SQLite
      return {
        release() {},
        async query(sql, params = []) {
          return pool.query(sql, params);
        }
      };
    }
  }
};

// Initialize SQLite database schema
function initSQLite(dbPath) {
  return new Promise((resolve, reject) => {
    sqliteDb = new sqlite3.Database(dbPath, (err) => {
      if (err) return reject(err);
      
      sqliteDb.serialize(() => {
        // Enforce Foreign Keys
        sqliteDb.run("PRAGMA foreign_keys = ON;");

        // Create Tables
        sqliteDb.run(`
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'MURID',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        sqliteDb.run(`
          CREATE TABLE IF NOT EXISTS guru (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL DEFAULT 'guru123',
            nip TEXT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        sqliteDb.run(`
          CREATE TABLE IF NOT EXISTS siswa (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            nis TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL DEFAULT 'murid123',
            kelas TEXT NOT NULL DEFAULT 'XII',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        sqliteDb.run(`
          CREATE TABLE IF NOT EXISTS mata_pelajaran (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            kelas TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        sqliteDb.run(`
          CREATE TABLE IF NOT EXISTS guru_mata_pelajaran (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            guru_id INTEGER NOT NULL,
            mata_pelajaran_id INTEGER NOT NULL,
            UNIQUE(guru_id, mata_pelajaran_id),
            FOREIGN KEY (guru_id) REFERENCES guru(id) ON DELETE CASCADE,
            FOREIGN KEY (mata_pelajaran_id) REFERENCES mata_pelajaran(id) ON DELETE CASCADE
          )
        `);

        sqliteDb.run(`
          CREATE TABLE IF NOT EXISTS nilai (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            siswa_id INTEGER NOT NULL,
            mata_pelajaran_id INTEGER NOT NULL,
            guru_id INTEGER NOT NULL,
            score REAL NOT NULL DEFAULT 0.00,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (siswa_id) REFERENCES siswa(id) ON DELETE CASCADE,
            FOREIGN KEY (mata_pelajaran_id) REFERENCES mata_pelajaran(id) ON DELETE CASCADE,
            FOREIGN KEY (guru_id) REFERENCES guru(id) ON DELETE CASCADE
          )
        `);

        // Create Views
        sqliteDb.run(`DROP VIEW IF EXISTS rekapitulasi_nilai`);
        sqliteDb.run(`
          CREATE VIEW rekapitulasi_nilai AS
          SELECT
            s.nis                 AS nis_siswa,
            s.name                AS nama_siswa,
            s.kelas               AS kelas,
            mp.name               AS mata_pelajaran,
            mp.kelas              AS kelas_mapel,
            g.name                AS nama_guru,
            n.score               AS nilai,
            n.created_at          AS tanggal_input
          FROM nilai n
          JOIN siswa         s  ON n.siswa_id          = s.id
          JOIN mata_pelajaran mp ON n.mata_pelajaran_id = mp.id
          JOIN guru           g  ON n.guru_id            = g.id
          ORDER BY s.kelas, s.name, mp.name
        `);

        sqliteDb.run(`DROP VIEW IF EXISTS daftar_guru_mapel`);
        sqliteDb.run(`
          CREATE VIEW daftar_guru_mapel AS
          SELECT
            g.id             AS guru_id,
            g.name           AS nama_guru,
            g.username        AS username_guru,
            mp.id            AS mapel_id,
            mp.name          AS nama_mapel,
            mp.kelas         AS kelas
          FROM guru_mata_pelajaran gmp
          JOIN guru           g  ON gmp.guru_id          = g.id
          JOIN mata_pelajaran mp ON gmp.mata_pelajaran_id = mp.id
          ORDER BY g.name, mp.kelas
        `);

        // Seed default data
        sqliteDb.run("INSERT OR IGNORE INTO users (id, name, username, password, role) VALUES (1, 'Admin SMA Airmadidi', 'admin', 'admin123', 'ADMIN')");
        
        sqliteDb.run("INSERT OR IGNORE INTO guru (id, name, username, password, nip) VALUES (201, 'Pak Yohanes', 'pakyohanes', 'guru123', NULL)");
        sqliteDb.run("INSERT OR IGNORE INTO guru (id, name, username, password, nip) VALUES (202, 'Bu Maria', 'bumaria', 'guru123', NULL)");

        sqliteDb.run("INSERT OR IGNORE INTO siswa (id, name, nis, password, kelas) VALUES (101, 'Budi Santoso', '2024001', 'murid123', 'XII')");
        sqliteDb.run("INSERT OR IGNORE INTO siswa (id, name, nis, password, kelas) VALUES (102, 'Siti Aminah', '2024002', 'murid123', 'XII')");
        sqliteDb.run("INSERT OR IGNORE INTO siswa (id, name, nis, password, kelas) VALUES (103, 'Andi Pratama', '2024003', 'murid123', 'XI')");

        sqliteDb.run("INSERT OR IGNORE INTO mata_pelajaran (id, name, kelas) VALUES (1, 'Matematika', 'XII')");
        sqliteDb.run("INSERT OR IGNORE INTO mata_pelajaran (id, name, kelas) VALUES (2, 'Fisika', 'XII')");
        sqliteDb.run("INSERT OR IGNORE INTO mata_pelajaran (id, name, kelas) VALUES (3, 'Matematika', 'XI')");

        sqliteDb.run("INSERT OR IGNORE INTO guru_mata_pelajaran (guru_id, mata_pelajaran_id) VALUES (201, 1)");
        sqliteDb.run("INSERT OR IGNORE INTO guru_mata_pelajaran (guru_id, mata_pelajaran_id) VALUES (201, 2)");

        sqliteDb.run("INSERT OR IGNORE INTO nilai (siswa_id, mata_pelajaran_id, guru_id, score) VALUES (101, 1, 201, 85.00)");
        sqliteDb.run("INSERT OR IGNORE INTO nilai (siswa_id, mata_pelajaran_id, guru_id, score) VALUES (101, 2, 201, 78.00)");
        sqliteDb.run("INSERT OR IGNORE INTO nilai (siswa_id, mata_pelajaran_id, guru_id, score) VALUES (102, 1, 201, 92.00)");

        resolve();
      });
    });
  });
}

// 1. Coba konek ke MySQL
try {
  mysqlPool = mysql.createPool({
    host:               process.env.DB_HOST     || 'localhost',
    port:     parseInt( process.env.DB_PORT     || '3306'),
    user:               process.env.DB_USER     || 'root',
    password:           process.env.DB_PASS     || '',
    database:           process.env.DB_NAME     || 'sma_airmadidi',
    waitForConnections: true,
    connectionLimit:    10,
    queueLimit:         0,
    charset:            'utf8mb4',
  });

  // Test MySQL
  await mysqlPool.getConnection().then(conn => {
    console.log('✅ MySQL terhubung ke database:', process.env.DB_NAME || 'sma_airmadidi');
    conn.release();
  }).catch(async err => {
    console.log('⚠️  MySQL tidak tersedia, beralih ke SQLite...');
    dbType = 'sqlite';
    const dbPath = path.resolve('sma_airmadidi.db');
    await initSQLite(dbPath);
    console.log('✅ SQLite terhubung dan diinisialisasi:', dbPath);
  });
} catch (e) {
  console.log('⚠️  MySQL tidak tersedia, beralih ke SQLite...');
  dbType = 'sqlite';
  const dbPath = path.resolve('sma_airmadidi.db');
  await initSQLite(dbPath);
  console.log('✅ SQLite terhubung dan diinisialisasi:', dbPath);
}

export default pool;
