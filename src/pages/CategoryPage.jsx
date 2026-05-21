import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase/supabaseClient'; 

export default function CategoryPage({ categoryName, onBack, singleProduct, user }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(singleProduct || null);

  useEffect(() => {
    setSelectedProduct(singleProduct || null);
    if (!singleProduct && categoryName) {
      fetchCategoryProducts();
    } else {
      setLoading(false);
    }
  }, [categoryName, singleProduct]);

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

  const handleCreateOrder = async (product) => {
    if (!user) {
      alert('Пожалуйста, авторизуйтесь для оформления заявки!');
      return;
    }
    alert(`Заявка на ткань "${product.title}" успешно создана!`);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-950">
      {!selectedProduct ? (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <button onClick={onBack} className="text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-black mb-6 transition-colors">
            ← На главную
          </button>
          <h1 className="text-2xl md:text-4xl font-light text-gray-900 mb-8 uppercase tracking-wide">
            Категория: {categoryName}
          </h1>

          {loading ? (
            <div className="text-center py-20 text-xs text-gray-400">Загрузка...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-xs text-gray-400">Нет рулонов.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-2 md:gap-x-6 gap-y-6 md:gap-y-10">
              {products.map((product) => (
                <div key={product.id} onClick={() => setSelectedProduct(product)} className="group relative flex flex-col bg-white border border-gray-100 rounded-xl p-1.5 md:p-2 hover:shadow-sm transition-shadow cursor-pointer">
                  <div className="w-full aspect-[4/5] bg-gray-50 rounded-lg overflow-hidden relative mb-2 md:mb-4">
                    <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between px-1">
                    <div>
                      <span className="text-[9px] md:text-[11px] uppercase tracking-widest text-gray-400 font-medium">{product.category}</span>
                      <h3 className="text-xs md:text-sm font-medium text-gray-900 line-clamp-1 mt-0.5">{product.title}</h3>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-50 mt-2">
                      <span className="text-xs md:text-sm font-semibold text-gray-900">{product.price} сом</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-4 py-12">
          <button onClick={onBack} className="text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-black mb-6 transition-colors">
            ← Назад
          </button>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white border border-gray-100 p-4 md:p-8 rounded-3xl shadow-xs">
            <div className="w-full aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
              <img src={selectedProduct.image_url} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col justify-between py-2">
              <div>
                <span className="bg-gray-950 text-white text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider">{selectedProduct.category}</span>
                <h1 className="text-xl md:text-3xl font-normal text-gray-900 mt-4 mb-2">{selectedProduct.title}</h1>
                <div className="font-mono text-xl md:text-2xl font-bold text-gray-900 mb-6">{selectedProduct.price} сом</div>
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{selectedProduct.description || 'Описание скоро появится.'}</p>
                </div>
              </div>
              <button onClick={() => handleCreateOrder(selectedProduct)} className="w-full bg-gray-950 text-white text-xs py-4 rounded-xl font-semibold uppercase tracking-wider hover:bg-gray-800 transition-colors mt-8">
                Заказать рулон ткани
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}   