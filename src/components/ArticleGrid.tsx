'use client';

import ArticleCard, { Article } from '@/components/ArticleCard';

interface ArticleGridProps {
    articles: Article[];
    isLoading?: boolean;
}

export default function ArticleGrid({ articles, isLoading = false }: ArticleGridProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-96 rounded-3xl bg-gray-100 animate-pulse border border-gray-200" />
                ))}
            </div>
        );
    }

    if (articles.length === 0) {
        return null;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article, index) => (
                <ArticleCard key={index} article={article} />
            ))}
        </div>
    );
}
