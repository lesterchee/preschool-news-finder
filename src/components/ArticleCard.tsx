'use client';

import { Play, ExternalLink } from 'lucide-react';
import { useState } from 'react';

export interface Article {
    title: string;
    url: string;
    summaryParents: string;
    summaryKidsEn: string;
    image?: string;
    source: string;
    date: string;
    isSummarizing?: boolean;
}

interface ArticleCardProps {
    article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
    const [isPlaying, setIsPlaying] = useState(false);

    const playAudio = (text: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Stop any current speech

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 0.9; // Slightly slower for kids

            utterance.onstart = () => setIsPlaying(true);
            utterance.onend = () => setIsPlaying(false);

            window.speechSynthesis.speak(utterance);
        } else {
            alert("Sorry, your browser doesn't support text-to-speech!");
        }
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
                <div>
                    <div className="flex justify-between items-start gap-2">
                        <span className="text-xs font-bold text-primary uppercase tracking-wider">{article.source}</span>
                        <span className="text-xs text-gray-400">{new Date(article.date).toLocaleDateString()}</span>
                    </div>
                    <a href={article.url} target="_blank" rel="noopener noreferrer" className="group">
                        <h3 className="text-xl font-bold text-gray-800 group-hover:text-primary transition-colors line-clamp-2 mt-1">
                            {article.title} <ExternalLink size={14} className="inline ml-1 opacity-50" />
                        </h3>
                    </a>
                </div>

                {/* For Parents */}
                <div className="bg-gray-50 p-3 rounded-xl text-sm text-gray-600 border border-gray-100">
                    <strong className="block text-gray-500 text-xs mb-1 uppercase tracking-wide">For Parents</strong>
                    {article.summaryParents}
                </div>

                {/* For Kids (English) */}
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 relative group text-left flex-grow">
                    <div className="flex justify-between items-center mb-2">
                        <strong className="text-blue-600 text-sm font-bold uppercase tracking-wide">For Kids</strong>
                        <button
                            onClick={() => playAudio(article.summaryKidsEn)}
                            className={`p-2 rounded-full ${isPlaying ? 'bg-blue-200 text-blue-700 animate-pulse' : 'bg-white text-blue-500 hover:bg-blue-100'} transition-all shadow-sm disabled:opacity-50`}
                            aria-label="Play summary"
                            disabled={article.isSummarizing}
                        >
                            <Play size={16} fill="currentColor" />
                        </button>
                    </div>

                    {article.isSummarizing ? (
                        <div className="flex items-center gap-2 text-blue-400 animate-pulse">
                            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-sm font-medium">AI is reading...</span>
                        </div>
                    ) : (
                        <p className="text-gray-700 leading-relaxed font-medium">
                            {article.summaryKidsEn}
                        </p>
                    )}
                </div>
            </div>
        </article>
    );
}
