import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const interestsParam = searchParams.get('interests') || searchParams.get('q');
    const interests = interestsParam ? interestsParam.split(',').map(s => s.trim()).filter(Boolean) : [];

    const GNEWS_API_KEY = process.env.NEXT_PUBLIC_GNEWS_API_KEY;

    if (interests.length === 0) {
        return NextResponse.json({ articles: [] }); // No interests, no news
    }

    // Determine fetch configuration based on number of interests
    let fetchConfigs: { q: string, max: number }[] = [];

    if (interests.length === 1) {
        // Rule 1: 1 Interest -> 9 articles
        fetchConfigs.push({ q: interests[0], max: 9 });
    } else if (interests.length === 2) {
        // Rule 2: 2 Interests -> 5 for first, 4 for second
        fetchConfigs.push({ q: interests[0], max: 5 });
        fetchConfigs.push({ q: interests[1], max: 4 });
    } else {
        // Rule 3: 3 or more Interests -> 3 for each of the top 3
        const top3 = interests.slice(0, 3);
        top3.forEach(interest => {
            fetchConfigs.push({ q: interest, max: 3 });
        });
    }

    if (!GNEWS_API_KEY || GNEWS_API_KEY === 'REPLACE_WITH_YOUR_GNEWS_KEY') {
        // Mock data logic could go here, but for now return empty or simple mock
        return NextResponse.json({ articles: [] });
    }

    try {
        console.log(`Fetching news for configs:`, fetchConfigs);

        // Fetch all in parallel
        const results = await Promise.all(fetchConfigs.map(async (config) => {
            const gnewsUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(config.q)}&lang=en&max=${config.max}&apikey=${GNEWS_API_KEY}`;
            try {
                const res = await fetch(gnewsUrl);
                if (!res.ok) {
                    console.error(`GNews error for ${config.q}: ${res.status}`);
                    return [];
                }
                const data = await res.json();
                return data.articles || [];
            } catch (err) {
                console.error(`Fetch failed for ${config.q}:`, err);
                return [];
            }
        }));

        // Flatten results
        const allArticles = results.flat();

        // deduplicate by title just in case
        const uniqueArticles = Array.from(new Map(allArticles.map(item => [item.title, item])).values());

        const processedArticles = uniqueArticles.map((article: any) => ({
            title: article.title,
            url: article.url,
            image: article.image,
            source: article.source.name,
            date: article.publishedAt
        }));

        return NextResponse.json({ articles: processedArticles });

    } catch (error) {
        console.error('Failed to fetch/process news:', error);
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}
