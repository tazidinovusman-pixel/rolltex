import React from 'react';
import CategoryPage from './CategoryPage';

export default function Atlas({ onBack }) {
  return <CategoryPage categoryName="Атлас" onBack={onBack} />;
}