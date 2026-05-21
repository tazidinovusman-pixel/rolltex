import React, { useState } from 'react';
import { supabase } from '../supabase/supabaseClient';
import { Globe } from 'lucide-react';

export default function AuthPage({ onAuthSuccess }) {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (isSignUp) {
            // --- РЕГИСТРАЦИЯ НОВОГО ЧЕЛОВЕКА ---
            // Сначала регистрируем в системе Supabase Auth
            const { data, error: signUpError } = await supabase.auth.signUp({ 
                email, 
                password 
            });

            if (signUpError) {
                alert("Ошибка регистрации: " + signUpError.message);
                setLoading(false);
                return;
            }

            if (data?.user) {
                // Прямо отсюда вручную создаем ему запись в таблице profiles,
                // чтобы база его точно знала и пустила!
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert([
                        { 
                            id: data.user.id, 
                            email: data.user.email, 
                            full_name: 'Новый клиент', 
                            role: 'user' // Обычный клиент
                        }
                    ]);

                if (profileError) {
                    console.log("Профиль уже есть или создался через триггер");
                }

                // Впускаем пользователя на сайт!
                onAuthSuccess(data.user);
            }
        } else {
            // --- ОБЫЧНЫЙ ВХОД СУЩЕСТВУЮЩЕГО ПОЛЬЗОВАТЕЛЯ ---
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                // Если юзер вводит данные на Вход, а его нет в базе — выйдет Invalid login credentials
                alert("Ошибка входа: " + error.message + ". Если вы у нас впервые, нажмите кнопку 'Создать аккаунт' внизу!");
            } else if (data?.user) {
                onAuthSuccess(data.user);
            }
        }
        setLoading(false);
    };

    // Вход через GOOGLE
    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin + '/profile' },
        });
        if (error) alert(error.message);
    };

    // Вход через FACEBOOK
    const handleFacebookLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'facebook',
            options: { redirectTo: window.location.origin + '/profile' },
        });
        if (error) alert(error.message);
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-white px-4">
            <div className="max-w-md w-full border border-gray-100 p-8 rounded-lg shadow-sm">
                <h2 className="text-2xl font-light text-center text-gray-900 mb-8">
                    {isSignUp ? 'Создать аккаунт RollTex' : 'Войти в личный кабинет'}
                </h2>

                <form onSubmit={handleAuth} className="space-y-4">
                    <div>
                        <label className="text-xs font-medium text-gray-400 block mb-1">Email</label>
                        <input
                            type="email"
                            className="w-full border border-gray-200 px-4 py-2.5 rounded focus:outline-none focus:border-black text-sm"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-400 block mb-1">Пароль</label>
                        <input
                            type="password"
                            className="w-full border border-gray-200 px-4 py-2.5 rounded focus:outline-none focus:border-black text-sm"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-gray-950 text-white text-sm py-3 font-medium hover:bg-gray-800 transition-colors mt-2"
                        disabled={loading}
                    >
                        {loading ? 'Загрузка...' : isSignUp ? 'Зарегистрироваться' : 'Войти'}
                    </button>
                </form>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-100"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-400">Или войти через</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={handleGoogleLogin}
                        type="button"
                        className="flex items-center justify-center gap-2 border border-gray-200 py-2.5 rounded hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                    >
                        <Globe className="w-4 h-4 text-red-500" />
                        Google
                    </button>

                    <button
                        onClick={handleFacebookLogin}
                        type="button"
                        className="flex items-center justify-center gap-2 border border-gray-200 py-2.5 rounded hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                    >
                        <span className="text-blue-600 font-bold text-base leading-none">f</span>
                        Facebook
                    </button>
                </div>

                <p className="text-center text-xs text-gray-500 mt-6">
                    {isSignUp ? 'Уверен, что есть аккаунт?' : 'Впервые у нас?'} {' '}
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-black font-medium underline"
                        type="button"
                    >
                        {isSignUp ? 'Войти в кабинет' : 'Создать аккаунт (Регистрация)'}
                    </button>
                </p>
            </div>
        </div>
    );
}