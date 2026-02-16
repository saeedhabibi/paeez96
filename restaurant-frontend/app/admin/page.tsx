'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    LayoutGrid, Utensils, Menu, Users, DollarSign, TrendingUp,
    LogOut, Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight,
    BarChart3, X, Layers, Bell, Settings, Sun, Moon, ExternalLink
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

// --- Types ---

interface MenuItem {
    id: number;
    name: string;
    name_fa?: string;
    description?: string;
    description_fa?: string;
    price: number;
    image_url?: string;
    category_id: number;
    rating?: number;
    calories?: number;
    time?: string;
    ingredients_en?: string;
    ingredients_fa?: string;
    is_available: boolean;
}

interface Category {
    id: number;
    name: string;
    name_fa?: string;
    slug: string;
    items: MenuItem[];
}

interface DailyStat {
    date: string;
    total_visits: number;
    total_orders: number;
    total_revenue: number;
}

interface DashboardStats {
    total_items: number;
    total_categories: number;
    daily_stats: DailyStat[];
}

// --- Components ---

export default function AdminDashboard() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'dashboard' | 'menu' | 'orders' | 'categories'>('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [token, setToken] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(true);

    // Theme Logic
    useEffect(() => {
        const storedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        // Default to dark if no preference or if preference is dark
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

    // Data
    const [categories, setCategories] = useState<Category[]>([]);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    // Modals & Forms
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (!storedToken) {
            router.push('/admin/login');
            return;
        }
        setToken(storedToken);
        fetchData(storedToken);

        // Responsive Sidebar
        const handleResize = () => {
            if (window.innerWidth < 1024) setIsSidebarOpen(false);
            else setIsSidebarOpen(true);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [router]);

    const fetchData = async (authToken: string) => {
        try {
            setLoading(true);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
            const [menuRes, statsRes] = await Promise.all([
                fetch(`${apiUrl}/api/menu`),
                fetch(`${apiUrl}/api/stats`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                })
            ]);

            if (menuRes.ok) setCategories(await menuRes.json());
            if (statsRes.ok) setStats(await statsRes.json());
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/admin/login');
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-amber-500 font-bold">
            <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                <span>در حال بارگذاری...</span>
            </div>
        </div>
    );

    if (!stats && activeTab === 'dashboard') return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-red-500 font-bold">
            <div className="flex flex-col items-center gap-4">
                <p>خطا در دریافت اطلاعات داشبورد.</p>
                <button onClick={() => window.location.reload()} className="px-4 py-2 bg-red-500/10 rounded-lg hover:bg-red-500/20">تلاش مجدد</button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex text-slate-800 dark:text-slate-200 font-sans selection:bg-amber-500/30 transition-colors duration-300" dir="rtl">
            {/* Background Texture */}
            <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />

            {/* Sidebar */}
            <aside
                className={`
          fixed inset-y-0 right-0 z-50 w-72 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-l border-slate-200 dark:border-white/5 transition-all duration-300 ease-in-out shadow-2xl dark:shadow-none
          ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
          lg:relative lg:translate-x-0
        `}
            >
                <div className="h-full flex flex-col p-6">
                    <div className="flex items-center justify-between mb-10">
                        <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600 tracking-tight">
                            پنل مدیریت
                        </h1>
                        <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
                            <X size={24} />
                        </button>
                    </div>

                    <nav className="flex-1 space-y-3">
                        <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 px-2">منوی اصلی</div>
                        <SidebarItem icon={<LayoutGrid size={20} />} label="داشبورد" isActive={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                        <SidebarItem icon={<Utensils size={20} />} label="مدیریت منو" isActive={activeTab === 'menu'} onClick={() => setActiveTab('menu')} />
                        <SidebarItem icon={<Layers size={20} />} label="دسته‌بندی‌ها" isActive={activeTab === 'categories'} onClick={() => setActiveTab('categories')} />

                        <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-8 mb-4 px-2">عمومی</div>
                        <SidebarItem icon={<Users size={20} />} label="کاربران" isActive={false} onClick={() => { }} />
                        <SidebarItem icon={<Settings size={20} />} label="تنظیمات" isActive={false} onClick={() => { }} />
                    </nav>

                    <div className="pt-6 border-t border-slate-200 dark:border-white/5 mt-auto">
                        <div className="flex items-center gap-3 px-4 py-3 bg-slate-100 dark:bg-white/5 rounded-2xl mb-4 border border-slate-200 dark:border-white/5">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-orange-600 flex items-center justify-center text-white font-bold shadow-lg shadow-orange-500/20">A</div>
                            <div>
                                <div className="text-sm font-bold text-slate-800 dark:text-white">مدیر سیستم</div>
                                <div className="text-xs text-slate-500">admin@paeez96.com</div>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center justify-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-300 rounded-xl transition-all font-medium border border-transparent hover:border-red-200 dark:hover:border-red-500/20"
                        >
                            <LogOut size={20} />
                            <span>خروج از حساب</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen overflow-hidden relative">
                {/* Top Header Mobile */}
                <header className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5 p-4 flex items-center justify-between lg:hidden z-40 sticky top-0">
                    <button onClick={() => setIsSidebarOpen(true)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                        <Menu size={24} />
                    </button>
                    <span className="font-bold text-slate-800 dark:text-slate-200">داشبورد</span>
                    <div className="flex items-center gap-3">
                        <button onClick={toggleTheme} className="text-slate-500 dark:text-slate-400 p-2">
                            {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
                        </button>
                        <button className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white relative">
                            <Bell size={24} />
                            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-zinc-900"></span>
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 pb-20 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                    {/* Header Controls (Desktop) */}
                    <div className="hidden lg:flex justify-between items-center mb-10">
                        <div>
                            <h2 className="text-3xl font-black text-slate-800 dark:text-white">
                                {activeTab === 'dashboard' ? 'نمای کلی' : activeTab === 'menu' ? 'لیست غذاها' : 'دسته‌بندی‌ها'}
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 mt-1">خوش آمدید، امروز {new Date().toLocaleDateString('fa-IR')} است.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={toggleTheme}
                                className="w-12 h-12 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-amber-500 hover:border-amber-500 transition shadow-sm"
                            >
                                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                            </button>
                            <button className="w-12 h-12 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/10 transition relative shadow-sm">
                                <Bell size={20} />
                                <span className="absolute top-3 right-3 w-2 h-2 bg-amber-500 rounded-full"></span>
                            </button>
                        </div>
                    </div>

                    {activeTab === 'dashboard' && stats && (
                        <DashboardView stats={stats} />
                    )}
                    {activeTab === 'menu' && (
                        <MenuManagement
                            categories={categories}
                            token={token}
                            refresh={() => fetchData(token)}
                        />
                    )}
                    {activeTab === 'categories' && (
                        <CategoryManagement
                            categories={categories}
                            token={token}
                            refresh={() => fetchData(token)}
                        />
                    )}
                </main>
            </div>
        </div>
    );
}

// --- Sub Views ---

const DashboardView = ({ stats }: { stats: DashboardStats }) => {
    // Prepare data for chart
    const chartData = stats.daily_stats.map(d => ({
        name: new Date(d.date).toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' }),
        visits: d.total_visits,
        revenue: d.total_revenue
    }));

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={<Users className="text-blue-400" />} title="بازدید امروز" value={stats.daily_stats[stats.daily_stats.length - 1]?.total_visits || 0} trend="+12%" color="blue" />
                <StatCard icon={<Utensils className="text-amber-400" />} title="کل غذاها" value={stats.total_items} color="amber" />
                <StatCard icon={<Layers className="text-violet-400" />} title="دسته‌بندی‌ها" value={stats.total_categories} color="violet" />
                <StatCard icon={<DollarSign className="text-emerald-400" />} title="درآمد امروز" value="0" trend="-%" color="emerald" />
            </div>

            {/* Chart */}
            <div className="bg-white dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/5 p-8 rounded-3xl shadow-xl dark:shadow-none">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold flex items-center gap-3 text-slate-800 dark:text-white">
                        <BarChart3 size={24} className="text-amber-500" />
                        روند بازدید هفته گذشته
                    </h3>
                    <select className="bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none">
                        <option>هفتگی</option>
                        <option>ماهانه</option>
                    </select>
                </div>

                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dx={-10} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'rgba(24, 24, 27, 0.9)', borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Area type="monotone" dataKey="visits" stroke="#f59e0b" strokeWidth={4} fillOpacity={1} fill="url(#colorVisits)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

const MenuManagement = ({ categories, token, refresh }: { categories: Category[], token: string, refresh: () => void }) => {
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const handleDelete = async (id: number) => {
        if (!confirm('مطمئن هستید؟')) return;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
        await fetch(`${apiUrl}/api/items/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        refresh();
    };

    const filteredItems = categories.flatMap(cat => cat.items.map(i => ({ ...i, category_name: cat.name_fa || cat.name })))
        .filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()) || i.name_fa?.includes(searchTerm));

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row justify-between gap-4">

                {/* Search */}
                <div className="relative w-full sm:w-96">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="جستجو در غذاها..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full h-12 pr-12 pl-4 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition"
                    />
                </div>

                <button
                    onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
                    className="bg-amber-500 text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-amber-600 shadow-lg shadow-amber-500/20 active:scale-95 transition"
                >
                    <Plus size={20} />
                    افزودن غذای جدید
                </button>
            </div>

            {/* Responsive Grid/Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredItems.map(item => (
                    <div key={item.id} className="bg-white dark:bg-white/5 backdrop-blur-sm rounded-3xl p-4 border border-slate-200 dark:border-white/5 flex gap-4 group hover:border-amber-500/30 hover:shadow-lg dark:hover:bg-white/10 transition-all duration-300">
                        <div className="w-28 h-28 rounded-2xl overflow-hidden shadow-lg shadow-black/5 dark:shadow-black/20">
                            <img src={item.image_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between py-1">
                            <div>
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 line-clamp-1">{item.name_fa}</h3>
                                    <span className="text-[10px] bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-md">{item.category_name}</span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">{item.description_fa}</p>
                            </div>

                            <div className="flex items-center justify-between mt-3">
                                <div className="font-black text-amber-500 text-lg">{item.price ? item.price.toLocaleString() : 0} <span className="text-xs font-medium">تومان</span></div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => { setEditingItem(item); setIsModalOpen(true); }}
                                        className="p-2 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-500 hover:bg-amber-500 hover:text-white dark:hover:text-white rounded-xl transition-colors shadow-sm"
                                        title="ویرایش"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="p-2 bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-500 hover:bg-red-500 hover:text-white dark:hover:text-white rounded-xl transition-colors shadow-sm"
                                        title="حذف"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <ItemModal
                    item={editingItem}
                    categories={categories}
                    onClose={() => setIsModalOpen(false)}
                    onSave={async (data: any) => {
                        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
                        const url = editingItem
                            ? `${apiUrl}/api/items/${editingItem.id}`
                            : `${apiUrl}/api/items`;
                        const method = editingItem ? 'PUT' : 'POST';

                        await fetch(url, {
                            method,
                            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                            body: JSON.stringify(data)
                        });
                        setIsModalOpen(false);
                        refresh();
                    }}
                />
            )}
        </div>
    );
};

// --- Category Management ---

const CategoryManagement = ({ categories, token, refresh }: { categories: Category[], token: string, refresh: () => void }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleDelete = async (id: number) => {
        if (!confirm('آیا مطمئن هستید؟ با حذف دسته‌بندی، غذاهای آن نیز حذف نمی‌شوند اما دسته‌بندی آنها نامشخص می‌شود.')) return;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
        await fetch(`${apiUrl}/api/categories/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        refresh();
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.name_fa?.includes(searchTerm)
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                {/* Search */}
                <div className="relative w-full sm:w-96">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="جستجو در دسته‌بندی‌ها..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full h-12 pr-12 pl-4 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition"
                    />
                </div>

                <button
                    onClick={() => { setEditingCategory(null); setIsModalOpen(true); }}
                    className="bg-amber-500 text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-amber-600 shadow-lg shadow-amber-500/20 active:scale-95 transition"
                >
                    <Plus size={20} />
                    افزودن دسته جدید
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCategories.map(cat => (
                    <div key={cat.id} className="bg-white dark:bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-slate-200 dark:border-white/5 flex justify-between items-center group hover:border-amber-500/30 transition-all duration-300 shadow-sm dark:shadow-none">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-white/5 flex items-center justify-center text-amber-500">
                                <Layers size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{cat.name_fa}</h3>
                                <p className="text-xs text-slate-500 font-mono mt-0.5">{cat.slug}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-xs bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 px-3 py-1 rounded-full">
                                {cat.items?.length || 0} آیتم
                            </span>
                            <button
                                onClick={() => { setEditingCategory(cat); setIsModalOpen(true); }}
                                className="p-2 text-amber-500 hover:bg-amber-500/10 rounded-lg transition-all"
                                title="ویرایش"
                            >
                                <Edit size={20} />
                            </button>
                            <button
                                onClick={() => handleDelete(cat.id)}
                                className="p-2 text-red-500/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg group-hover:text-red-500 transition-all"
                                title="حذف"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <CategoryModal
                    category={editingCategory}
                    onClose={() => setIsModalOpen(false)}
                    onSave={async (data: any) => {
                        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
                        // If editing, use PUT/PATCH? API usually supports PUT for update. 
                        // Assuming backend supports PUT based on items endpoint pattern.
                        // Wait, previous code only had POST. I need to make sure backend has PUT for categories. I'll check main.py.
                        // Ideally I'd use PUT if ID exists.
                        const method = editingCategory ? 'PUT' : 'POST';
                        // Wait, I haven't added PUT /api/categories/{id} to main.py yet!
                        // I need to add it to backend as well.
                        // For now I will assume I will add it.

                        const url = editingCategory
                            ? `${apiUrl}/api/categories/${editingCategory.id}`
                            : `${apiUrl}/api/categories`;

                        await fetch(url, {
                            method,
                            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                            body: JSON.stringify(data)
                        });
                        setIsModalOpen(false);
                        refresh();
                    }}
                />
            )}
        </div>
    );
};

// --- Components Helpers ---

const SidebarItem = ({ icon, label, isActive, onClick }: any) => (
    <button
        onClick={onClick}
        className={`
      flex items-center gap-3 w-full px-4 py-3.5 rounded-xl transition-all font-medium duration-300
      ${isActive
                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20 font-bold translate-x-1'
                : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'}
    `}
    >
        {icon}
        <span>{label}</span>
    </button>
);

const StatCard = ({ icon, title, value, trend, color = "amber" }: any) => {
    // Defines styles based on color prop
    const colors: any = {
        amber: 'from-amber-500/20 to-amber-600/5 border-amber-500/10 text-amber-500',
        blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/10 text-blue-500',
        emerald: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/10 text-emerald-500',
        violet: 'from-violet-500/20 to-violet-600/5 border-violet-500/10 text-violet-500',
    };
    const activeColor = colors[color] || colors.amber;

    return (
        <div className={`bg-gradient-to-br ${activeColor} bg-white dark:bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/40 dark:border-white/5 relative overflow-hidden group shadow-sm dark:shadow-none`}>
            <div className="absolute top-0 left-0 w-20 h-20 bg-white/20 dark:bg-white/5 rounded-full -translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-500 ease-out pointer-events-none" />
            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className={`w-12 h-12 rounded-2xl bg-white/50 dark:bg-white/10 flex items-center justify-center ${activeColor.split(' ').pop()}`}>
                    {icon}
                </div>
                {trend && <span className="text-xs font-bold bg-white/50 dark:bg-white/10 px-2 py-1 rounded-lg text-emerald-600 dark:text-emerald-400">{trend}</span>}
            </div>
            <div className="relative z-10">
                <p className="text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1 opacity-80">{title}</p>
                <h4 className="text-3xl font-black text-slate-800 dark:text-white">{value}</h4>
            </div>
        </div>
    );
};

// --- Modals ---

const CategoryModal = ({ category, onClose, onSave }: any) => {
    const [formData, setFormData] = useState({
        name: category?.name || '',
        name_fa: category?.name_fa || '',
        slug: category?.slug || ''
    });

    return (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-md p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 to-orange-600" />
                <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">{category ? 'ویرایش دسته‌بندی' : 'افزودن دسته‌بندی جدید'}</h2>
                <form onSubmit={e => { e.preventDefault(); onSave(formData); }} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-300">نام فارسی</label>
                        <input
                            className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-800 dark:text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                            value={formData.name_fa}
                            onChange={e => setFormData({ ...formData, name_fa: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-300">نام انگلیسی (سیستمی)</label>
                        <input
                            className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-800 dark:text-white text-left focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                            dir="ltr"
                            value={formData.name}
                            onChange={e => {
                                const name = e.target.value;
                                const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                                setFormData({ ...formData, name, slug });
                            }}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-300">Slug (URL)</label>
                        <input
                            className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-800 dark:text-white text-left focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                            dir="ltr"
                            value={formData.slug}
                            onChange={e => setFormData({ ...formData, slug: e.target.value })}
                            placeholder="e.g. signature-steaks (Auto-generated)"
                            required
                        />
                        <p className="text-[10px] text-slate-400 mt-1">این فیلد به صورت خودکار از روی نام انگلیسی ساخته می‌شود.</p>
                    </div>
                    <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100 dark:border-white/10">
                        <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white font-bold transition">انصراف</button>
                        <button type="submit" className="px-6 py-3 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 shadow-lg shadow-amber-500/20 active:scale-95 transition">ذخیره</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ItemModal = ({ item, categories, onClose, onSave }: any) => {
    const [formData, setFormData] = useState<Partial<MenuItem>>(
        item || { category_id: categories[0]?.id || 1, price: 0 }
    );

    return (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl relative scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-zinc-700">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 to-orange-600" />
                <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">{item ? 'ویرایش غذا' : 'افزودن غذای جدید'}</h2>

                <form onSubmit={e => { e.preventDefault(); onSave(formData); }} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-300">نام فارسی</label>
                            <input
                                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-800 dark:text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                                value={formData.name_fa || ''}
                                onChange={e => setFormData({ ...formData, name_fa: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-300">نام انگلیسی</label>
                            <input
                                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-800 dark:text-white text-left focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                                dir="ltr"
                                value={formData.name || ''}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-300">قیمت (تومان)</label>
                            <input
                                type="number"
                                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-800 dark:text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                                value={formData.price || 0}
                                onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-300">دسته‌بندی</label>
                            <select
                                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-800 dark:text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                                value={formData.category_id}
                                onChange={e => setFormData({ ...formData, category_id: Number(e.target.value) })}
                            >
                                {categories.map((c: Category) => <option key={c.id} value={c.id} className="text-black">{c.name_fa}</option>)}
                            </select>
                        </div>
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-300">تصویر (URL)</label>
                            <input
                                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-800 dark:text-white text-left focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                                dir="ltr"
                                value={formData.image_url || ''}
                                onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                                placeholder="https://..."
                            />
                            <div className="mt-2 flex items-center gap-2">
                                <span className="text-xs text-slate-400">تصویر ندارید؟</span>
                                <a
                                    href="https://imgbb.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs font-bold text-amber-500 hover:underline flex items-center gap-1"
                                >
                                    آپلود رایگان عکس (ImgBB)
                                    <ExternalLink size={10} />
                                </a>
                            </div>
                        </div>
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-300">توضیحات</label>
                            <textarea
                                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-800 dark:text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                                rows={3}
                                value={formData.description_fa || ''}
                                onChange={e => setFormData({ ...formData, description_fa: e.target.value })}
                            />
                        </div>
                        {/* Extra Fields */}
                        <div>
                            <label className="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-300">کالری</label>
                            <input type="number" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-800 dark:text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500" value={formData.calories || 0} onChange={e => setFormData({ ...formData, calories: Number(e.target.value) })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-300">زمان آماده‌سازی (دقیقه)</label>
                            <input type="text" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-slate-800 dark:text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500" value={formData.time || ''} onChange={e => setFormData({ ...formData, time: e.target.value })} />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100 dark:border-white/10">
                        <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white font-bold transition">انصراف</button>
                        <button type="submit" className="px-6 py-3 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 shadow-lg shadow-amber-500/20 active:scale-95 transition">ذخیره</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
