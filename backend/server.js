/**
 * server.js — Express REST API
 * SMA Kristen Airmadidi - Backend
 *
 * Endpoint:
 *   POST   /api/login
 *   GET    /api/siswa         GET    /api/guru         GET    /api/mapel
 *   POST   /api/siswa         POST   /api/guru         POST   /api/mapel
 *   PUT    /api/siswa/:id     PUT    /api/guru/:id     PUT    /api/mapel/:id
 *   DELETE /api/siswa/:id     DELETE /api/guru/:id     DELETE /api/mapel/:id
 *   GET    /api/nilai
 */

import express  from 'express';
import cors     from 'cors';
import dotenv   from 'dotenv';
import db       from './db.js';

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json());

// ── Helper: kirim error ─────────────────────────────────────────────────────
const err = (res, status, msg) => res.status(status).json({ error: msg });

// ===========================================================================
// AUTH — POST /api/login
// ===========================================================================
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return err(res, 400, 'Username dan password wajib diisi');

  try {
    // 1. Cek Admin (hardcoded agar tidak ada tabel users terpisah)
    if (username === 'admin' && password === 'admin123') {
      return res.json({
        success: true,
        user: { id: 1, role: 'ADMIN', name: 'Admin SMA Airmadidi', username: 'admin' },
      });
    }

    // 2. Cek Guru
    const [gurRows] = await db.query(
      'SELECT * FROM guru WHERE username = ? LIMIT 1', [username]
    );
    if (gurRows.length > 0) {
      const guru = gurRows[0];
      if (password !== (guru.password || 'guru123')) return err(res, 401, 'Password salah');

      // Ambil mapel yang diajar
      const [mapelRows] = await db.query(
        `SELECT mp.name, mp.kelas FROM guru_mata_pelajaran gmp
         JOIN mata_pelajaran mp ON gmp.mata_pelajaran_id = mp.id
         WHERE gmp.guru_id = ?`, [guru.id]
      );
      return res.json({
        success: true,
        user: {
          id:       guru.id,
          role:     'GURU',
          name:     guru.name,
          username: guru.username,
          subjects: mapelRows.map(r => `${r.name} (${r.kelas})`),
        },
      });
    }

    // 3. Cek Siswa (NIS sebagai username)
    const [siswaRows] = await db.query(
      'SELECT * FROM siswa WHERE nis = ? LIMIT 1', [username]
    );
    if (siswaRows.length > 0) {
      const siswa = siswaRows[0];
      if (password !== (siswa.password || 'murid123')) return err(res, 401, 'Password salah');
      return res.json({
        success: true,
        user: {
          id:        siswa.id,
          role:      'MURID',
          name:      siswa.name,
          username:  siswa.nis,
          studentId: siswa.nis,
          class:     siswa.kelas,
        },
      });
    }

    return err(res, 401, 'Username atau password salah');
  } catch (e) {
    console.error(e);
    return err(res, 500, 'Terjadi kesalahan server');
  }
});

// ===========================================================================
// SISWA
// ===========================================================================

// GET /api/siswa
app.get('/api/siswa', async (_req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM siswa ORDER BY kelas, name');
    // Map ke format yang dipakai frontend
    const data = rows.map(s => ({
      id:        s.id,
      name:      s.name,
      studentId: s.nis,
      class:     s.kelas,
      password:  s.password,
    }));
    res.json(data);
  } catch (e) {
    console.error(e);
    err(res, 500, 'Gagal mengambil data siswa');
  }
});

// POST /api/siswa
app.post('/api/siswa', async (req, res) => {
  const { name, studentId, class: kelas, password } = req.body;
  if (!name || !studentId) return err(res, 400, 'Nama dan NIS wajib diisi');
  try {
    const [result] = await db.query(
      'INSERT INTO siswa (name, nis, kelas, password) VALUES (?, ?, ?, ?)',
      [name, studentId, kelas || 'XII', password || 'murid123']
    );
    res.status(201).json({
      id: result.insertId, name, studentId, class: kelas || 'XII', password: password || 'murid123'
    });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return err(res, 409, 'NIS sudah digunakan');
    console.error(e);
    err(res, 500, 'Gagal menambah siswa');
  }
});

