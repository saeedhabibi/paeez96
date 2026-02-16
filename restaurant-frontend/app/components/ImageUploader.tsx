'use client';

import { useState } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
    value: string;
    onChange: (url: string) => void;
    placeholder?: string;
}

export default function ImageUploader({ value, onChange, placeholder = "فایل تصویر را انتخاب کنید" }: ImageUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation
        if (!file.type.startsWith('image/')) {
            setError('لطفاً یک فایل تصویری انتخاب کنید.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError('حجم فایل باید کمتر از 5 مگابایت باشد.');
            return;
        }

        setError(null);
        setUploading(true);

        const formData = new FormData();
        formData.append('image', file);
        // Using the user provided API key directly for simplicity in client-side upload
        // In a real production app, this should be proxied through backend to hide key, 
        // but ImgBB free key is often used client-side.
        const API_KEY = 'd5439b751cf5371bd46d7dad6d816dd1';

        try {
            const response = await fetch(`https://api.imgbb.com/1/upload?key=${API_KEY}`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                onChange(data.data.url);
            } else {
                setError('خطا در آپلود تصویر: ' + (data.error?.message || 'Unknown error'));
            }
        } catch (err) {
            setError('خطا در برقراری ارتباط با سرور.');
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-4">
                {/* Preview */}
                <div className="relative w-24 h-24 bg-slate-100 dark:bg-white/5 rounded-xl border-2 border-dashed border-slate-300 dark:border-white/10 flex items-center justify-center overflow-hidden shrink-0 group">
                    {value ? (
                        <>
                            <img src={value} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                    onClick={() => onChange('')}
                                    className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                                    title="حذف تصویر"
                                    type="button"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <ImageIcon className="text-slate-300 dark:text-slate-600" size={32} />
                    )}
                </div>

                {/* Upload Controls */}
                <div className="flex-1">
                    <label className="block w-full">
                        <span className="sr-only">انتخاب فایل تصویر</span>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={uploading}
                            className="block w-full text-sm text-slate-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-amber-50 file:text-amber-700
                                hover:file:bg-amber-100
                                dark:file:bg-amber-500/10 dark:file:text-amber-500
                                transition cursor-pointer
                            "
                        />
                    </label>

                    {/* Manual URL Input */}
                    <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-slate-400">یا لینک مستقیم:</span>
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            className="flex-1 bg-transparent border-b border-slate-200 dark:border-white/10 text-xs py-1 focus:outline-none focus:border-amber-500 text-slate-600 dark:text-slate-400 font-mono"
                            placeholder="https://..."
                        />
                    </div>

                    {uploading && (
                        <div className="text-xs text-amber-500 mt-2 flex items-center gap-2">
                            <Loader2 size={12} className="animate-spin" />
                            در حال آپلود...
                        </div>
                    )}

                    {error && (
                        <p className="text-xs text-red-500 mt-2">{error}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
