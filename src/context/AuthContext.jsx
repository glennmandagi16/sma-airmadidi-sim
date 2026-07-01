import { createContext, useContext, useState, useEffect } from 'react';
import { apiLogin } from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Pulihkan sesi dari localStorage saat halaman dibuka
  useEffect(() => {
    const savedUser = localStorage.getItem('sim_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  /**
   * Login — memanggil backend API.
   * Jika backend tidak tersedia, fallback ke admin hardcoded.
   */
  const login = async (username, password) => {
    try {
      const result = await apiLogin(username, password);
      if (result.success) {
        setUser(result.user);
        localStorage.setItem('sim_user', JSON.stringify(result.user));
        return { success: true };
      }
      return { success: false, message: 'Login gagal' };
    } catch (e) {
      // Fallback: jika backend mati, izinkan admin login
      if (username === 'admin' && password === 'admin123') {
        const mockUser = { id: 1, role: 'ADMIN', name: 'Admin SMA Airmadidi', username: 'admin' };
        setUser(mockUser);
        localStorage.setItem('sim_user', JSON.stringify(mockUser));
        return { success: true };
      }
      return { success: false, message: 'Server tidak tersedia. Coba lagi nanti.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sim_user');
  };

  /**
   * Update data user yang sedang login (misal: ganti password/nama di Settings)
   * Hanya update sesi lokal — perubahan permanen dilakukan lewat API di SettingsPage.
   */
  const updateUser = (data) => {
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    localStorage.setItem('sim_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, role: user?.role, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
