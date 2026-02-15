'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sun, Moon } from 'lucide-react';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const storedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const shouldBeDark = storedTheme === 'dark' || (!storedTheme && prefersDark) || (!storedTheme && true);

        setIsDarkMode(shouldBeDark);
        if (shouldBeDark) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    }, []);

    const toggleTheme = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        localStorage.setItem('theme', newMode ? 'dark' : 'light');
        if (newMode) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        try {
            const res = await fetch('http://127.0.0.1:8000/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData,
            });

            if (!res.ok) {
                throw new Error('نام کاربری یا رمز عبور اشتباه است');
            }

            const data = await res.json();
            localStorage.setItem('token', data.access_token);
            router.push('/admin');
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1920&auto=format&fit=crop')] bg-cover bg-center relative transition-colors duration-500" dir="rtl">
            {/* Overlay */}
            <div className={`absolute inset-0 transition-colors duration-500 ${isDarkMode ? 'bg-black/80' : 'bg-white/30 backdrop-blur-[2px]'}`} />

            {/* Theme Toggle */}
            <button
                onClick={toggleTheme}
                className="absolute top-6 left-6 z-50 p-3 rounded-full bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 text-slate-800 dark:text-white hover:bg-white/20 transition shadow-lg"
            >
                {isDarkMode ? <Sun size={24} /> : <Moon size={24} className="text-slate-800" />}
            </button>

            <div className={`
                relative w-full max-w-md p-8 rounded-3xl shadow-2xl backdrop-blur-xl border transition-all duration-300
                ${isDarkMode
                    ? 'bg-white/10 border-white/20'
                    : 'bg-white/70 border-white/40 shadow-slate-200/50'}
            `}>
                <div className="mb-8 text-center">
                    <h1 className={`text-3xl font-black mb-2 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>پنل مدیریت پاییز</h1>
                    <p className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>لطفاً برای ورود مشخصات خود را وارد کنید</p>
                </div>

                {error && <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm mb-6 text-center">{error}</div>}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className={`block text-sm font-bold mb-2 mr-1 transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>نام کاربری</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className={`
                                w-full px-5 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all font-sans
                                ${isDarkMode
                                    ? 'bg-white/5 border border-white/10 text-white placeholder-slate-500'
                                    : 'bg-white border border-slate-200 text-slate-800 placeholder-slate-400'}
                            `}
                            placeholder="نام کاربری خود را وارد کنید"
                            required
                        />
                    </div>
                    <div>
                        <label className={`block text-sm font-bold mb-2 mr-1 transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>رمز عبور</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`
                                w-full px-5 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all font-sans
                                ${isDarkMode
                                    ? 'bg-white/5 border border-white/10 text-white placeholder-slate-500'
                                    : 'bg-white border border-slate-200 text-slate-800 placeholder-slate-400'}
                            `}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all duration-200 mt-2"
                    >
                        ورود به پنل
                    </button>
                </form>
            </div>
        </div>
    );
}
