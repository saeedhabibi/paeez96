'use client';

import React, { useState, useEffect } from 'react';
import { Share, PlusSquare, X } from 'lucide-react';

export default function InstallPWA({ lang }: { lang: 'en' | 'fa' }) {
    const [supportsPWA, setSupportsPWA] = useState(false);
    const [promptInstall, setPromptInstall] = useState<any>(null);
    const [isIOS, setIsIOS] = useState(false);
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        // Check if already in standalone mode (installed)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone ||
            document.referrer.includes('android-app://');

        if (isStandalone) return;

        // Check for iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(isIosDevice);

        // Check for Android/Chrome "beforeinstallprompt"
        const handler = (e: any) => {
            e.preventDefault();
            setSupportsPWA(true);
            setPromptInstall(e);
            setShowBanner(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Show banner for iOS users too, but with different instructions
        if (isIosDevice) {
            setShowBanner(true);
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const onInstallClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (!promptInstall) {
            return;
        }
        promptInstall.prompt();
        promptInstall.userChoice.then((choiceResult: { outcome: string }) => {
            if (choiceResult.outcome === 'accepted') {
                setShowBanner(false);
            }
        });
    };

    if (!showBanner) return null;

    const t = lang === 'fa' ? {
        installTitle: 'نصب اپلیکیشن',
        installDesc: 'برای تجربه بهتر، اپلیکیشن ما را نصب کنید.',
        installBtn: 'نصب',
        iosGuide: 'برای نصب در آیفون: دکمه Share را بزنید و سپس گزینه Add to Home Screen را انتخاب کنید.',
        dismiss: 'بعداً'
    } : {
        installTitle: 'Install App',
        installDesc: 'Install our app for a better experience.',
        installBtn: 'Install',
        iosGuide: 'To install on iOS: Tap Share, then select Add to Home Screen.',
        dismiss: 'Later'
    };

    return (
        <div className={`fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-5 duration-500`}>
            <div className="max-w-md mx-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-4 relative overflow-hidden">

                {/* Close Button */}
                <button
                    onClick={() => setShowBanner(false)}
                    className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                >
                    <X size={18} />
                </button>

                <div className="flex items-start gap-4 pr-6 rtl:pl-6 rtl:pr-0">
                    <div className="bg-orange-500 text-white p-3 rounded-xl shadow-lg shadow-orange-500/20">
                        <PlusSquare size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-1 is-vazir">{t.installTitle}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3 is-vazir">
                            {isIOS ? t.iosGuide : t.installDesc}
                        </p>

                        {!isIOS && supportsPWA && (
                            <button
                                onClick={onInstallClick}
                                className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2 rounded-xl text-sm font-bold shadow-lg active:scale-95 transition-transform w-full sm:w-auto"
                            >
                                {t.installBtn}
                            </button>
                        )}

                        {isIOS && (
                            <div className="flex items-center gap-2 text-xs font-bold text-blue-500 mt-2">
                                <Share size={14} />
                                <span>Share</span>
                                <span className="text-slate-300">→</span>
                                <span>Add to Home Screen</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
