'use client';

import { useState, useEffect } from 'react';
import WordCloud from '@/components/WordCloud';
import ArticleGrid from '@/components/ArticleGrid';
import { Article } from '@/components/ArticleCard';

export default function Home() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchNews() {
      if (selectedTags.length > 0) {
        setIsLoading(true);
        try {
          // Construct query from tags (OR logic)
          const query = selectedTags.join(' OR ');
          const res = await fetch(`/api/news?q=${encodeURIComponent(query)}`);
          if (!res.ok) throw new Error('Failed to fetch');
          const data = await res.json();
          setArticles(data.articles || []);
        } catch (error) {
          console.error("Error fetching news:", error);
          setArticles([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setArticles([]);
      }
    }

    // Debounce slightly to avoid too many requests while typing/adding tags
    const timeoutId = setTimeout(() => {
      fetchNews();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [selectedTags]);

  return (
    <main className="min-h-screen p-8 md:p-12 max-w-7xl mx-auto space-y-12 bg-background">
      <header className="text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-black text-primary tracking-tight drop-shadow-sm">
          News for Little Explorers 🌟
        </h1>
        <p className="text-xl text-gray-500 font-medium">
          Discover stories about things you love!
        </p>
      </header>

      <section>
        <WordCloud onTagsChange={setSelectedTags} />
      </section>

      <section className="mt-12">
        {selectedTags.length > 0 && isLoading && (
          <div className="text-center text-gray-400 mb-8 animate-pulse">
            Scanning the world for stories... 🌍
          </div>
        )}
        <ArticleGrid articles={articles} isLoading={isLoading} />
      </section>
    </main>
  );
}
