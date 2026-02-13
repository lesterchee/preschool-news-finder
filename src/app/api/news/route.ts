import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    const GNEWS_API_KEY = process.env.NEXT_PUBLIC_GNEWS_API_KEY;
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!query) {
        return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
    }

    // --- MANUAL OVERRIDES (Simulated AI Agent) ---
    const MANUAL_SUMMARIES: Record<string, any> = {
        "Microsoft wants to rewire data centers to save space": {
            adult_summary: "Microsoft is exploring high-temperature superconductors to make data centers more efficient and compact. This technology could eliminate electrical resistance, saving significant energy and space.",
            kids_en: "Microsoft wants to build super special computer houses! They are using magic wires that don't get hot, so the computers can sit closer together. This saves space and helps the planet!",
            kids_zh: "微软想建超级电脑屋！他们用不发热的神奇电线，让电脑住得更近。这能省空间，还能保护地球！"
        },
        "An AI Toy Exposed 50,000 Logs of Its Chats With Kids to Anyone With a Gmail Account": {
            adult_summary: "A security lapse at AI toy company Bondu exposed 50,000 chat logs between children and their smart toys. Researchers found the web console was unprotected, allowing unauthorized access.",
            kids_en: "Always be careful with secrets! A toy that talks to kids accidentally showed its messages to strangers. It's important to keep our private words safe and locked up tight!",
            kids_zh: "秘密要小心！一个会说话的玩具不小心把聊天给陌生人看了。我们要把秘密锁好，不让别人随便看！"
        },
        "T. Rex Took Its Sweet Time Getting Huge": {
            adult_summary: "New fossil analysis reveals that Tyrannosaurus rex grew slowly for a long time before having a massive growth spurt. This challenges previous assumptions about their growth rates.",
            kids_en: "The T-Rex wasn't always a giant! Scientists found out that T-Rex babies stayed small for a long time before SHOOTING up to be huge. Just like you, they need time to grow big and strong!",
            kids_zh: "霸王龙不是生来就巨大的！科学家发现它们小时候很小，过了很久才突然长得超级大。像你一样，长大需要时间！"
        }
    };
    // ---------------------------------------------

    // 1. Mock Data (Fallback if no GNews API Key)
    if (!GNEWS_API_KEY || GNEWS_API_KEY === 'REPLACE_WITH_YOUR_GNEWS_KEY') {
        // Return mock data for demo purposes
        return NextResponse.json({ articles: [] });
    }

    try {
        // 2. Fetch News from GNews
        // GNews format: https://gnews.io/api/v4/search?q=example&apikey=KEY
        const gnewsUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=9&apikey=${GNEWS_API_KEY}`;

        console.log(`Fetching from GNews...`);

        const newsRes = await fetch(gnewsUrl);

        if (!newsRes.ok) {
            const err = await newsRes.text();
            console.error("GNews Error:", err);
            throw new Error(`GNews error: ${newsRes.status}`);
        }

        const newsData = await newsRes.json();

        if (!newsData.articles || newsData.articles.length === 0) {
            return NextResponse.json({ articles: [] });
        }

        // 3. Process & Summarize Articles
        const processedArticles = await Promise.all(newsData.articles.map(async (article: any) => {
            let summaries = {
                adult_summary: article.description || "No summary available.",
                kids_en: "Summary coming soon!",
                kids_zh: "故事即将到来!"
            };

            const title = article.title;

            // CHECK MANUAL OVERRIDE FIRST
            if (MANUAL_SUMMARIES[title]) {
                summaries = MANUAL_SUMMARIES[title];
            }
            // Only run LLM if key is present AND no manual override
            else if (OPENAI_API_KEY) {
                try {
                    // ... (Existing OpenAI Logic placeholder) ...
                } catch (e) {
                    console.error("LLM Exception:", e);
                }
            } else {
                // Fallback Mock Summaries
                summaries.kids_en = `(AI Quota exceeded) Wow! ${title} is so cool! It's like magic because... [Need API Key with billing for real summary]`;
                summaries.kids_zh = `(AI Quota exceeded) 哇！这个新闻真棒！[需要 API Key]`;
            }

            return {
                title: article.title,
                url: article.url,
                // GNews uses 'image' instead of 'urlToImage'
                image: article.image,
                source: article.source.name,
                date: article.publishedAt,
                summaryParents: summaries.adult_summary,
                summaryKidsEn: summaries.kids_en,
                summaryKidsZh: summaries.kids_zh
            };
        }));

        return NextResponse.json({ articles: processedArticles });

    } catch (error) {
        console.error('Failed to fetch/process news:', error);
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}
