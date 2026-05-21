import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/supabaseClient'; // Проверь правильность пути к твоему supabaseClient!

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('add-product');
  const [loading, setLoading] = useState(false);
  
  // Состояние для открытия/закрытия бургер-меню на мобилке
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // --- СОСТОЯНИЯ ДЛЯ ФОРМЫ ТОВАРА ---
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Хлопок');
  const [tag, setTag] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');

  // --- РЕАЛЬНЫЕ ДАННЫЕ ИЗ БАЗЫ ---
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchClients();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setProducts(data);
  };

  const fetchClients = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'user');
    if (!error && data) setClients(data);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('products')
      .insert([{ title, category, tag, price: Number(price), image_url: imageUrl, description }]);

    setLoading(false);

    if (error) {
      alert('Ошибка при сохранении: ' + error.message);
    } else {
      alert('Товар успешно сохранен в Supabase!');
      setTitle(''); setPrice(''); setTag(''); setImageUrl(''); setDescription('');
      fetchProducts();
    }
  };

  const handleDeleteProduct = async (id) => {
    if (confirm('Вы уверены, что хотите удалить этот товар из базы данных?')) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (!error) fetchProducts();
    }
  };

  const handleDeleteClient = async (id) => {
    if (confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (!error) fetchClients();
    }
  };

  // Функция для удобного переключения вкладок на мобилке (меняет вкладку и закрывает бургер)
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setIsMenuOpen(false); // Закрываем шторку меню
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans text-gray-900 relative">
      
      {/* ШАПКА ДЛЯ МОБИЛЬНЫХ ТЕЛЕФОНОВ (Появляется только на экранах меньше md) */}
      <div className="md:hidden w-full bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          {/* КНОПКА БУРГЕР (ТРИ ПОЛОСКИ) */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className="text-2xl p-1 text-gray-800 focus:outline-none active:scale-90 transition-transform"
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>
          <span className="font-bold tracking-tight text-sm">RollTex Admin</span>
        </div>
        <span className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-500 font-mono">
          Tabs: {products.length + clients.length > 0 ? 'Connected' : 'Loading'}
        </span>
      </div>

      {/* ЗАДНИЙ ТЕМНЫЙ ФОН (Оверлей) — закрывает меню при клике на пустоту на мобилке */}
      {isMenuOpen && (
        <div 
          onClick={() => setIsMenuOpen(false)} 
          className="fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity"
        />
      )}

      {/* БОКОВАЯ ПАНЕЛЬ / ВЫЕЗЖАЮЩАЯ ШТОРКА МЕНЮ */}
      <div className={`
        fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 p-6 flex flex-col justify-between shrink-0 z-50
        transition-transform duration-300 ease-in-out
        md:relative md:transform-none
        ${isMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
      `}>
        <div>
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-gray-900">RollTex Admin</h2>
              <p className="text-xs text-gray-400">Настоящая база данных</p>
            </div>
            {/* Кнопка закрыть внутри меню (только на мобилках) */}
            <button onClick={() => setIsMenuOpen(false)} className="md:hidden text-gray-400 text-lg p-1 hover:text-black">✕</button>
          </div>

          <nav className="space-y-1">
            <button 
              onClick={() => handleTabChange('add-product')} 
              className={`w-full text-left flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-wider font-semibold rounded-lg transition-colors ${
                activeTab === 'add-product' ? 'bg-gray-950 text-white' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              Добавить товары
            </button>

            <button 
              onClick={() => handleTabChange('manage-products')} 
              className={`w-full text-left flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-wider font-semibold rounded-lg transition-colors ${
                activeTab === 'manage-products' ? 'bg-gray-950 text-white' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              Управление товарами ({products.length})
            </button>

            <button 
              onClick={() => handleTabChange('clients')} 
              className={`w-full text-left flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-wider font-semibold rounded-lg transition-colors ${
                activeTab === 'clients' ? 'bg-gray-950 text-white' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              Клиенты ({clients.length})
            </button>
          </nav>
        </div>
        <div className="text-[10px] text-gray-400 border-t border-gray-100 pt-4">Система RollTex v1.5</div>
      </div>

      {/* ОСНОВНОЙ КОНТЕНТ (ПРАВАЯ ЧАСТЬ) */}
      <div className="flex-1 p-4 md:p-10 overflow-y-auto">
        
        {/* ВКЛАДКА 1: ДОБАВЛЕНИЕ */}
        {activeTab === 'add-product' && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-xl md:text-2xl font-light text-gray-900">Новый товар</h1>
              <p className="text-xs text-gray-400 mt-1">Отправка данных в Supabase</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              <form onSubmit={handleAddProduct} className="lg:col-span-2 bg-white border border-gray-200 p-4 md:p-6 rounded-xl shadow-xs space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">НАЗВАНИЕ РУЛОНА</label>
                  <input type="text" placeholder="Шелк Армани Премиум" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-gray-200 px-4 py-2 text-sm rounded outline-none focus:border-black" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">КАТЕГОРИЯ</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-gray-200 px-4 py-2 text-sm rounded bg-white outline-none">
                      <option>Хлопок</option><option>Шелк</option><option>Лен</option><option>Трикотаж</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">СПЕЦИФИКА / ТЕГ</label>
                    <input type="text" placeholder="Италия" value={tag} onChange={(e) => setTag(e.target.value)} className="w-full border border-gray-200 px-4 py-2 text-sm rounded outline-none" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">ЦЕНА ЗА МЕТР (СОМ)</label>
                  <input type="number" placeholder="1200" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full border border-gray-200 px-4 py-2 text-sm rounded outline-none" required />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">ССЫЛКА НА ФОТО (URL)</label>
                  <input type="url" placeholder="https://images.unsplash.com/...jpg" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full border border-gray-200 px-4 py-2 text-sm rounded outline-none text-blue-600 font-mono text-xs" required />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">ОПИСАНИЕ</label>
                  <textarea rows={3} placeholder="Описание ткани..." value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-gray-200 px-4 py-2 text-sm rounded outline-none resize-none" required></textarea>
                </div>

                <button type="submit" disabled={loading} className="w-full bg-gray-950 text-white text-xs py-3 font-semibold rounded uppercase tracking-wider hover:bg-gray-800 disabled:bg-gray-400">
                  {loading ? 'Сохранение...' : 'Выгрузить на сайт'}
                </button>
              </form>

              <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-xs h-fit space-y-4">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Превью фото</h3>
                <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border border-gray-100">
                  {imageUrl ? (
                    <img src={imageUrl} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.src='https://placehold.co/600x400?text=Ошибка+ссылки'; }} />
                  ) : (
                    <span className="text-xs text-gray-400 text-center p-4">Вставьте ссылку для превью</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ВКЛАДКА 2: УПРАВЛЕНИЕ */}
        {activeTab === 'manage-products' && (
          <div className="max-w-5xl mx-auto">
            <div className="mb-4">
              <h1 className="text-xl md:text-2xl font-light text-gray-900">Каталог в Supabase</h1>
              <p className="text-xs text-gray-400 mt-0.5">Товары на живом сайте</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[550px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="p-4 w-20">Фото</th>
                    <th className="p-4">Название</th>
                    <th className="p-4">Категория</th>
                    <th className="p-4">Цена</th>
                    <th className="p-4 text-right">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs md:text-sm">
                  {products.length === 0 ? (
                    <tr><td colSpan="5" className="p-8 text-center text-gray-400 text-xs">Товаров нет.</td></tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50/50">
                        <td className="p-4"><img src={product.image_url} alt="" className="w-10 h-10 rounded object-cover border" /></td>
                        <td className="p-4 font-medium">
                          <div className="line-clamp-1">{product.title}</div>
                          {product.tag && <span className="inline-block mt-0.5 bg-gray-100 text-gray-600 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">{product.tag}</span>}
                        </td>
                        <td className="p-4 text-gray-500">{product.category}</td>
                        <td className="p-4 font-mono font-medium text-gray-900">{product.price} сом</td>
                        <td className="p-4 text-right">
                          <button onClick={() => handleDeleteProduct(product.id)} className="text-[11px] bg-red-50 hover:bg-red-100 text-red-600 font-medium px-2.5 py-1.5 rounded">Удалить</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ВКЛАДКА 3: КЛИЕНТЫ */}
        {activeTab === 'clients' && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-4">
              <h1 className="text-xl md:text-2xl font-light text-gray-900">Настоящие пользователи</h1>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[450px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="p-4">Email</th>
                    <th className="p-4">UID</th>
                    <th className="p-4 text-right">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs md:text-sm">
                  {clients.length === 0 ? (
                    <tr><td colSpan="3" className="p-8 text-center text-gray-400 text-xs">Клиентов нет.</td></tr>
                  ) : (
                    clients.map((client) => (
                      <tr key={client.id} className="hover:bg-gray-50/50">
                        <td className="p-4 font-medium text-gray-900">{client.email}</td>
                        <td className="p-4 font-mono text-xs text-gray-400">{client.id}</td>
                        <td className="p-4 text-right">
                          <button onClick={() => handleDeleteClient(client.id)} className="text-[11px] text-red-600 hover:bg-red-600 hover:text-white border border-red-200 px-3 py-1.5 rounded transition-all">Удалить</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}