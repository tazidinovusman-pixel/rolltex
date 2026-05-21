import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabase/supabaseClient';
import Header from './components/Header';
import Home from './pages/Home';
import Profile from './pages/Profile';
import AuthPage from './pages/AuthPage';
import AdminPage from './pages/admin/AdminPage';

export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('user'); // Роль пользователя ('user' или 'admin')
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(''); // Состояние для глобального поиска

  // Функция получения роли пользователя из таблицы profiles
  const fetchUserRole = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId);

      if (data && data.length > 0 && !error) {
        setRole(data[0].role); // Берем роль ('admin' или 'user')
      } else {
        setRole('user'); // Если профиля нет в базе, ставим дефолт
      }
    } catch (err) {
      console.error("Ошибка при получении роли:", err);
      setRole('user');
    } finally {
      setLoading(false); // В любом случае убираем экран загрузки
    }
  };

  useEffect(() => {
    // 1. Проверяем сессию при старте приложения
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchUserRole(currentUser.id);
      } else {
        setRole('user');
        setLoading(false);
      }
    });

    // 2. Слушаем изменения состояния авторизации (вход, выход)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        fetchUserRole(currentUser.id);
      } else {
        setRole('user');
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthSuccess = (loggedUser) => {
    setUser(loggedUser);
    if (loggedUser) {
      fetchUserRole(loggedUser.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-sm text-gray-400">
        Загрузка RollTex...
      </div>
    );
  }

  return (
    <Router>
      <div className="bg-white text-gray-900 min-h-screen antialiased">
        {/* Передаем стейты поиска в Хедер */}
        <Header 
          user={user} 
          role={role} 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
        />
        
        <Routes>
          {/* СВЯЗАЛИ ПОИСК: Передали строку поиска в компонент Home */}
          <Route path="/" element={<Home user={user} searchQuery={searchQuery} />} />
          
          <Route 
            path="/profile" 
            element={user ? <Profile user={user} onLogout={() => { setUser(null); setRole('user'); }} /> : <Navigate to="/auth" />} 
          />
          
          <Route 
            path="/auth" 
            element={!user ? <AuthPage onAuthSuccess={handleAuthSuccess} /> : <Navigate to="/profile" />} 
          />

          <Route path="/admin" element={user && role === 'admin' ? <AdminPage /> : <Navigate to="/" />} />  
        </Routes>
      </div>
    </Router>
  );
}