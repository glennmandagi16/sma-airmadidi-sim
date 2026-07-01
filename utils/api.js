/**
 * api.js — Frontend API Service Layer
 * Semua komunikasi ke backend melalui file ini.
 * SMA Kristen Airmadidi - Sistem Informasi Manajemen
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Helper fetch dengan error handling terpusat
 */
const request = async (path, options = {}) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return data;
};

// ===========================================================================
// AUTH
// ===========================================================================
export const apiLogin = (username, password) =>
  request('/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

// ===========================================================================
// SISWA
// ===========================================================================
export const apiGetSiswa    = ()           => request('/siswa');
export const apiAddSiswa    = (data)       => request('/siswa',       { method: 'POST',   body: JSON.stringify(data) });
export const apiUpdateSiswa = (id, data)   => request(`/siswa/${id}`, { method: 'PUT',    body: JSON.stringify(data) });
export const apiDeleteSiswa = (id)         => request(`/siswa/${id}`, { method: 'DELETE' });

// ===========================================================================
// GURU
// ===========================================================================
export const apiGetGuru    = ()           => request('/guru');
export const apiAddGuru    = (data)       => request('/guru',       { method: 'POST',   body: JSON.stringify(data) });
export const apiUpdateGuru = (id, data)   => request(`/guru/${id}`, { method: 'PUT',    body: JSON.stringify(data) });
export const apiDeleteGuru = (id)         => request(`/guru/${id}`, { method: 'DELETE' });

// ===========================================================================
// MATA PELAJARAN
// ===========================================================================
export const apiGetMapel    = ()           => request('/mapel');
export const apiAddMapel    = (data)       => request('/mapel',       { method: 'POST',   body: JSON.stringify(data) });
export const apiUpdateMapel = (id, data)   => request(`/mapel/${id}`, { method: 'PUT',    body: JSON.stringify(data) });
export const apiDeleteMapel = (id)         => request(`/mapel/${id}`, { method: 'DELETE' });

// ===========================================================================
// NILAI
// ===========================================================================
export const apiGetNilai = () => request('/nilai');

// ===========================================================================
// HEALTH CHECK
// ===========================================================================
export const apiHealth = () => request('/health');
