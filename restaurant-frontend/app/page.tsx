
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import {
  Phone, MapPin, Clock, Search, Share2, Save, Globe, Star, X,
  Flame, Info, Navigation, MessageSquare, ExternalLink, Check, Sun, Moon
} from 'lucide-react';

// ----------------------------------------------------------------------
// TYPES
// ----------------------------------------------------------------------

interface MenuItem {
  id: number;
  name_en: string;
  name_fa: string;
  description_en?: string;
  description_fa?: string;
  price: number;
  image_url: string;
  rating?: number;
  calories?: number;
  time?: string;
  ingredients_en?: string[];
  ingredients_fa?: string[];
  is_available?: boolean;
}

interface Review {
  id: number;
  user: string;
  rating: number;
  date_en: string;
  date_fa: string;
  comment_en: string;
  comment_fa: string;
  avatar?: string;
}

interface Category {
  id: number;
  title_en: string;
  title_fa: string;
  items: MenuItem[];
}

interface MenuData {
  categories: Category[];
}

type Lang = 'en' | 'fa';

// ----------------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------------

export default function PaeezRestaurant() {
  const [lang, setLang] = useState<Lang>('fa');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Theme Logic
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = storedTheme === 'dark' || (!storedTheme && prefersDark);

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
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<number>(0);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [showRestaurantInfo, setShowRestaurantInfo] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const t = CONTENT[lang];
  const isRTL = lang === 'fa';

  // --- Side Effects ---

  // Check Open Status (Tehran Time)
  useEffect(() => {
    const checkStatus = () => {
      const tehranDateStr = new Date().toLocaleString("en-US", { timeZone: "Asia/Tehran" });
      const tehranDate = new Date(tehranDateStr);
      const hour = tehranDate.getHours();
      setIsOpen(hour >= 12); // Assuming open from 12 PM
    };
    checkStatus();
    const interval = setInterval(checkStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Menu
  useEffect(() => {
    // Track visit
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    fetch(`${apiUrl}/api/track-visit`, { method: 'POST' })
      .catch(err => console.error('Failed to track visit', err));

    const fetchMenu = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
        const res = await fetch(`${apiUrl}/api/menu`);
        if (!res.ok) throw new Error('API Error');
        const rawData = await res.json();

        // Transform Backend Data to Frontend Format
        const transformedCategories = rawData.map((cat: any) => ({
          id: cat.id,
          title_en: cat.slug.replace('-', ' ').toUpperCase(), // Fallback
          title_fa: cat.name_fa || cat.name,
          items: cat.items.map((item: any) => ({
            id: item.id,
            name_en: item.name,
            name_fa: item.name_fa,
            description_en: item.description,
            description_fa: item.description_fa,
            price: item.price,
            image_url: item.image_url,
            rating: item.rating,
            calories: item.calories,
            time: item.time,
            ingredients_en: item.ingredients_en ? item.ingredients_en.split(',') : [],
            ingredients_fa: item.ingredients_fa ? item.ingredients_fa.split(',') : [],
            is_available: item.is_available !== false // Default to true if missing
          }))
        }));

        setMenuData({ categories: transformedCategories });
        if (transformedCategories?.length > 0) setActiveCategory(transformedCategories[0].id);
      } catch (err) {
        console.error('Failed to fetch menu:', err);
        setMenuData(FALLBACK_DATA);
        if (FALLBACK_DATA.categories.length > 0) {
          setActiveCategory(FALLBACK_DATA.categories[0].id);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  // Body Scroll Lock
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = (selectedItem || showRestaurantInfo) ? 'hidden' : 'unset';
    }
    return () => {
      if (typeof document !== 'undefined') document.body.style.overflow = 'unset';
    };
  }, [selectedItem, showRestaurantInfo]);

  // --- Handlers ---

  const handleCall = () => window.open(`tel:${CONFIG.phone}`);
  const handleNavigate = () => window.open(CONFIG.mapsUrl, '_blank');

  const handleSaveContact = () => {
    const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:Paeez 96\nTEL:${CONFIG.phone}\nADR:;;${CONFIG.addressEn};;;\nEND:VCARD`;
    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'paeez96.vcf';
    a.click();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Paeez 96 Restaurant',
          text: 'Check out this amazing menu!',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share failed', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const scrollToCategory = (id: number) => {
    setActiveCategory(id);
    const element = document.getElementById(`cat-${id}`);
    if (element) {
      const yOffset = -180;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // --- Memoized Data ---

  const filteredCategories = useMemo(() => {
    if (!menuData) return [];
    if (!searchQuery) return menuData.categories;

    const q = searchQuery.toLowerCase();
    return menuData.categories.map(cat => ({
      ...cat,
      items: cat.items.filter(item =>
        item.name_en.toLowerCase().includes(q) ||
        item.name_fa.includes(q) ||
        (item.description_en?.toLowerCase() || '').includes(q) ||
        (item.description_fa || '').includes(q)
      )
    })).filter(cat => cat.items.length > 0);
  }, [menuData, searchQuery]);

  // --- Render ---

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className={`min-h-screen bg-[#F8F9FB] dark:bg-slate-950 text-gray-900 dark:text-gray-100 pb-20 font-sans ${isRTL ? 'font-[family-name:var(--font-vazir)]' : 'font-[family-name:var(--font-inter)]'}`}
    >
      <Toast visible={isCopied} message={t.copied} />

      <HeroSection
        lang={lang}
        onToggleLang={() => setLang(l => l === 'en' ? 'fa' : 'en')}
        isRTL={isRTL}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />

      <div className="relative px-4 -mt-24 z-20 cursor-pointer" onClick={() => setShowRestaurantInfo(true)}>
        <div className="bg-white dark:bg-slate-900/80 dark:backdrop-blur-md dark:border dark:border-white/10 rounded-[45px] p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] active:scale-[0.98] transition-all duration-200">
          <div className="flex justify-between items-start mb-6">
            <div className={`
              w-[88px] h-[88px] bg-slate-900 dark:bg-white rounded-[28px] text-white dark:text-slate-900
              flex flex-col items-center justify-center shadow-2xl
              transform rotate-3 origin-center
              ${isRTL ? '-ml-2' : '-mr-2'}
            `}>
              <span className="text-[9px] font-medium tracking-widest opacity-60 mb-0.5">{t.est}</span>
              <span className="text-2xl font-black tracking-tighter leading-none">96</span>
              <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">Paeez</span>
            </div>

            <div className={`flex flex-col ${isRTL ? 'items-start' : 'items-end'}`}>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-2 ${isOpen ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-red-50 text-red-700 dark:bg-red-500/20 dark:text-red-400'}`}>
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOpen ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isOpen ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                </span>
                <span className="text-xs font-bold">{isOpen ? t.openStatus : t.closedStatus}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                <Clock size={12} />
                <span>{t.hours}</span>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2 leading-none">{t.title}</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">{t.subtitle}</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-4 group" onClick={(e) => { e.stopPropagation(); handleNavigate(); }}>
              <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-white/10 flex items-center justify-center shrink-0 text-slate-600 dark:text-slate-300 group-hover:bg-slate-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-slate-900 transition-colors">
                <MapPin size={18} />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-snug pt-2">{t.address}</p>
            </div>
            <div className="flex items-center gap-4 group" onClick={(e) => { e.stopPropagation(); handleCall(); }}>
              <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-white/10 flex items-center justify-center shrink-0 text-slate-600 dark:text-slate-300 group-hover:bg-slate-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-slate-900 transition-colors">
                <Phone size={18} />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300" dir="ltr">{CONFIG.phone}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              className="flex-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 h-14 rounded-[20px] flex items-center justify-center gap-2 font-bold text-sm shadow-lg active:scale-95 transition-transform"
              onClick={(e) => { e.stopPropagation(); handleSaveContact(); }}
            >
              <Save size={18} />
              {t.btnSave}
            </button>
            <button
              className="w-14 h-14 bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white rounded-[20px] flex items-center justify-center shadow-sm active:scale-95 transition-transform"
              onClick={(e) => { e.stopPropagation(); handleShare(); }}
            >
              <Share2 size={20} />
            </button>
          </div>
        </div>
      </div>

      <StickyNav
        t={t}
        isRTL={isRTL}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categories={filteredCategories}
        activeCategory={activeCategory}
        onCategoryClick={scrollToCategory}
      />

      <MenuGrid
        loading={loading}
        categories={filteredCategories}
        isRTL={isRTL}
        t={t}
        onItemClick={setSelectedItem}
      />

      <Footer />

      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          isRTL={isRTL}
          t={t}
        />
      )}

      {showRestaurantInfo && (
        <RestaurantInfoModal
          onClose={() => setShowRestaurantInfo(false)}
          isRTL={isRTL}
          t={t}
          isOpen={isOpen}
          onCall={handleCall}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// SUB-COMPONENTS
// ----------------------------------------------------------------------

const Toast = ({ visible, message }: { visible: boolean; message: string }) => {
  if (!visible) return null;
  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white px-6 py-3 rounded-full flex items-center gap-2 shadow-2xl animate-bounce">
      <Check size={18} className="text-emerald-400" />
      <span className="font-bold text-sm">{message}</span>
    </div>
  );
};

const HeroSection = ({ lang, onToggleLang, isRTL, isDarkMode, toggleTheme }: { lang: Lang, onToggleLang: () => void, isRTL: boolean, isDarkMode: boolean, toggleTheme: () => void }) => (
  <header className="relative w-full h-[320px]">
    <Image
      src={CONFIG.heroImage}
      alt="Restaurant Ambience"
      fill
      className="object-cover"
      priority
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

    <div className={`absolute top-6 ${isRTL ? 'left-6' : 'right-6'} z-30 flex gap-3`}>
      <button
        onClick={toggleTheme}
        className="flex items-center justify-center w-10 h-10 rounded-full
        bg-white/10 backdrop-blur-xl border border-white/20
        text-white hover:bg-white/20 transition-all"
      >
        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <button
        onClick={onToggleLang}
        className="flex items-center gap-2 px-4 py-2.5 rounded-full
        bg-white/10 backdrop-blur-xl border border-white/20
        text-white font-bold text-sm tracking-wide hover:bg-white/20 transition-all"
      >
        <Globe size={16} />
        <span>{lang === 'en' ? 'FA' : 'EN'}</span>
      </button>
    </div>
  </header>
);

const ProfileCard = ({ t, isRTL, isOpen, onInfoClick, onNavigate, onCall, onSave, onShare }: any) => (
  <div className="relative px-4 -mt-24 z-20 cursor-pointer" onClick={onInfoClick}>
    <div className="bg-white rounded-[45px] p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] active:scale-[0.98] transition-transform duration-200">
      <div className="flex justify-between items-start mb-6">
        <div className={`
          w-[88px] h-[88px] bg-slate-900 rounded-[28px] text-white
          flex flex-col items-center justify-center shadow-2xl
          transform rotate-3 origin-center
          ${isRTL ? '-ml-2' : '-mr-2'}
        `}>
          <span className="text-[9px] font-medium tracking-widest opacity-60 mb-0.5">{t.est}</span>
          <span className="text-2xl font-black tracking-tighter leading-none">96</span>
          <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">Paeez</span>
        </div>

        <div className={`flex flex-col ${isRTL ? 'items-start' : 'items-end'}`}>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-2 ${isOpen ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOpen ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isOpen ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
            </span>
            <span className="text-xs font-bold">{isOpen ? t.openStatus : t.closedStatus}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
            <Clock size={12} />
            <span>{t.hours}</span>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2 leading-none">{t.title}</h1>
        <p className="text-slate-500 font-medium text-sm">{t.subtitle}</p>
      </div>

      <div className="space-y-4 mb-8">
        <div className="flex items-start gap-4 group" onClick={(e) => { e.stopPropagation(); onNavigate(); }}>
          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0 text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition-colors">
            <MapPin size={18} />
          </div>
          <p className="text-sm font-semibold text-slate-700 leading-snug pt-2">{t.address}</p>
        </div>
        <div className="flex items-center gap-4 group" onClick={(e) => { e.stopPropagation(); onCall(); }}>
          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0 text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition-colors">
            <Phone size={18} />
          </div>
          <p className="text-sm font-semibold text-slate-700" dir="ltr">{CONFIG.phone}</p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          className="flex-1 bg-slate-900 text-white h-14 rounded-[20px] flex items-center justify-center gap-2 font-bold text-sm shadow-lg active:scale-95 transition-transform"
          onClick={(e) => { e.stopPropagation(); onSave(); }}
        >
          <Save size={18} />
          {t.btnSave}
        </button>
        <button
          className="w-14 h-14 bg-slate-100 text-slate-900 rounded-[20px] flex items-center justify-center shadow-sm active:scale-95 transition-transform"
          onClick={(e) => { e.stopPropagation(); onShare(); }}
        >
          <Share2 size={20} />
        </button>
      </div>
    </div>
  </div>
);

const StickyNav = ({ t, isRTL, searchQuery, onSearchChange, categories, activeCategory, onCategoryClick }: any) => (
  <div className="sticky top-0 z-40 bg-[#F8F9FB]/95 dark:bg-slate-950/95 backdrop-blur-md pt-6 pb-2 border-b border-slate-200/50 dark:border-white/5">
    <div className="px-5 mb-4">
      <div className="relative">
        <input
          type="text"
          placeholder={t.search}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className={`w-full h-14 bg-white dark:bg-slate-900 dark:text-white rounded-[24px] shadow-sm text-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-white/10 transition-shadow ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'}`}
        />
        <Search className={`absolute top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 ${isRTL ? 'right-4' : 'left-4'}`} size={20} />
      </div>
    </div>

    {categories.length > 0 && (
      <div className="w-full overflow-x-auto no-scrollbar pb-2 px-5 flex gap-3 snap-x">
        {categories.map((cat: Category) => (
          <button
            key={cat.id}
            onClick={() => onCategoryClick(cat.id)}
            className={`snap-start shrink-0 px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 ${activeCategory === cat.id ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg shadow-slate-900/20 scale-105' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 shadow-sm border border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            {isRTL ? cat.title_fa : cat.title_en}
          </button>
        ))}
      </div>
    )}
  </div>
);

const MenuGrid = ({ loading, categories, isRTL, t, onItemClick }: any) => (
  <div className="px-4 pt-4 space-y-12">
    {loading ? (
      <div className="text-center py-20 text-slate-400">{t.loading}</div>
    ) : categories.length === 0 ? (
      <div className="text-center py-20 text-slate-400 font-medium">
        <Search size={48} className="mx-auto mb-4 opacity-20" />
        {t.noResults}
      </div>
    ) : (
      categories.map((category: Category) => (
        <div key={category.id} id={`cat-${category.id}`} className="scroll-mt-48">
          <div className="flex items-center gap-4 mb-6 px-2">
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-200 tracking-tight">{isRTL ? category.title_fa : category.title_en}</h2>
            <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
          </div>
          <div className="space-y-6">
            {category.items?.map((item: any) => (
              <MenuItemCard key={item.id} item={item} isRTL={isRTL} t={t} onClick={() => onItemClick(item)} />
            ))}
          </div>
        </div>
      ))
    )}
  </div>
);

const MenuItemCard = ({ item, isRTL, t, onClick }: any) => {
  const formatPrice = (price: number) => {
    if (price === 0) return isRTL ? 'به نرخ روز' : 'Market Price';
    if (isRTL) return `${price.toLocaleString()} ${t.currencySuffix}`;
    return `${t.currency}${Math.round(price / 60000).toFixed(2)}`;
  };

  const showPrice = item.is_available !== false; // Default true

  return (
    <div className="group relative cursor-pointer" onClick={onClick}>
      <div className="relative h-[280px] w-full rounded-[45px] overflow-hidden shadow-lg bg-white dark:bg-slate-900">
        <Image src={item.image_url} alt={isRTL ? item.name_fa : item.name_en} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

        {/* Availability Badge / Price */}
        {showPrice ? (
          <div className={`absolute bottom-5 ${isRTL ? 'left-5' : 'right-5'} px-5 py-3 rounded-[20px] bg-white/30 backdrop-blur-md border border-white/40 text-white font-black text-lg shadow-xl`}>
            {formatPrice(item.price)}
          </div>
        ) : (
          <div className={`absolute bottom-5 ${isRTL ? 'left-5' : 'right-5'} px-5 py-3 rounded-[20px] bg-white/30 backdrop-blur-md border border-white/40 text-white font-black text-lg shadow-xl`}>
            {isRTL ? 'ناموجود' : 'Sold Out'}
          </div>
        )}

        {item.rating && (
          <div className={`absolute top-5 ${isRTL ? 'right-5' : 'left-5'} w-10 h-10 rounded-full bg-white text-slate-900 flex items-center justify-center font-bold text-xs shadow-lg`}>
            {item.rating}
          </div>
        )}
      </div>
      <div className="px-4 pt-4 pb-2">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{isRTL ? item.name_fa : item.name_en}</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed line-clamp-2">{isRTL ? item.description_fa : item.description_en}</p>
      </div>
    </div>
  );
};

const Footer = () => (
  <div className="mt-12 py-8 text-center text-slate-400 dark:text-slate-600 text-xs font-medium border-t border-slate-200 dark:border-white/5 mx-8">
    <p>© 2026 PAEEZ 96 RESTURANT</p>
    <p className="mt-1">DESIGNED & DEVELOPED BY SAEED HABIBI</p>
  </div>
);

// --- Modals ---

const BaseModal = ({ onClose, children }: { onClose: () => void, children: React.ReactNode }) => (
  <>
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-300" onClick={onClose} />
    <div className={`fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 dark:text-white rounded-t-[45px] shadow-[0_-10px_40px_rgba(0,0,0,0.2)] transform transition-transform duration-300 ease-out max-h-[95vh] overflow-y-auto no-scrollbar`} style={{ animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
      {children}
    </div>
    <style jsx global>{`
      @keyframes slideUp {
        from { transform: translateY(100%); }
        to { transform: translateY(0); }
      }
    `}</style>
  </>
);

const ItemDetailModal = ({ item, onClose, isRTL, t }: any) => {
  const formatPrice = (price: number) => {
    if (price === 0) return isRTL ? 'به نرخ روز' : 'Market Price';
    if (isRTL) return `${price.toLocaleString()} ${t.currencySuffix}`;
    return `${t.currency}${Math.round(price / 60000).toFixed(2)}`;
  };

  const showPrice = item.is_available !== false;

  return (
    <BaseModal onClose={onClose}>
      <button onClick={onClose} className={`absolute top-6 ${isRTL ? 'left-6' : 'right-6'} z-10 w-10 h-10 bg-black/20 backdrop-blur-md rounded-full text-white flex items-center justify-center`}>
        <X size={20} />
      </button>
      <div className="relative h-[300px] w-full">
        <Image src={item.image_url} alt={isRTL ? item.name_fa : item.name_en} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-900 via-transparent to-transparent" />
      </div>
      <div className="px-8 pb-8 -mt-12 relative">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-none w-3/4">{isRTL ? item.name_fa : item.name_en}</h2>
          {showPrice ? (
            <div className="text-xl font-bold text-slate-900 bg-slate-100 dark:bg-white/10 dark:text-white px-3 py-1.5 rounded-xl">{formatPrice(item.price)}</div>
          ) : (
            <div className="text-xl font-bold text-slate-900 bg-slate-100 dark:bg-white/10 dark:text-white px-3 py-1.5 rounded-xl">{isRTL ? 'ناموجود' : 'Sold Out'}</div>
          )}
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6">{isRTL ? item.description_fa : item.description_en}</p>
        <div className="flex gap-4 mb-8 overflow-x-auto no-scrollbar">
          {item.calories && (
            <div className="px-4 py-3 bg-orange-50 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 rounded-2xl flex items-center gap-2 shrink-0">
              <Flame size={18} />
              <span className="font-bold text-sm">{item.calories} {t.calories}</span>
            </div>
          )}
          {item.time && (
            <div className="px-4 py-3 bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 rounded-2xl flex items-center gap-2 shrink-0">
              <Clock size={18} />
              <span className="font-bold text-sm">{item.time} {t.min}</span>
            </div>
          )}
          {item.rating && (
            <div className="px-4 py-3 bg-yellow-50 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 rounded-2xl flex items-center gap-2 shrink-0">
              <Star size={18} fill="currentColor" />
              <span className="font-bold text-sm">{item.rating}</span>
            </div>
          )}
        </div>
        <div className="mb-24">
          <h3 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2"><Info size={16} />{t.ingredients}</h3>
          <div className="flex flex-wrap gap-2">
            {(isRTL ? item.ingredients_fa : item.ingredients_en)?.map((ing: string, i: number) => (
              <span key={i} className="px-3 py-1.5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 rounded-full text-xs font-semibold">{ing}</span>
            )) || <span className="text-slate-400 text-sm">-</span>}
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

const RestaurantInfoModal = ({ onClose, isRTL, t, isOpen, onCall, onNavigate }: any) => (
  <BaseModal onClose={onClose}>
    <button onClick={onClose} className={`absolute top-6 ${isRTL ? 'left-6' : 'right-6'} z-10 w-10 h-10 bg-black/20 backdrop-blur-md rounded-full text-white flex items-center justify-center`}>
      <X size={20} />
    </button>
    <div className="relative h-[250px] w-full">
      <Image src={CONFIG.heroImage} alt="Paeez 96" fill className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#F8F9FB] dark:from-slate-950 via-transparent to-transparent" />
    </div>

    <div className="px-8 pb-8 -mt-12 relative bg-[#F8F9FB] dark:bg-slate-950">
      <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{t.aboutTitle}</h2>
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl mb-6 ${isOpen ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-red-50 text-red-700 dark:bg-red-500/20 dark:text-red-400'}`}>
        <span className={`w-2.5 h-2.5 rounded-full ${isOpen ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
        <span className="font-bold text-sm">{isOpen ? t.openStatus : t.closedStatus}</span>
        {!isOpen && <span className="text-xs opacity-80 ml-1">({t.opensAt})</span>}
      </div>

      <div className="space-y-6 mb-8">
        <div>
          <h3 className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">{t.workingHours}</h3>
          <p className="text-slate-800 dark:text-white font-bold text-lg">{t.hours}</p>
        </div>
        <div>
          <h3 className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">{t.address}</h3>
          <p className="text-slate-800 dark:text-white font-medium leading-relaxed">{t.address}</p>
        </div>
      </div>

      <div className="w-full h-[200px] bg-slate-100 dark:bg-white/5 rounded-[30px] overflow-hidden mb-8 relative shadow-inner cursor-pointer" onClick={onNavigate}>
        <iframe
          src="https://maps.google.com/maps?q=Paeez+96+Restaurant,+Bandar+Anzali&t=&z=15&ie=UTF8&iwloc=&output=embed"
          width="100%" height="100%" style={{ border: 0, pointerEvents: 'none' }} allowFullScreen loading="lazy"
          className="grayscale hover:grayscale-0 transition-all duration-500"
        />
        <div className="absolute inset-0 bg-transparent" />
      </div>

      <div className="flex gap-3 mb-12">
        <button className="flex-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 h-14 rounded-[20px] flex items-center justify-center gap-2 font-bold text-sm shadow-lg active:scale-95 transition-transform" onClick={onCall}>
          <Phone size={18} />{t.callNow}
        </button>
        <button className="flex-1 bg-white dark:bg-white/10 text-slate-900 dark:text-white h-14 rounded-[20px] flex items-center justify-center gap-2 font-bold text-sm border border-slate-200 dark:border-white/10 active:scale-95 transition-transform" onClick={onNavigate}>
          <Navigation size={18} />{t.navigate}
        </button>
      </div>

      {/* Reviews */}
      <div className="pt-4 border-t border-slate-200 dark:border-white/5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare size={20} className="text-slate-400" />
              {t.reviews}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">{t.basedOn}</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 rounded-xl">
            <Star size={16} fill="currentColor" />
            <span className="font-black text-sm">4.8</span>
          </div>
        </div>

        <div className="space-y-4 mb-10">
          {MOCK_REVIEWS.map((review) => (
            <div key={review.id} className="bg-white dark:bg-white/5 p-5 rounded-[28px] border border-slate-100 dark:border-white/5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 dark:text-white font-bold text-xs">
                    {review.avatar}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{review.user}</h4>
                    <p className="text-[10px] text-slate-400 font-medium">{isRTL ? review.date_fa : review.date_en}</p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={10} fill={i < review.rating ? "#EAB308" : "#E2E8F0"} stroke="none" />
                  ))}
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-xs font-medium leading-relaxed">
                {isRTL ? review.comment_fa : review.comment_en}
              </p>
            </div>
          ))}
        </div>

        <button className="w-full py-4 rounded-[20px] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 font-bold text-sm flex items-center justify-center gap-2 hover:bg-white dark:hover:bg-white/5 transition-colors" onClick={onNavigate}>
          {t.viewMore}
          <ExternalLink size={16} />
        </button>
      </div>
    </div>
  </BaseModal>
);

// ----------------------------------------------------------------------
// DATA & CONSTANTS
// ----------------------------------------------------------------------

const CONFIG = {
  phone: "+989111851233",
  heroImage: "https://i.ibb.co/TqPZzjCJ/IMG-20260215-215945.jpg",
  mapsUrl: "https://www.google.com/maps/dir/?api=1&destination=Paeez+96+Restaurant+Bandar+Anzali",
  GET: "Atba Blvd, Ghazian, Bandar Anzali",
  addressEn: "Atba Blvd, Ghazian, Bandar Anzali",
  vcard: `BEGIN:VCARD
VERSION:3.0
FN:Paeez 96 Restaurant
ORG:Paeez 96
TEL;TYPE=WORK,VOICE:+989111851233
ADR;TYPE=WORK:;;Atba Blvd, Ghazian;Bandar Anzali;;;Iran
URL:https://paeez96.com
END:VCARD`
};

const MOCK_REVIEWS: Review[] = [
  { id: 1, user: "Ali Rezayi", rating: 5, date_en: "2 weeks ago", date_fa: "۲ هفته پیش", comment_en: "The best steaks in Anzali! The vibe is amazing...", comment_fa: "بهترین استیک‌های انزلی! محیط عالی و پرسنل بسیار حرفه‌ای هستند.", avatar: "AR" },
  { id: 2, user: "Sara Karimi", rating: 4, date_en: "1 month ago", date_fa: "۱ ماه پیش", comment_en: "Mirza Ghasemi was delicious...", comment_fa: "میرزا قاسمی خیلی خوشمزه بود. ویو بلوار هم خیلی قشنگه.", avatar: "SK" },
  { id: 3, user: "John Doe", rating: 5, date_en: "3 months ago", date_fa: "۳ ماه پیش", comment_en: "Perfect spot for a luxury dinner...", comment_fa: "مکانی عالی برای یک شام لوکس. ریب‌آی رو به شدت پیشنهاد می‌کنم.", avatar: "JD" }
];

const CONTENT = {
  en: {
    title: "Paeez 96", subtitle: "Premium Dining • Lounge", address: "Mellat Bank, Ghazian, Bandar Anzali", openStatus: "Open Now", closedStatus: "Closed Now", hours: "12:00 PM - 12:00 AM", btnSave: "Save Contact", btnShare: "Share", search: "Search menu...", currency: "$", currencySuffix: "", popular: "Popular", loading: "Loading Menu...", menuTitle: "Our Menu", addToOrder: "Add to Order", ingredients: "Ingredients", calories: "Calories", min: "min", noResults: "No items found.", aboutTitle: "About Paeez 96", callNow: "Call Now", navigate: "Navigate", workingHours: "Working Hours", opensAt: "Opens at 12:00 PM", reviews: "Google Reviews", basedOn: "Based on 450+ reviews", viewMore: "View on Google Maps", copied: "Link copied!", est: "EST. 1996"
  },
  fa: {
    title: "رستوران پاییز ۹۶", subtitle: "رستوران • کافه • لانژ", address: "بندر انزلی، غازیان، جنب بانک ملت ", openStatus: "اکنون باز است", closedStatus: "اکنون بسته است", hours: "۱۲:۰۰ ظهر - ۱۲:۰۰ شب", btnSave: "ذخیره تماس", btnShare: "اشتراک", search: "جستجو در منو...", currency: "", currencySuffix: "تومان", popular: "محبوب", loading: "در حال بارگذاری...", menuTitle: "منوی ما", addToOrder: "افزودن به سفارش", ingredients: "محتویات", calories: "کالری", min: "دقیقه", noResults: "موردی یافت نشد.", aboutTitle: "درباره پاییز ۹۶", callNow: "تماس بگیرید", navigate: "مسیریابی", workingHours: "ساعات کاری", opensAt: "ساعت ۱۲:۰۰ باز می‌شود", reviews: "نظرات گوگل مپ", basedOn: "بر اساس بیش از ۴۵۰ نظر", viewMore: "مشاهده در گوگل مپ", copied: "لینک کپی شد!", est: "تأسیس ۱۳۷۵"
  }
};

const FALLBACK_DATA: MenuData = {
  categories: [
    {
      id: 1, title_en: "Signature Steaks", title_fa: "استیک‌های ویژه", items: [
        { id: 101, name_en: "Ribeye Steak", name_fa: "استیک ریب‌آی", description_en: "Wet aged beef with roasted vegetables...", description_fa: "گوساله بیات شده با سبزیجات کبابی و سس ترافل مخصوص.", price: 25, rating: 4.9, calories: 850, time: "25-30", ingredients_en: ["Ribeye Cut", "Asparagus"], ingredients_fa: ["راسته گوساله", "مارچوبه"], image_url: "https://images.unsplash.com/photo-1600891964092-4316c288032e?q=80&w=800&auto=format&fit=crop" },
        { id: 102, name_en: "T-Bone Special", name_fa: "تی‌بون مخصوص", description_en: "Charcoal grilled with mushroom sauce", description_fa: "گریل ذغالی با سس قارچ", price: 28, rating: 4.8, calories: 920, time: "30-35", ingredients_en: ["T-Bone", "Wild Mushrooms"], ingredients_fa: ["تی‌بون", "قارچ جنگلی"], image_url: "https://images.unsplash.com/photo-1594041680534-e8c8cdebd659?q=80&w=800&auto=format&fit=crop" }
      ]
    },
    {
      id: 2, title_en: "Local Favorites", title_fa: "غذاهای محلی", items: [
        { id: 201, name_en: "Mirza Ghasemi", name_fa: "میرزا قاسمی", description_en: "Smoked eggplant, garlic, eggs", description_fa: "بادمجان دودی، سیر، تخم مرغ", price: 12, rating: 5.0, calories: 420, time: "15-20", ingredients_en: ["Eggplant", "Garlic"], ingredients_fa: ["بادمجان", "سیر"], image_url: "https://images.unsplash.com/photo-1618449840665-9ed506d73a34?q=80&w=800&auto=format&fit=crop" },
        { id: 202, name_en: "Kebab Torsh", name_fa: "کباب ترش", description_en: "Beef marinated in pomegranate paste & walnuts", description_fa: "گوساله مزه‌دار شده با رب انار و گردو", price: 18, rating: 4.7, calories: 650, time: "20-25", ingredients_en: ["Beef Fillet", "Walnuts"], ingredients_fa: ["فیله گوساله", "گردو"], image_url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800&auto=format&fit=crop" }
      ]
    },
    {
      id: 3, title_en: "Seafood", title_fa: "دریایی", items: [
        { id: 301, name_en: "Grilled Salmon", name_fa: "سالمون کبابی", description_en: "With lemon butter sauce", description_fa: "با سس کره لیمو", price: 22, rating: 4.6, calories: 580, time: "20", ingredients_en: ["Salmon Fillet", "Lemon"], ingredients_fa: ["فیله سالمون", "لیمو"], image_url: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=800&auto=format&fit=crop" }
      ]
    }
  ]
};