// PUT /api/siswa/:id
app.put('/api/siswa/:id', async (req, res) => {
  const { name, studentId, class: kelas, password } = req.body;
  const { id } = req.params;
  try {
    const fields = [];
    const vals   = [];
    if (name)      { fields.push('name = ?');     vals.push(name); }
    if (studentId) { fields.push('nis = ?');       vals.push(studentId); }
    if (kelas)     { fields.push('kelas = ?');     vals.push(kelas); }
    if (password)  { fields.push('password = ?');  vals.push(password); }
    if (!fields.length) return err(res, 400, 'Tidak ada field yang diubah');
    vals.push(id);
    await db.query(`UPDATE siswa SET ${fields.join(', ')} WHERE id = ?`, vals);
    res.json({ success: true });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return err(res, 409, 'NIS sudah digunakan');
    console.error(e);
    err(res, 500, 'Gagal mengupdate siswa');
  }
});

// DELETE /api/siswa/:id
app.delete('/api/siswa/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM siswa WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    err(res, 500, 'Gagal menghapus siswa');
  }
});

// ===========================================================================
// GURU
// ===========================================================================

// GET /api/guru
app.get('/api/guru', async (_req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM guru ORDER BY name');
    // Ambil mapel setiap guru
    const data = await Promise.all(rows.map(async g => {
      const [mapelRows] = await db.query(
        `SELECT mp.name, mp.kelas FROM guru_mata_pelajaran gmp
         JOIN mata_pelajaran mp ON gmp.mata_pelajaran_id = mp.id
         WHERE gmp.guru_id = ?`, [g.id]
      );
      return {
        id:       g.id,
        name:     g.name,
        username: g.username,
        password: g.password,
        nip:      g.nip,
        subjects: mapelRows.map(r => `${r.name} (${r.kelas})`),
      };
    }));
    res.json(data);
  } catch (e) {
    console.error(e);
    err(res, 500, 'Gagal mengambil data guru');
  }
});

// POST /api/guru
app.post('/api/guru', async (req, res) => {
  const { name, username, password, nip, subjects } = req.body;
  if (!name || !username) return err(res, 400, 'Nama dan username wajib diisi');
  try {
    const [result] = await db.query(
      'INSERT INTO guru (name, username, password, nip) VALUES (?, ?, ?, ?)',
      [name, username, password || 'guru123', nip || null]
    );
    const guruId = result.insertId;

    // Simpan relasi guru ↔ mapel jika ada
    if (subjects && subjects.length > 0) {
      for (const subjectStr of subjects) {
        const match = subjectStr.match(/^(.*?)\s*\(([^)]+)\)$/);
        let name = subjectStr;
        let kelas = null;
        if (match) {
          name = match[1].trim();
          kelas = match[2].trim();
        }
        const [mp] = kelas
          ? await db.query('SELECT id FROM mata_pelajaran WHERE name = ? AND kelas = ? LIMIT 1', [name, kelas])
          : await db.query('SELECT id FROM mata_pelajaran WHERE name = ? LIMIT 1', [name]);
        if (mp.length > 0) {
          await db.query(
            'INSERT IGNORE INTO guru_mata_pelajaran (guru_id, mata_pelajaran_id) VALUES (?, ?)',
            [guruId, mp[0].id]
          );
        }
      }
    }

    res.status(201).json({ id: guruId, name, username, password: password || 'guru123', nip: nip || null, subjects: subjects || [] });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return err(res, 409, 'Username sudah digunakan');
    console.error(e);
    err(res, 500, 'Gagal menambah guru');
  }
});

