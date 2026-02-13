'use client';

import { useState, useEffect } from 'react';
import InterestList from '@/components/InterestList';
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
          // 1. Fetch Basic News
          const query = selectedTags.join(' OR ');
          const res = await fetch(`/api/news?q=${encodeURIComponent(query)}`);
          if (!res.ok) throw new Error('Failed to fetch');
          const data = await res.json();

          let fetchedArticles: Article[] = data.articles || [];

          // Initialize with "Summarizing" state
          fetchedArticles = fetchedArticles.map(art => ({
            ...art,
            isSummarizing: true
          }));

          setArticles(fetchedArticles);
          setIsLoading(false); // Stop main loading, start AI loading in cards

          // 2. Stream AI Summaries individually
          fetchedArticles.forEach(async (article, index) => {
            try {
              const summaryRes = await fetch('/api/summarize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  title: article.title,
                  description: article.summaryParents, // sending parent summary (original desc) as context
                  content: "" // We don't have full content, but title+desc is usually enough for this
                })
              });

              if (summaryRes.ok) {
                const summaryData = await summaryRes.json();
                setArticles(prev => {
                  const newArticles = [...prev];
                  if (newArticles[index]) {
                    newArticles[index] = {
                      ...newArticles[index],
                      summaryParents: summaryData.adult_summary || article.summaryParents,
                      summaryKidsEn: summaryData.kids_en,
                      isSummarizing: false
                    };
                  }
                  return newArticles;
                });
              } else {
                // If fail, just remove loading state
                setArticles(prev => {
                  const newArticles = [...prev];
                  if (newArticles[index]) newArticles[index].isSummarizing = false;
                  return newArticles;
                });
              }
            } catch (err) {
              console.error("Failed to summarize", err);
              setArticles(prev => {
                const newArticles = [...prev];
                if (newArticles[index]) newArticles[index].isSummarizing = false;
                return newArticles;
              });
            }
          });

        } catch (error) {
          console.error("Error fetching news:", error);
          setArticles([]);
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
        <InterestList onTagsChange={setSelectedTags} />
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
