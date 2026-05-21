import React from 'react';
import CategoryPage from './CategoryPage';

export default function Hlopok({ user, onBack }) {
  // Передаем user и categoryName в общий шаблон
  return <CategoryPage categoryName="Хлопок" user={user} onBack={onBack} />;
}