// PUT /api/guru/:id
app.put('/api/guru/:id', async (req, res) => {
  const { name, username, password, nip, subjects } = req.body;
  const { id } = req.params;
  try {
    const fields = [];
    const vals   = [];
    if (name)     { fields.push('name = ?');     vals.push(name); }
    if (username) { fields.push('username = ?'); vals.push(username); }
    if (password) { fields.push('password = ?'); vals.push(password); }
    if (nip !== undefined) { fields.push('nip = ?'); vals.push(nip || null); }

    if (fields.length) {
      vals.push(id);
      await db.query(`UPDATE guru SET ${fields.join(', ')} WHERE id = ?`, vals);
    }

    // Update relasi mapel jika dikirim
    if (subjects !== undefined) {
      await db.query('DELETE FROM guru_mata_pelajaran WHERE guru_id = ?', [id]);
      for (const subjectStr of subjects) {
        const match = subjectStr.match(/^(.*?)\s*\(([^)]+)\)$/);
        let name = subjectStr;
        let kelas = null;
        if (match) {
          name = match[1].trim();
          kelas = match[2].trim();
        }
        const [mp] = kelas
          ? await db.query('SELECT id FROM mata_pelajaran WHERE name = ? AND kelas = ? LIMIT 1', [name, kelas])
          : await db.query('SELECT id FROM mata_pelajaran WHERE name = ? LIMIT 1', [name]);
        if (mp.length > 0) {
          await db.query(
            'INSERT IGNORE INTO guru_mata_pelajaran (guru_id, mata_pelajaran_id) VALUES (?, ?)',
            [id, mp[0].id]
          );
        }
      }
    }

    res.json({ success: true });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return err(res, 409, 'Username sudah digunakan');
    console.error(e);
    err(res, 500, 'Gagal mengupdate guru');
  }
});

// DELETE /api/guru/:id
app.delete('/api/guru/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM guru WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    err(res, 500, 'Gagal menghapus guru');
  }
});

// ===========================================================================
// MATA PELAJARAN
// ===========================================================================

// GET /api/mapel
app.get('/api/mapel', async (_req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM mata_pelajaran ORDER BY FIELD(kelas,'X','XI','XII'), name"
    );
    const data = rows.map(m => ({ id: m.id, name: m.name, class: m.kelas }));
    res.json(data);
  } catch (e) {
    console.error(e);
    err(res, 500, 'Gagal mengambil mata pelajaran');
  }
});

// POST /api/mapel
app.post('/api/mapel', async (req, res) => {
  const { name, class: kelas } = req.body;
  if (!name) return err(res, 400, 'Nama mata pelajaran wajib diisi');
  try {
    const [result] = await db.query(
      'INSERT INTO mata_pelajaran (name, kelas) VALUES (?, ?)',
      [name, kelas || 'XII']
    );
    res.status(201).json({ id: result.insertId, name, class: kelas || 'XII' });
  } catch (e) {
    console.error(e);
    err(res, 500, 'Gagal menambah mata pelajaran');
  }
});

// PUT /api/mapel/:id
app.put('/api/mapel/:id', async (req, res) => {
  const { name, class: kelas } = req.body;
  const { id } = req.params;
  try {
    const fields = [];
    const vals   = [];
    if (name)  { fields.push('name = ?');  vals.push(name); }
    if (kelas) { fields.push('kelas = ?'); vals.push(kelas); }
    if (!fields.length) return err(res, 400, 'Tidak ada field yang diubah');
    vals.push(id);
    await db.query(`UPDATE mata_pelajaran SET ${fields.join(', ')} WHERE id = ?`, vals);
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    err(res, 500, 'Gagal mengupdate mata pelajaran');
  }
});

// DELETE /api/mapel/:id
app.delete('/api/mapel/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM mata_pelajaran WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    err(res, 500, 'Gagal menghapus mata pelajaran');
  }
});

// ===========================================================================
// NILAI (read-only dari rekap view)
// ===========================================================================
app.get('/api/nilai', async (_req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM rekapitulasi_nilai');
    res.json(rows);
  } catch (e) {
    console.error(e);
    err(res, 500, 'Gagal mengambil data nilai');
  }
});

// ===========================================================================
// Health check
// ===========================================================================
app.get('/api/health', (_req, res) => res.json({ status: 'ok', server: 'SMA Airmadidi Backend' }));

// ── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Server berjalan di http://localhost:${PORT}`);
  console.log(`   Frontend URL : ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`   Health check : http://localhost:${PORT}/api/health\n`);
});
