'use client';

import { ExternalLink } from 'lucide-react';
import { useState } from 'react';

export interface Article {
    title: string;
    url: string;
    image?: string;
    source: string;
    date: string;
}

interface ArticleCardProps {
    article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopyPrompt = () => {
        const promptText = `Help me explain this news to my 5-year-old child in English and Simplified Chinese. The article is '${article.title}' (${article.url}). Keep it fun, simple, and safe!`;

        navigator.clipboard.writeText(promptText).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    return (
        <article className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow border border-secondary/30 flex flex-col h-full">
            {/* Header Image or Gradient */}
            <div className="h-32 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center p-4">
                {article.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={article.image} alt={article.title} className="w-full h-full object-cover rounded-xl opacity-90" />
                ) : (
                    <span className="text-4xl">📰</span>
                )}
            </div>

            <div className="p-6 flex-1 flex flex-col gap-4">
                {/* Original Headline */}
                <div className="flex-grow">
                    <div className="flex justify-between items-start gap-2 mb-2">
                        <span className="text-xs font-bold text-primary uppercase tracking-wider">{article.source}</span>
                        <span className="text-xs text-gray-400">{new Date(article.date).toLocaleDateString()}</span>
                    </div>
                    <a href={article.url} target="_blank" rel="noopener noreferrer" className="group block">
                        <h3 className="text-xl font-bold text-gray-800 group-hover:text-primary transition-colors line-clamp-3">
                            {article.title} <ExternalLink size={14} className="inline ml-1 opacity-50" />
                        </h3>
                    </a>
                </div>

                {/* AI Helper Section */}
                <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 mt-auto">
                    <p className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-2">Parents' AI Helper 🤖</p>
                    <button
                        onClick={handleCopyPrompt}
                        className={`w-full py-2 px-4 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all ${isCopied
                                ? 'bg-green-500 text-white shadow-md transform scale-105'
                                : 'bg-white text-purple-600 border-2 border-purple-200 hover:bg-purple-100 hover:border-purple-300'
                            }`}
                    >
                        {isCopied ? 'Copied! ✨' : 'Copy Prompt'}
                    </button>
                    <p className="text-[10px] text-purple-400 text-center mt-2 leading-tight">
                        Click to copy a prompt for your own AI (ChatGPT, Gemini) to explain this article to your child.
                    </p>
                </div>
            </div>
        </article>
    );
}
