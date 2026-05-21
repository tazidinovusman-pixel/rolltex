import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase/supabaseClient';
import { ShoppingBag, Heart } from 'lucide-react';
import bannerImage from '../assets/bannerImg.png';

// Импорт файлов категорий
import Shelk from './Shelk';
import Hlopok from './Hlopok';
import Len from './Len';
import Sherst from './Sherst';
import Barhat from './Barhat';
import Atlas from './Atlas';
import Trikotaj from './Trikotaj';
import Viskoza from './Viskoza';
import CategoryPage from '../pages/CategoryPage'; 

// 1. ДОБАВИЛИ searchQuery В ПРОПСЫ КОМПОНЕНТА
export default function Home({ user, searchQuery = '' }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedProducts, setLikedProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Все');
  
  // Состояния для переключения экранов и просмотра деталей
  const [currentScreen, setCurrentScreen] = useState('MAIN'); 
  const [selectedProduct, setSelectedProduct] = useState(null);

  const categories = ['Все', 'Шелк', 'Хлопок', 'Лен', 'Шерсть', 'Бархат', 'Атлас', 'Трикотаж', 'Вискоза'];

  useEffect(() => {
    fetchProducts();
    if (user) fetchUserFavorites();
  }, [user]);

  // 2. АВТО-СБРОС КАТЕГОРИИ ПРИ ВВОДЕ В ПОИСКОВИК
  // Если пользователь начинает писать в поиске, сбрасываем экраны подкатегорий на "Все",
  // чтобы мгновенно отобразить результаты глобального поиска.
  useEffect(() => {
    if (searchQuery.trim() !== '') {
      setCurrentScreen('MAIN');
      setSelectedCategory('Все');
      setSelectedProduct(null); // Закрываем детальный просмотр при поиске
    }
  }, [searchQuery]);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setProducts(data);
    setLoading(false);
  };

  const fetchUserFavorites = async () => {
    const { data, error } = await supabase
      .from('favorites')
      .select('product_id')
      .eq('user_id', user.id);
    if (!error && data) setLikedProducts(data.map(f => f.product_id));
  };

  const handleToggleFavorite = async (productId, e) => {
    e.stopPropagation(); 
    if (!user) {
      alert('Пожалуйста, войдите в аккаунт, чтобы добавлять ткани в избранное!');
      return;
    }
    const isLiked = likedProducts.includes(productId);
    if (isLiked) {
      const { error } = await supabase.from('favorites').delete().eq('user_id', user.id).eq('product_id', productId);
      if (!error) setLikedProducts(likedProducts.filter(id => id !== productId));
    } else {
      const { error } = await supabase.from('favorites').insert([{ user_id: user.id, product_id: productId }]);
      if (!error) setLikedProducts([...likedProducts, productId]);
    }
  };

  const handleAddToCart = async (productId, e) => {
    e.stopPropagation(); 
    if (!user) {
      alert('Пожалуйста, войдите в аккаунт, чтобы совершать покупки!');
      return;
    }
    const { data: item } = await supabase.from('cart').select('*').eq('user_id', user.id).eq('product_id', productId);
    if (item && item.length > 0) {
      await supabase.from('cart').update({ quantity: item[0].quantity + 1 }).eq('id', item[0].id);
      alert('Количество товара в корзине увеличено!');
    } else {
      await supabase.from('cart').insert([{ user_id: user.id, product_id: productId, quantity: 1 }]);
      alert('Ткань успешно добавлена в корзину!');
    }
  };

  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat);
    if (cat !== 'Все') {
      setCurrentScreen(cat.toUpperCase()); 
    } else {
      setCurrentScreen('MAIN');
    }
  };

  // 3. ФИЛЬТРАЦИЯ ДАННЫХ ПО НАЗВАНИЮ И КАТЕГОРИИ
  const filteredProducts = products.filter((product) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true; // Если пустой поиск — показываем всё
    
    return (
      product.title?.toLowerCase().includes(query) || 
      product.category?.toLowerCase().includes(query)
    );
  });

  // --- ЛОГИКА ПЕРЕКЛЮЧЕНИЯ МЕЖДУ СТРАНИЦАМИ ---
  if (selectedProduct) {
    return (
      <CategoryPage 
        categoryName={selectedProduct.category} 
        onBack={() => setSelectedProduct(null)} 
        singleProduct={selectedProduct} 
        user={user}
      />
    );
  }

  if (currentScreen === 'ШЕЛК') return <Shelk user={user} onBack={() => setCurrentScreen('MAIN')} />;
  if (currentScreen === 'ХЛОПОК') return <Hlopok user={user} onBack={() => setCurrentScreen('MAIN')} />;
  if (currentScreen === 'ЛЕН') return <Len user={user} onBack={() => setCurrentScreen('MAIN')} />;
  if (currentScreen === 'ШЕРСТЬ') return <Sherst user={user} onBack={() => setCurrentScreen('MAIN')} />;
  if (currentScreen === 'БАРХАТ') return <Barhat user={user} onBack={() => setCurrentScreen('MAIN')} />;
  if (currentScreen === 'АТЛАС') return <Atlas user={user} onBack={() => setCurrentScreen('MAIN')} />;
  if (currentScreen === 'ТРИКОТАЖ') return <Trikotaj user={user} onBack={() => setCurrentScreen('MAIN')} />;
  if (currentScreen === 'ВИСКОЗА') return <Viskoza user={user} onBack={() => setCurrentScreen('MAIN')} />;

  return (
    <div className="bg-white min-h-screen">
      {/* Баннер */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
        <div className="bg-gray-50 rounded-2xl p-6 md:p-16 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-md space-y-3 text-center md:text-left">
            <span className="text-[10px] md:text-xs font-semibold tracking-widest text-gray-400 uppercase">Новая коллекция</span>
            <h1 className="text-2xl md:text-5xl font-light text-gray-900 leading-tight">Ваша зона комфорта, созданная с душой</h1>
            <p className="text-xs md:text-sm text-gray-500 font-light">Натуральные премиальные ткани для одежды и интерьера.</p>
          </div>
          <div className="w-full md:w-1/2 max-w-xs md:max-w-sm aspect-square bg-gray-200 rounded-xl overflow-hidden shadow-sm">
            <img src={bannerImage} onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600'; }} alt="" className="w-full h-full object-cover mix-blend-multiply" />
          </div>
        </div>
      </div>

      {/* Горизонтальный скролл категорий */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 border-b border-gray-100 sticky top-14 bg-white z-40 overflow-x-auto whitespace-nowrap scrollbar-none">
        <div className="flex items-center space-x-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`text-[11px] md:text-xs uppercase tracking-wider font-medium px-3.5 py-2 rounded-full transition-all ${
                selectedCategory === cat && currentScreen === 'MAIN' ? 'bg-gray-950 text-white shadow-sm' : 'bg-gray-50 text-gray-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* СЕТКА ТОВАРОВ "ВСЕ" С УЧЕТОМ ПОИСКА */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-6 md:py-12">
        {loading ? (
          <div className="text-center py-20 text-xs text-gray-400">Загрузка каталог...</div>
        ) : filteredProducts.length === 0 ? ( // 4. ЗАМЕНИЛИ products.length НА filteredProducts.length
          <div className="text-center py-20 text-xs text-gray-400">Ткани с такими параметрами не найдены.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-2 md:gap-x-6 gap-y-6 md:gap-y-10">
            {filteredProducts.map((product) => { // 5. ИТЕРИРУЕМ filteredProducts Вместо Обычного МАССИВА
              const isFavorite = likedProducts.includes(product.id);
              return (
                <div 
                  key={product.id} 
                  onClick={() => setSelectedProduct(product)} 
                  className="group relative flex flex-col bg-white border border-gray-100 rounded-xl p-1.5 md:p-2 hover:shadow-sm transition-shadow cursor-pointer"
                >
                  {/* Фото ткани */}
                  <div className="w-full aspect-[4/5] bg-gray-50 rounded-lg overflow-hidden relative mb-2 md:mb-4">
                    <img src={product.image_url} alt={product.title} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" />
                    <button 
                      onClick={(e) => handleToggleFavorite(product.id, e)}
                      className="absolute top-2 right-2 bg-white/80 backdrop-blur-md p-1.5 rounded-full shadow-xs active:scale-95 transition-transform"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                    </button>
                  </div>

                  {/* Описание товара */}
                  <div className="flex-1 flex flex-col justify-between px-1">
                    <div>
                      <span className="text-[9px] md:text-[11px] uppercase tracking-widest text-gray-400 font-medium">{product.category}</span>
                      <h3 className="text-xs md:text-sm font-medium text-gray-900 line-clamp-1 mt-0.5">{product.title}</h3>
                    </div>
                    
                    {/* Цена и кнопка купить */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-gray-50 mt-2 gap-2">
                      <span className="text-xs md:text-sm font-semibold text-gray-900 whitespace-nowrap">{product.price} сом <span className="text-[10px] text-gray-400 font-normal">/ м</span></span>
                      <button 
                        onClick={(e) => handleAddToCart(product.id, e)}
                        className="flex items-center justify-center gap-1 bg-gray-950 text-white text-[10px] md:text-xs py-2 px-2 md:px-3 rounded font-medium hover:bg-gray-800 transition-colors w-full sm:w-auto"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        <span>В корзину</span>
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}