import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase/supabaseClient';
import { ShoppingBag, Heart } from 'lucide-react';

export default function CategoryPage({ categoryName, onBack, singleProduct, user }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(singleProduct || null);
  const [activePhoto, setActivePhoto] = useState('');
  
  // Массив ID товаров, которые лайкнул пользователь
  const [likedProducts, setLikedProducts] = useState([]);

  // Загружаем данные при открытии компонента
  useEffect(() => {
    if (user) fetchUserFavorites();
    
    setSelectedProduct(singleProduct || null);
    if (singleProduct) {
      setActivePhoto(singleProduct.image_url);
      setLoading(false);
    } else if (categoryName) {
      fetchCategoryProducts();
    }
  }, [categoryName, singleProduct, user]);

  // Обновляем главную фотографию при переключении товара
  useEffect(() => {
    if (selectedProduct) {
      setActivePhoto(selectedProduct.image_url);
    }
  }, [selectedProduct]);

  // Получение товаров текущей категории
  const fetchCategoryProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', categoryName)
      .order('created_at', { ascending: false });
    
    if (!error && data) setProducts(data);
    setLoading(false);
  };

  // Получение списка избранного из Supabase (как в Home.jsx)
  const fetchUserFavorites = async () => {
    const { data, error } = await supabase
      .from('favorites')
      .select('product_id')
      .eq('user_id', user.id);
    if (!error && data) setLikedProducts(data.map(f => f.product_id));
  };

  // Переключение избранного в Supabase (как в Home.jsx)
  const handleToggleFavorite = async (productId, e) => {
    if (e) e.stopPropagation(); 
    if (!user) {
      alert('Пожалуйста, войдите в аккаунт, чтобы добавлять ткани в избранное!');
      return;
    }
    const isLiked = likedProducts.includes(productId);
    if (isLiked) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);
      if (!error) setLikedProducts(likedProducts.filter(id => id !== productId));
    } else {
      const { error } = await supabase
        .from('favorites')
        .insert([{ user_id: user.id, product_id: productId }]);
      if (!error) setLikedProducts([...likedProducts, productId]);
    }
  };

  // Добавление в корзину в Supabase (как в Home.jsx)
  const handleAddToCart = async (productId, e) => {
    if (e) e.stopPropagation(); 
    if (!user) {
      alert('Пожалуйста, войдите в аккаунт, чтобы совершать покупки!');
      return;
    }
    const { data: item } = await supabase
      .from('cart')
      .select('*')
      .eq('user_id', user.id)
      .eq('product_id', productId);

    if (item && item.length > 0) {
      await supabase
        .from('cart')
        .update({ quantity: item[0].quantity + 1 })
        .eq('id', item[0].id);
      alert('Количество товара в корзине увеличено!');
    } else {
      await supabase
        .from('cart')
        .insert([{ user_id: user.id, product_id: productId, quantity: 1 }]);
      alert('Ткань успешно добавлена в корзину!');
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-950">
      
      {!selectedProduct ? (
        /* 1. РЕЖИМ СПИСКА ТОВАРОВ КАТЕГОРИИ */
        <div className="max-w-7xl mx-auto px-4 py-8">
          <button onClick={onBack} className="text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-black mb-6 transition-colors">
            ← На главную
          </button>

          <h1 className="text-2xl md:text-4xl font-light text-gray-900 mb-8 uppercase tracking-wide">
            Категория: {categoryName}
          </h1>

          {loading ? (
            <div className="text-center py-20 text-xs text-gray-400">Загрузка тканей...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-xs text-gray-400">В этой категории пока нет рулонов.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-2 md:gap-x-6 gap-y-6 md:gap-y-10">
              {products.map((product) => {
                const isFavorite = likedProducts.includes(product.id);
                return (
                  <div key={product.id} onClick={() => setSelectedProduct(product)} className="group relative flex flex-col bg-white border border-gray-100 rounded-xl p-1.5 md:p-2 hover:shadow-sm transition-shadow cursor-pointer">
                    
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
      ) : (
        /* 2. РЕЖИМ БОЛЬШОЙ СТРАНИЦЫ ТОВАРA */
        <div className="max-w-4xl mx-auto px-4 py-12">
          <button onClick={() => setSelectedProduct(null)} className="text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-black mb-6 transition-colors">
            ← Назад в категорию {categoryName}
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white border border-gray-100 p-4 md:p-8 rounded-3xl shadow-xs">
            
            {/* ЛЕВАЯ СТОРОНА: ИНТЕРАКТИВНАЯ ГАЛЕРЕЯ */}
            <div className="space-y-4">
              <div className="w-full aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                <img src={activePhoto} alt={selectedProduct.title} className="w-full h-full object-cover transition-all duration-300" />
              </div>

              {selectedProduct.images && selectedProduct.images.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  <button 
                    onClick={() => setActivePhoto(selectedProduct.image_url)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${activePhoto === selectedProduct.image_url ? 'border-gray-950 scale-95' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  >
                    <img src={selectedProduct.image_url} alt="" className="w-full h-full object-cover" />
                  </button>

                  {selectedProduct.images.map((url, index) => (
                    <button 
                      key={index}
                      onClick={() => setActivePhoto(url)}
                      className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${activePhoto === url ? 'border-gray-950 scale-95' : 'border-transparent opacity-70 hover:opacity-100'}`}
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ПРАВАЯ СТОРОНА: ИНФОРМАЦИЯ И ОПИСАНИЕ */}
            <div className="flex flex-col justify-between py-2">
              <div>
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="bg-gray-950 text-white text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider">
                    {selectedProduct.category}
                  </span>
                  {selectedProduct.sub_category && (
                    <span className="bg-purple-50 text-purple-600 text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider border border-purple-100">
                      {selectedProduct.sub_category}
                    </span>
                  )}
                </div>
                
                <h1 className="text-xl md:text-3xl font-normal text-gray-900 mt-4 mb-2">
                  {selectedProduct.title}
                </h1>
                
                <div className="font-mono text-xl md:text-2xl font-bold text-gray-900 mb-6">
                  {selectedProduct.price} сом <span className="text-xs font-sans font-normal text-gray-400">/ метр</span>
                </div>
                
                <div className="border-t border-gray-100 pt-4">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Подробное описание рулона</h3>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                    {selectedProduct.description || 'Описание для данного рулона премиальной ткани скоро появится.'}
                  </p>
                </div>
              </div>

              {/* БЛОК КНОПОК ДЕЙСТВИЯ */}
              <div className="flex gap-3 mt-8">
                <button 
                  onClick={(e) => handleAddToCart(selectedProduct.id, e)} 
                  className="flex-1 bg-gray-950 text-white text-xs py-4 rounded-xl font-semibold uppercase tracking-wider hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Добавить в корзину</span>
                </button>

                <button 
                  onClick={(e) => handleToggleFavorite(selectedProduct.id, e)}
                  className="px-4 bg-gray-50 text-gray-950 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center group"
                  title="В избранное"
                >
                  <Heart 
                    className={`w-5 h-5 group-hover:scale-110 transition-transform ${
                      likedProducts.includes(selectedProduct.id) ? 'fill-red-500 text-red-500' : 'text-gray-950'
                    }`} 
                  />
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}