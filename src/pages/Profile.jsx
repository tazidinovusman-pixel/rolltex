import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase/supabaseClient';
import { Trash2, Plus, Minus, Sun, Moon } from 'lucide-react';

export default function Profile({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('info');

  // Списки из базы данных
  const [cartItems, setCartItems] = useState([]);
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Состояния для оформления заказа
  const [showForm, setShowForm] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });

  // --- СОСТОЯНИЕ ДЛЯ ДЕНЬ / НОЧЬ ---
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  // Переключаем тему и сохраняем в память
  const toggleTheme = () => {
    setDarkMode(!darkMode);
    localStorage.setItem('theme', !darkMode ? 'dark' : 'light');
  };

  useEffect(() => {
    if (user) {
      if (activeTab === 'cart') {
        fetchCart();
        setShowForm(false);
      }
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

  // ИЗМЕНЕНИЕ КОЛИЧЕСТВА МЕТРАЖА (+ / -)
  const handleUpdateQuantity = async (cartItemId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;

    if (newQuantity <= 0) {
      await handleRemoveFromCart(cartItemId);
      return;
    }

    const { error } = await supabase
      .from('cart')
      .update({ quantity: newQuantity })
      .eq('id', cartItemId);

    if (!error) {
      setCartItems(cartItems.map(item =>
        item.id === cartItemId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  // ОЧИСТКА КОРЗИНЫ В SUPABASE ПОСЛЕ ЗАКАЗА
  const clearCartInSupabase = async () => {
    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('user_id', user.id);

    if (!error) {
      setCartItems([]);
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

  // ОТПРАВКА ЗАКАЗА В ТЕЛЕГРАМ
  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    setIsOrdering(true);

    let message = `🛒 *ЖАҢЫ ЗАКАЗ (RollTex Ткани)*\n\n`;
    message += `👤 *Аты:* ${formData.name}\n`;
    message += `📞 *Тел:* ${formData.phone}\n`;
    message += `📍 *Дареги:* ${formData.address}\n\n`;
    message += `📦 *Ткани:*\n`;

    cartItems.forEach((item) => {
      if (item.products) {
        message += `• ${item.products.title} (${item.products.category}) — ${item.quantity} м. х ${item.products.price} сом\n`;
      }
    });

    message += `\n💰 *Жалпы сумма:* ${totalCartPrice} сом`;

    try {
      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'Markdown',
        }),
      });

      if (response.ok) {
        alert("Заказ ийгиликтүү катталды! Администратор сиз менен байланышат.");
        await clearCartInSupabase();
        setShowForm(false);
        setFormData({ name: '', phone: '', address: '' });
      } else {
        alert("Ката кетти. Кийинчерээк кайталап көрүңүз.");
      }
    } catch (error) {
      console.error(error);
      alert("Байланыш катасы кетти.");
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    // Главный контейнер теперь меняет фон жестко через классы в зависимости от darkMode
    <div className={`w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen transition-all duration-300 ${darkMode ? 'bg-zinc-950 text-white' : 'bg-white text-gray-900'}`}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">

        {/* МЕНЮ ВКЛАДОК */}
        <div className={`md:w-1/4 flex flex-col space-y-2 border-r pr-6 ${darkMode ? 'border-zinc-800' : 'border-gray-100'}`}>
          <button
            onClick={() => setActiveTab('info')}
            className={`text-left px-4 py-2.5 text-sm font-medium rounded transition-colors ${activeTab === 'info'
                ? (darkMode ? 'bg-zinc-100 text-zinc-950' : 'bg-gray-950 text-white')
                : (darkMode ? 'text-zinc-400 hover:bg-zinc-900' : 'text-gray-600 hover:bg-gray-50')
              }`}
          >
            Мой профиль
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`text-left px-4 py-2.5 text-sm font-medium rounded transition-colors ${activeTab === 'favorites'
                ? (darkMode ? 'bg-zinc-100 text-zinc-950' : 'bg-gray-950 text-white')
                : (darkMode ? 'text-zinc-400 hover:bg-zinc-900' : 'text-gray-600 hover:bg-gray-50')
              }`}
          >
            Избранное ({favoriteItems.length})
          </button>

          <button
            onClick={() => setActiveTab('cart')}
            className={`text-left px-4 py-2.5 text-sm font-medium rounded transition-colors ${activeTab === 'cart'
                ? (darkMode ? 'bg-zinc-100 text-zinc-950' : 'bg-gray-950 text-white')
                : (darkMode ? 'text-zinc-400 hover:bg-zinc-900' : 'text-gray-600 hover:bg-gray-50')
              }`}
          >
            Корзина ({cartItems.length})
          </button>

          <hr className={darkMode ? 'border-zinc-800 my-4' : 'border-gray-100 my-4'} />

          {/* БЛОК ПЕРЕКЛЮЧЕНИЯ ТЕМЫ В ПРОФИЛЕ */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800">
            <div className="space-y-0.5">
              <h4 className="text-sm font-medium text-gray-900 dark:text-zinc-100">Түн (Ночной режим)</h4>
              <p className="text-xs text-gray-400 dark:text-zinc-500">Переключить тему сайта</p>
            </div>

            {/* Кнопка-переключатель */}
            <button
              onClick={() => setDarkMode(!darkMode)} // <--- ИСПРАВЛЕНО: Строго меняет true на false и обратно
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${darkMode ? 'bg-zinc-100' : 'bg-gray-300'
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-zinc-950 transition-transform duration-300 ${darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
              />
            </button>
          </div>

          <button onClick={handleLogout} className={`text-left px-4 py-2.5 text-sm font-medium text-red-500 rounded transition-colors ${darkMode ? 'hover:bg-red-950/20' : 'hover:bg-red-50'}`}>
            Выйти из аккаунта
          </button>
        </div>

        {/* ПРАВАЯ СТОРОНА */}
        <div className="md:w-3/4 p-2">

          {/* ВКЛАДКА 1: ПРОФИЛЬ */}
          {activeTab === 'info' && (
            <div>
              <h2 className="text-xl font-light mb-4">Данные профиля</h2>
              <div className={`border p-6 rounded-md max-w-md ${darkMode ? 'bg-zinc-900/50 border-zinc-800' : 'bg-gray-50/50 border-gray-100'}`}>
                <p className={`text-xs font-medium uppercase tracking-wider mb-1 ${darkMode ? 'text-zinc-500' : 'text-gray-400'}`}>Email аккаунта</p>
                <p className="text-sm font-semibold">{user?.email}</p>
                <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-zinc-800/80' : 'border-gray-100'}`}>
                  <p className={`text-xs ${darkMode ? 'text-zinc-500' : 'text-gray-400'}`}>Статус клиента: Авторизован через систему RollTex</p>
                </div>
              </div>
            </div>
          )}

          {/* ВКЛАДКА 2: ИЗБРАННОЕ */}
          {activeTab === 'favorites' && (
            <div>
              <h2 className="text-xl font-light mb-4">Избранные ткани</h2>
              {loading ? (
                <div className={darkMode ? 'text-zinc-500 text-sm' : 'text-gray-400 text-sm'}>Загрузка избранного...</div>
              ) : favoriteItems.length === 0 ? (
                <div className={`border border-dashed py-12 text-center rounded-md ${darkMode ? 'border-zinc-800' : 'border-gray-200'}`}>
                  <p className={darkMode ? 'text-zinc-500 text-sm' : 'text-gray-400 text-sm'}>Вы пока не добавили ткани в избранное.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favoriteItems.map((item) => (
                    item.products && (
                      <div key={item.id} className={`border rounded-lg p-3 flex gap-3 relative shadow-xs ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100'}`}>
                        <img src={item.products.image_url} alt="" className={`w-20 h-24 object-cover rounded ${darkMode ? 'bg-zinc-800' : 'bg-gray-50'}`} />
                        <div className="flex flex-col justify-between py-1">
                          <div>
                            <span className={`text-[10px] uppercase font-medium block ${darkMode ? 'text-zinc-500' : 'text-gray-400'}`}>{item.products.category}</span>
                            <h4 className="text-sm font-medium line-clamp-1">{item.products.title}</h4>
                          </div>
                          <p className="text-sm font-semibold">{item.products.price} сом</p>
                        </div>
                        <button onClick={() => handleRemoveFromFavorites(item.id)} className={`absolute top-2 right-2 p-1 transition-colors ${darkMode ? 'text-zinc-600 hover:text-red-400' : 'text-gray-300 hover:text-red-500'}`}>
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
              <h2 className="text-xl font-light mb-4">Ваша корзина</h2>
              {loading ? (
                <div className={darkMode ? 'text-zinc-500 text-sm' : 'text-gray-400 text-sm'}>Загрузка корзины...</div>
              ) : cartItems.length === 0 ? (
                <div className={`border border-dashed py-12 text-center rounded-md mb-6 ${darkMode ? 'border-zinc-800' : 'border-gray-200'}`}>
                  <p className={darkMode ? 'text-zinc-500 text-sm' : 'text-gray-400 text-sm'}>В корзине пока нет добавленных рулонов.</p>
                </div>
              ) : !showForm ? (
                <>
                  <div className="space-y-3 mb-6">
                    {cartItems.map((item) => (
                      item.products && (
                        <div key={item.id} className={`border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between shadow-2xs gap-4 ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-100'}`}>
                          <div className="flex items-center gap-4">
                            <img src={item.products.image_url} alt="" className="w-16 h-16 object-cover rounded" />
                            <div>
                              <h4 className="text-sm font-medium">{item.products.title}</h4>
                              <p className={`text-xs mt-0.5 ${darkMode ? 'text-zinc-500' : 'text-gray-400'}`}>{item.products.price} сом / метр</p>
                            </div>
                          </div>

                          <div className={`flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 ${darkMode ? 'border-zinc-800' : 'border-gray-100'}`}>
                            {/* ИЗМЕНЕНИЕ МЕТРАЖА */}
                            <div className={`flex items-center gap-2.5 p-1 rounded-md border ${darkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-gray-50 border-gray-100'}`}>
                              <button
                                onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                                className={`p-1 rounded transition ${darkMode ? 'hover:bg-zinc-700 text-zinc-400' : 'hover:bg-gray-200 text-gray-600'}`}
                              >
                                <Minus size={12} />
                              </button>

                              <span className="text-xs font-semibold w-8 text-center">
                                {item.quantity} м.
                              </span>

                              <button
                                onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                                className={`p-1 rounded transition ${darkMode ? 'hover:bg-zinc-700 text-zinc-400' : 'hover:bg-gray-200 text-gray-600'}`}
                              >
                                <Plus size={12} />
                              </button>
                            </div>

                            {/* СУММА И УДАЛЕНИЕ */}
                            <div className="flex items-center gap-4">
                              <span className="text-sm font-semibold w-24 text-right">{(item.products.price * item.quantity)} сом</span>
                              <button onClick={() => handleRemoveFromCart(item.id)} className={`p-1 transition-colors ${darkMode ? 'text-zinc-600 hover:text-red-400' : 'text-gray-300 hover:text-red-500'}`}>
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    ))}

                    <div className={`p-4 rounded-lg flex justify-between items-center mt-4 border ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-gray-50 border-gray-100'}`}>
                      <span className={darkMode ? 'text-zinc-400 text-sm font-medium' : 'text-gray-600 text-sm font-medium'}>Итого к оплате:</span>
                      <span className="text-xl font-bold">{totalCartPrice} сом</span>
                    </div>
                  </div>

                  <div className={`pt-6 border-t flex justify-end ${darkMode ? 'border-zinc-800' : 'border-gray-100'}`}>
                    <button
                      onClick={() => setShowForm(true)}
                      className={`text-sm font-medium px-8 py-3 rounded transition-colors ${darkMode ? 'bg-zinc-100 text-zinc-950 hover:bg-zinc-200' : 'bg-gray-950 text-white hover:bg-gray-800'}`}
                    >
                      Оформить заказ
                    </button>
                  </div>
                </>
              ) : (
                /* ФОРМА ЗАКАЗА */
                <form onSubmit={handleOrderSubmit} className={`max-w-md p-6 rounded-lg border space-y-4 animate-in fade-in duration-200 ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-gray-50 border-gray-100'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-bold uppercase tracking-wider">Маалыматтарды толтуруңуз</h3>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className={`text-xs underline ${darkMode ? 'text-zinc-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}
                    >
                      ← Артка корзинага
                    </button>
                  </div>

                  <div>
                    <label className={`text-[11px] font-medium uppercase tracking-wide block mb-1 ${darkMode ? 'text-zinc-500' : 'text-gray-400'}`}>Атыңыз</label>
                    <input
                      type="text"
                      required
                      placeholder="Мисалы: Алихан"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full p-3 text-sm rounded outline-none transition-all border ${darkMode ? 'bg-zinc-800 border-zinc-700 focus:border-zinc-400 text-white' : 'bg-white border-gray-200 focus:border-gray-950 text-gray-900'}`}
                    />
                  </div>

                  <div>
                    <label className={`text-[11px] font-medium uppercase tracking-wide block mb-1 ${darkMode ? 'text-zinc-500' : 'text-gray-400'}`}>Телефон номериңиз</label>
                    <input
                      type="text"
                      required
                      placeholder="Мисалы: +996 700 123 456"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={`w-full p-3 text-sm rounded outline-none transition-all border ${darkMode ? 'bg-zinc-800 border-zinc-700 focus:border-zinc-400 text-white' : 'bg-white border-gray-200 focus:border-gray-950 text-gray-900'}`}
                    />
                  </div>

                  <div>
                    <label className={`text-[11px] font-medium uppercase tracking-wide block mb-1 ${darkMode ? 'text-zinc-500' : 'text-gray-400'}`}>Дарегиңиз (Шаар, Көчө, Үй)</label>
                    <input
                      type="text"
                      required
                      placeholder="Мисалы: Бишкек ш., Чуй пр., 12-үй"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className={`w-full p-3 text-sm rounded outline-none transition-all border ${darkMode ? 'bg-zinc-800 border-zinc-700 focus:border-zinc-400 text-white' : 'bg-white border-gray-200 focus:border-gray-950 text-gray-900'}`}
                    />
                  </div>

                  <div className={`p-3 rounded flex justify-between items-center text-sm border ${darkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-gray-100'}`}>
                    <span className={darkMode ? 'text-zinc-400' : 'text-gray-500'}>Төлөнүүчү сумма:</span>
                    <strong>{totalCartPrice} сом</strong>
                  </div>

                  <button
                    type="submit"
                    disabled={isOrdering}
                    className={`w-full py-3 text-sm font-medium rounded uppercase tracking-wider transition-colors disabled:bg-gray-400 ${darkMode ? 'bg-zinc-100 text-zinc-950 hover:bg-zinc-200' : 'bg-gray-950 text-white hover:bg-gray-800'}`}
                  >
                    {isOrdering ? "Жөнөтүлүүдө..." : "Заказды тастыктоо"}
                  </button>
                </form>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}