import React from 'react';
import { Link } from 'react-router-dom';
import { Search, User, ShoppingBag, Settings } from 'lucide-react';

// Добавили пропсы searchQuery и setSearchQuery для управления глобальным поиском
export default function Header({ user, role, searchQuery, setSearchQuery }) {
  return (
    <header className="border-b border-gray-100 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Логотип (При клике очищает поиск, чтобы показать все товары) */}
        <Link 
          to="/" 
          onClick={() => setSearchQuery && setSearchQuery('')}
          className="text-2xl font-bold tracking-wider text-gray-950"
        >
          RollTex
        </Link>

        {/* Поисковик — Теперь полностью рабочий */}
        <div className="hidden sm:flex items-center flex-1 max-w-md mx-8 relative">
          <input
            type="text"
            value={searchQuery || ''} // Привязали значение к стейту
            onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)} // Обновляем стейт при вводе
            placeholder="Что вы ищете?..."
            className="w-full bg-gray-50 text-sm text-gray-800 placeholder-gray-400 pl-4 pr-10 py-2.5 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300 transition-all"
          />
          <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
        </div>

        {/* Навигация */}
        <div className="flex items-center space-x-6">
          
          {/* Если зашел АДМИН, показываем красивую кнопку управления */}
          {user && role === 'admin' && (
            <Link 
              to="/admin" 
              className="flex items-center gap-1 text-xs uppercase tracking-wider font-semibold text-red-600 hover:text-red-800 transition-colors bg-red-50 px-3 py-1.5 rounded"
            >
              <Settings className="w-3.5 h-3.5" />
              Панель Админа
            </Link>
          )}

          {/* Кнопка Профиля (Личного кабинета) */}
          <Link 
            to={user ? "/profile" : "/auth"} 
            className="flex items-center space-x-1.5 text-gray-600 hover:text-black transition-colors"
          >
            <User className="w-5 h-5 stroke-[1.5]" />
            <span className="text-sm font-medium hidden md:inline">
              {user ? 'Личный кабинет' : 'Войти'}
            </span>
          </Link>

          {/* Корзина */}
          <Link to="/profile" className="text-gray-600 hover:text-black transition-colors relative">
            <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
          </Link>
        </div>

      </div>
    </header>
  );
}