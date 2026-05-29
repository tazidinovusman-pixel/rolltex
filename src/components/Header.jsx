import React from 'react';
import { Link } from 'react-router-dom';
import { Search, User, ShoppingBag, Settings, Sun, Moon } from 'lucide-react';

export default function Header({ user, role, searchQuery, setSearchQuery, darkMode, setDarkMode }) {
  return (
    <header className="border-b border-gray-100 dark:border-zinc-900 bg-white dark:bg-zinc-950 sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Логотип */}
        <Link 
          to="/" 
          onClick={() => setSearchQuery && setSearchQuery('')}
          className="text-2xl font-bold tracking-wider text-gray-950 dark:text-zinc-50"
        >
          RollTex
        </Link>

        {/* Поисковик */}
        <div className="hidden sm:flex items-center flex-1 max-w-md mx-8 relative">
          <input
            type="text"
            value={searchQuery || ''}
            onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
            placeholder="Что вы ищете?..."
            className="w-full bg-gray-50 dark:bg-zinc-900 text-sm text-gray-800 dark:text-zinc-200 placeholder-gray-400 dark:placeholder-zinc-500 pl-4 pr-10 py-2.5 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-zinc-700 transition-all"
          />
          <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400 dark:text-zinc-500" />
        </div>

        {/* Навигация */}
        <div className="flex items-center space-x-5">
          
          {/* УДОБНАЯ КНОПКА СМЕНЫ ТЕМЫ (ЛУНА / СОЛНЦЕ) */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors"
            title={darkMode ? "Включить светлый режим" : "Включить ночной режим"}
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-amber-500 stroke-[1.5]" />
            ) : (
              <Moon className="w-5 h-5 stroke-[1.5]" />
            )}
          </button>
          
          {/* Панель Админа */}
          {user && role === 'admin' && (
            <Link 
              to="/admin" 
              className="flex items-center gap-1 text-xs uppercase tracking-wider font-semibold text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors bg-red-50 dark:bg-red-950/30 px-3 py-1.5 rounded"
            >
              <Settings className="w-3.5 h-3.5" />
              Панель Админа
            </Link>
          )}

          {/* Кнопка Профиля */}
          <Link 
            to={user ? "/profile" : "/auth"} 
            className="flex items-center space-x-1.5 text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-100 transition-colors"
          >
            <User className="w-5 h-5 stroke-[1.5]" />
            <span className="text-sm font-medium hidden md:inline">
              {user ? 'Личный кабинет' : 'Войти'}
            </span>
          </Link>

          {/* Корзина */}
          <Link to="/profile" className="text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-100 transition-colors relative">
            <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
          </Link>
        </div>

      </div>
    </header>
  );
}