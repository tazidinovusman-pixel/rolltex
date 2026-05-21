import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase/supabaseClient';
import { Trash2 } from 'lucide-react';

export default function Profile({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('info');
  
  // Списки из базы данных
  const [cartItems, setCartItems] = useState([]);
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      if (activeTab === 'cart') fetchCart();
      if (activeTab === 'favorites') fetchFavorites();
    }
  }, [activeTab, user]);

  // 1. ЗАГРУЗКА КОРЗИНЫ
  const fetchCart = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('cart')
      .select(`
        id,
        quantity,
        products (id, title, price, image_url, category)
      `)
      .eq('user_id', user.id);

    if (!error && data) setCartItems(data);
    setLoading(false);
  };

  // 2. ЗАГРУЗКА ИЗБРАННОГО
  const fetchFavorites = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        id,
        products (id, title, price, image_url, category)
      `)
      .eq('user_id', user.id);

    if (!error && data) setFavoriteItems(data);
    setLoading(false);
  };

  // 3. УДАЛЕНИЕ ИЗ КОРЗИНЫ
  const handleRemoveFromCart = async (cartItemId) => {
    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('id', cartItemId);

    if (!error) {
      setCartItems(cartItems.filter(item => item.id !== cartItemId));
    }
  };

  // 4. УДАЛЕНИЕ ИЗ ИЗБРАННОГО
  const handleRemoveFromFavorites = async (favItemId) => {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('id', favItemId);

    if (!error) {
      setFavoriteItems(favoriteItems.filter(item => item.id !== favItemId));
    }
  };

  // Считаем общую стоимость корзины
  const totalCartPrice = cartItems.reduce((sum, item) => {
    return sum + (item.products?.price || 0) * item.quantity;
  }, 0);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-white min-h-screen">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* МЕНЮ ВКЛАДОК */}
        <div className="md:w-1/4 flex flex-col space-y-2 border-r border-gray-100 pr-6">
          <button onClick={() => setActiveTab('info')} className={`text-left px-4 py-2.5 text-sm font-medium rounded transition-colors ${activeTab === 'info' ? 'bg-gray-950 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
            Мой профиль
          </button>
          
          <button onClick={() => setActiveTab('favorites')} className={`text-left px-4 py-2.5 text-sm font-medium rounded transition-colors ${activeTab === 'favorites' ? 'bg-gray-950 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
            Избранное ({favoriteItems.length})
          </button>
          
          <button onClick={() => setActiveTab('cart')} className={`text-left px-4 py-2.5 text-sm font-medium rounded transition-colors ${activeTab === 'cart' ? 'bg-gray-950 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
            Корзина ({cartItems.length})
          </button>
          
          <hr className="border-gray-100 my-4" />
          
          <button onClick={handleLogout} className="text-left px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded transition-colors">
            Выйти из аккаунта
          </button>
        </div>

        {/* ПРАВАЯ СТОРОНА */}
        <div className="md:w-3/4 bg-white p-2">
          
          {/* ВКЛАДКА 1: ПРОФИЛЬ */}
          {activeTab === 'info' && (
            <div>
              <h2 className="text-xl font-light text-gray-900 mb-4">Данные профиля</h2>
              <div className="bg-gray-50/50 border border-gray-100 p-6 rounded-md max-w-md">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Email аккаунта</p>
                <p className="text-sm font-semibold text-gray-900">{user?.email}</p>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400">Статус клиента: Авторизован через систему RollTex</p>
                </div>
              </div>
            </div>
          )}

          {/* ВКЛАДКА 2: ИЗБРАННОЕ */}
          {activeTab === 'favorites' && (
            <div>
              <h2 className="text-xl font-light text-gray-900 mb-4">Избранные ткани</h2>
              {loading ? (
                <div className="text-sm text-gray-400">Загрузка избранного...</div>
              ) : favoriteItems.length === 0 ? (
                <div className="border border-dashed border-gray-200 py-12 text-center rounded-md">
                  <p className="text-sm text-gray-400">Вы пока не добавили ткани in избранное.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favoriteItems.map((item) => (
                    item.products && (
                      <div key={item.id} className="border border-gray-100 rounded-lg p-3 flex gap-3 relative bg-white shadow-xs">
                        <img src={item.products.image_url} alt="" className="w-20 h-24 object-cover rounded bg-gray-50" />
                        <div className="flex flex-col justify-between py-1">
                          <div>
                            <span className="text-[10px] text-gray-400 uppercase font-medium block">{item.products.category}</span>
                            <h4 className="text-sm font-medium text-gray-900 line-clamp-1">{item.products.title}</h4>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">{item.products.price} сом</p>
                        </div>
                        <button onClick={() => handleRemoveFromFavorites(item.id)} className="absolute top-2 right-2 text-gray-300 hover:text-red-500 p-1 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ВКЛАДКА 3: КОРЗИНА */}
          {activeTab === 'cart' && (
            <div>
              <h2 className="text-xl font-light text-gray-900 mb-4">Ваша корзина</h2>
              {loading ? (
                <div className="text-sm text-gray-400">Загрузка корзины...</div>
              ) : cartItems.length === 0 ? (
                <div className="border border-dashed border-gray-200 py-12 text-center rounded-md mb-6">
                  <p className="text-sm text-gray-400">В корзине пока нет добавленных рулонов.</p>
                </div>
              ) : (
                <div className="space-y-3 mb-6">
                  {cartItems.map((item) => (
                    item.products && (
                      <div key={item.id} className="border border-gray-100 rounded-lg p-4 flex items-center justify-between bg-white shadow-2xs">
                        <div className="flex items-center gap-4">
                          <img src={item.products.image_url} alt="" className="w-16 h-16 object-cover rounded" />
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">{item.products.title}</h4>
                            <p className="text-xs text-gray-400 mt-0.5">{item.products.price} сом / метр</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <span className="text-sm text-gray-500">Кол-во: <strong className="text-gray-900">{item.quantity} м.</strong></span>
                          <span className="text-sm font-semibold text-gray-900 w-24 text-right">{(item.products.price * item.quantity)} сом</span>
                          <button onClick={() => handleRemoveFromCart(item.id)} className="text-gray-300 hover:text-red-500 p-1 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )
                  ))}

                  <div className="p-4 bg-gray-50 rounded-lg flex justify-between items-center mt-4">
                    <span className="text-sm font-medium text-gray-600">Итого к оплате:</span>
                    <span className="text-xl font-bold text-gray-900">{totalCartPrice} сом</span>
                  </div>
                </div>
              )}
              
              <div className="pt-6 border-t border-gray-100 flex justify-end">
                <button 
                  disabled={cartItems.length === 0} 
                  className={`text-sm font-medium px-8 py-3 rounded transition-colors ${
                    cartItems.length === 0 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-gray-950 text-white hover:bg-gray-800'
                  }`}
                >
                  Оформить заказ
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}