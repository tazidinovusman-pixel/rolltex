import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/supabaseClient';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('add-product');
  const [loading, setLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // --- СОСТОЯНИЯ ДЛЯ ФОРМЫ ТОВАРА ---
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Хлопок');
  const [subCategory, setSubCategory] = useState('');
  const [tag, setTag] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState(''); // Главное фото
  const [extraUrl1, setExtraUrl1] = useState(''); // Доп фото 1
  const [extraUrl2, setExtraUrl2] = useState(''); // Доп фото 2
  const [extraUrl3, setExtraUrl3] = useState(''); // Доп фото 3
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

  // ДОБАВЛЕНИЕ ТОВАРА В SUPABASE
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Собираем все заполненные дополнительные ссылки в один массив
    const extraImages = [extraUrl1, extraUrl2, extraUrl3].filter(url => url.trim() !== '');

    const { error } = await supabase
      .from('products')
      .insert([
        { 
          title, 
          category, 
          sub_category: subCategory, 
          tag, 
          price: Number(price), 
          image_url: imageUrl, // Главная картинка для сетки
          images: extraImages, // Массив дополнительных картинок для внутренней страницы
          description 
        }
      ]);

    setLoading(false);

    if (error) {
      alert('Ошибка при сохранении: ' + error.message);
    } else {
      alert('Товар с галереей успешно сохранен в Supabase!');
      setTitle(''); setCategory('Хлопок'); setSubCategory(''); setTag(''); setPrice(''); setImageUrl('');
      setExtraUrl1(''); setExtraUrl2(''); setExtraUrl3(''); setDescription('');
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

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans text-gray-900 relative">
      
      {/* ШАПКА ДЛЯ МОБИЛЬНЫХ ТЕЛЕФОНОВ */}
      <div className="md:hidden w-full bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-2xl p-1 text-gray-800 focus:outline-none">
            {isMenuOpen ? '✕' : '☰'}
          </button>
          <span className="font-bold tracking-tight text-sm">RollTex Admin</span>
        </div>
      </div>

      {/* ОВЕРЛЕЙ */}
      {isMenuOpen && <div onClick={() => setIsMenuOpen(false)} className="fixed inset-0 bg-black/40 z-40 md:hidden" />}

      {/* БОКОВАЯ ПАНЕЛЬ */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 p-6 flex flex-col justify-between shrink-0 z-50 transition-transform duration-300 ease-in-out md:relative md:transform-none ${isMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}`}>
        <div>
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-gray-900">RollTex Admin</h2>
              <p className="text-xs text-gray-400">Настоящая база данных</p>
            </div>
            <button onClick={() => setIsMenuOpen(false)} className="md:hidden text-gray-400 text-lg p-1">✕</button>
          </div>

          <nav className="space-y-1">
            <button onClick={() => handleTabChange('add-product')} className={`w-full text-left flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-wider font-semibold rounded-lg transition-colors ${activeTab === 'add-product' ? 'bg-gray-950 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
              Добавить товары
            </button>
            <button onClick={() => handleTabChange('manage-products')} className={`w-full text-left flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-wider font-semibold rounded-lg transition-colors ${activeTab === 'manage-products' ? 'bg-gray-950 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
              Управление товарами ({products.length})
            </button>
            <button onClick={() => handleTabChange('clients')} className={`w-full text-left flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-wider font-semibold rounded-lg transition-colors ${activeTab === 'clients' ? 'bg-gray-950 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
              Клиенты ({clients.length})
            </button>
          </nav>
        </div>
        <div className="text-[10px] text-gray-400 border-t border-gray-100 pt-4">Система RollTex v1.7</div>
      </div>

      {/* ОСНОВНОЙ КОНТЕНТ */}
      <div className="flex-1 p-4 md:p-10 overflow-y-auto">
        
        {/* ВКЛАДКА 1: ДОБАВЛЕНИЕ */}
        {activeTab === 'add-product' && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-xl md:text-2xl font-light text-gray-900">Новый товар с галереей вариантов</h1>
              <p className="text-xs text-gray-400 mt-1">Отправка расширенных данных в Supabase</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              <form onSubmit={handleAddProduct} className="lg:col-span-2 bg-white border border-gray-200 p-4 md:p-6 rounded-xl shadow-xs space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">НАЗВАНИЕ РУЛОНА</label>
                  <input type="text" placeholder="Шелк Армани Премиум" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-gray-200 px-4 py-2 text-sm rounded outline-none focus:border-black" required />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">КАТЕГОРИЯ</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-gray-200 px-4 py-2 text-sm rounded bg-white outline-none">
                      <option>Хлопок</option><option>Шелк</option><option>Лен</option><option>Трикотаж</option><option>Шерсть</option><option>Бархат</option><option>Атлас</option><option>Вискоза</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">ПОДКАТЕГОРИЯ</label>
                    <input type="text" placeholder="Однотонные" value={subCategory} onChange={(e) => setSubCategory(e.target.value)} className="w-full border border-gray-200 px-4 py-2 text-sm rounded outline-none" />
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

                {/* БЛОК ССЫЛОК НА ФОТО */}
                <div className="space-y-2 border-t border-b border-gray-100 py-3">
                  <div>
                    <label className="text-[10px] font-bold text-blue-600 block mb-1">ГЛАВНОЕ ФОТО (ВИДНО НА ГЛАВНОЙ)</label>
                    <input type="url" placeholder="https://images.unsplash.com/main.jpg" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full border border-blue-200 px-4 py-2 text-sm rounded outline-none font-mono text-xs text-blue-600" required />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">ДОПОЛНИТЕЛЬНОЕ ФОТО 1 (ВАРИАНТ КРУПНО)</label>
                    <input type="url" placeholder="https://images.unsplash.com/extra1.jpg" value={extraUrl1} onChange={(e) => setExtraUrl1(e.target.value)} className="w-full border border-gray-200 px-4 py-2 text-sm rounded outline-none font-mono text-xs text-gray-600" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">ДОПОЛНИТЕЛЬНОЕ ФОТО 2 (ВАРИАНТ КРУПНО)</label>
                    <input type="url" placeholder="https://images.unsplash.com/extra2.jpg" value={extraUrl2} onChange={(e) => setExtraUrl2(e.target.value)} className="w-full border border-gray-200 px-4 py-2 text-sm rounded outline-none font-mono text-xs text-gray-600" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1">ДОПОЛНИТЕЛЬНОЕ ФОТО 3 (ВАРИАНТ КРУПНО)</label>
                    <input type="url" placeholder="https://images.unsplash.com/extra3.jpg" value={extraUrl3} onChange={(e) => setExtraUrl3(e.target.value)} className="w-full border border-gray-200 px-4 py-2 text-sm rounded outline-none font-mono text-xs text-gray-600" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">ОПИСАНИЕ</label>
                  <textarea rows={3} placeholder="Описание ткани..." value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-gray-200 px-4 py-2 text-sm rounded outline-none resize-none" required></textarea>
                </div>

                <button type="submit" disabled={loading} className="w-full bg-gray-950 text-white text-xs py-3 font-semibold rounded uppercase tracking-wider hover:bg-gray-800 disabled:bg-gray-400">
                  {loading ? 'Сохранение...' : 'Выгрузить на сайт'}
                </button>
              </form>

              {/* ПРЕВЬЮ ВСЕХ КАРТИНОК */}
              <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-xs h-fit space-y-4">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Превью галереи</h3>
                
                <div className="space-y-2">
                  <span className="text-[9px] font-bold text-gray-400 block">ГЛАВНОЕ:</span>
                  <div className="w-full h-36 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 flex items-center justify-center">
                    {imageUrl ? <img src={imageUrl} alt="" className="w-full h-full object-cover" /> : <span className="text-[10px] text-gray-300">Нет ссылки</span>}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100">
                  <div className="aspect-square bg-gray-50 rounded border flex items-center justify-center overflow-hidden">
                    {extraUrl1 ? <img src={extraUrl1} alt="" className="w-full h-full object-cover" /> : <span className="text-[9px] text-gray-300">Доп 1</span>}
                  </div>
                  <div className="aspect-square bg-gray-50 rounded border flex items-center justify-center overflow-hidden">
                    {extraUrl2 ? <img src={extraUrl2} alt="" className="w-full h-full object-cover" /> : <span className="text-[9px] text-gray-300">Доп 2</span>}
                  </div>
                  <div className="aspect-square bg-gray-50 rounded border flex items-center justify-center overflow-hidden">
                    {extraUrl3 ? <img src={extraUrl3} alt="" className="w-full h-full object-cover" /> : <span className="text-[9px] text-gray-300">Доп 3</span>}
                  </div>
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

            <div className="block md:hidden space-y-3">
              {products.length === 0 ? (
                <div className="bg-white border border-gray-200 p-6 text-center text-gray-400 text-xs rounded-xl">Товаров нет.</div>
              ) : (
                products.map((product) => (
                  <div key={product.id} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-3 shadow-xs">
                    <div className="flex gap-3 items-center">
                      <img src={product.image_url} alt="" className="w-14 h-14 rounded-lg object-cover border shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm text-gray-900 break-words">{product.title}</h3>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <span className="bg-gray-100 text-gray-600 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">{product.category}</span>
                          {product.sub_category && <span className="bg-purple-50 text-purple-600 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">{product.sub_category}</span>}
                          {product.tag && <span className="bg-blue-50 text-blue-600 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">{product.tag}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-50 pt-2.5 mt-1">
                      <span className="font-mono font-bold text-sm text-gray-900">{product.price} сом</span>
                      <button onClick={() => handleDeleteProduct(product.id)} className="text-xs bg-red-50 hover:bg-red-100 text-red-600 font-medium px-4 py-2 rounded-lg">Удалить товар</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="hidden md:block bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="p-4 w-20">Фото</th>
                    <th className="p-4">Название</th>
                    <th className="p-4">Категория</th>
                    <th className="p-4">Цена</th>
                    <th className="p-4 text-right">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {products.length === 0 ? (
                    <tr><td colSpan="5" className="p-8 text-center text-gray-400 text-xs">Товаров нет.</td></tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50/50">
                        <td className="p-4"><img src={product.image_url} alt="" className="w-10 h-10 rounded object-cover border" /></td>
                        <td className="p-4 font-medium">
                          <div className="line-clamp-1">{product.title}</div>
                          <div className="flex gap-1 mt-0.5">
                            {product.sub_category && <span className="text-[9px] text-purple-600 font-bold bg-purple-50 px-1 rounded uppercase">{product.sub_category}</span>}
                            {product.tag && <span className="text-[9px] text-gray-600 font-bold bg-gray-100 px-1 rounded uppercase">{product.tag}</span>}
                            {product.images && product.images.length > 0 && <span className="text-[9px] text-green-600 font-bold bg-green-50 px-1 rounded uppercase">Галерея: +{product.images.length}</span>}
                          </div>
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