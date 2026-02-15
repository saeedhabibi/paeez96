'use client';

import { useState, useEffect } from 'react';
import { Star, MessageSquareQuote } from 'lucide-react';

interface Review {
    id: number;
    author_name: string;
    rating: number;
    text: string;
    profile_photo_url: string;
    relative_time_description: string;
}

export default function ReviewsSection() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            // In a real app setup, use your actual API URL
            try {
                const res = await fetch('http://127.0.0.1:8000/api/reviews');
                if (res.ok) {
                    const data = await res.json();
                    setReviews(data);
                }
            } catch (error) {
                console.error("Failed to fetch reviews", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchReviews();
    }, []);

    if (isLoading) return <div className="h-40 flex items-center justify-center text-slate-400">در حال بارگذاری نظرات...</div>;
    if (reviews.length === 0) return null;

    return (
        <section className="py-20 bg-zinc-50 dark:bg-zinc-900/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <span className="text-amber-600 font-bold tracking-wider text-sm uppercase">نظرات مشتریان</span>
                    <h2 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-slate-100 mt-2">
                        تجربه <span className="text-amber-500">پاییزی</span> شما
                    </h2>
                    <div className="w-24 h-1 bg-amber-500 mx-auto mt-4 rounded-full" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {reviews.map((review) => (
                        <div key={review.id} className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-white/5 p-8 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none hover:-translate-y-2 transition-transform duration-300 relative group">
                            <div className="absolute top-8 left-8 text-amber-500/20 group-hover:text-amber-500/40 transition-colors">
                                <MessageSquareQuote size={48} />
                            </div>

                            <div className="flex items-center gap-4 mb-6 relative z-10">
                                <img
                                    src={review.profile_photo_url}
                                    alt={review.author_name}
                                    className="w-14 h-14 rounded-full object-cover border-2 border-amber-500/20"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${review.author_name}&background=random`;
                                    }}
                                />
                                <div>
                                    <h4 className="font-bold text-slate-800 dark:text-white">{review.author_name}</h4>
                                    <div className="flex gap-0.5 text-amber-500 mt-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "" : "text-slate-300 dark:text-slate-700"} />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed relative z-10 text-sm line-clamp-4 min-h-[5rem]">
                                "{review.text}"
                            </p>

                            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5 flex justify-between items-center text-xs font-medium text-slate-400">
                                <span>{review.relative_time_description}</span>
                                <span className="flex items-center gap-1.5">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png" className="w-4 h-4 opacity-70" alt="Google" />
                                    Google Reviews
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
