import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import { NextResponse } from 'next/server';

// Schema for the output validation
const summarySchema = z.object({
    adult_summary: z.string().describe("2 sentences of high-level context for parents."),
    kids_en: z.string().describe("Very simple words, exciting 'wow' facts, tone for Show and Tell. Max 100 words."),
    kids_zh: z.string().describe("HSK 1 level vocabulary suitable for Singapore preschool standards. Max 150 characters."),
});

export async function POST(req: Request) {
    try {
        const { title, description, content } = await req.json();

        // Combine available text for the model
        const fullText = `Title: ${title}\nDescription: ${description}\nContent: ${content || ''}`;

        const GOOGLE_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

        if (!GOOGLE_API_KEY) {
            return NextResponse.json(
                { error: "Missing Google API Key" },
                { status: 500 }
            );
        }

        const result = await generateObject({
            model: google('gemini-1.5-flash'),
            schema: summarySchema,
            prompt: fullText,
            system: `You are an expert preschool educator. Summarize the provided news article for two audiences:

      1. Adults: 2 sentences of high-level context.
      2. Kids (Age 4-6) in English: Use very simple words, exciting 'wow' facts, and a tone suitable for a 1-minute 'Show and Tell.' (Max 100 words).
      3. Kids (Age 4-6) in Simplified Chinese: Use HSK 1 level vocabulary suitable for Singapore preschool standards. (Max 150 characters).

      Safety: If the news is scary (accidents, crime, etc.), focus only on the helpful people involved (e.g., 'The brave doctors helped everyone') or skip the scary details.`,
        });

        return NextResponse.json(result.object);

    } catch (error) {
        console.error("AI Summarization Error:", error);
        return NextResponse.json(
            { error: "Failed to generate summary", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
