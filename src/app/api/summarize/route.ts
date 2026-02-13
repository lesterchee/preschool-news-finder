import { google } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { NextResponse } from 'next/server';

// Create an OpenAI provider instance that points to the local Ollama server
const ollama = createOpenAI({
    baseURL: 'http://localhost:11434/v1',
    apiKey: 'ollama', // arbitrary key
});

// Schema for the output validation
const summarySchema = z.object({
    adult_summary: z.string().describe("2 sentences of high-level context for parents."),
    kids_en: z.string().describe("Very simple words, exciting 'wow' facts, tone for Show and Tell. Max 100 words."),
});

export async function POST(req: Request) {
    try {
        const { title, description, content } = await req.json();

        // Combine available text for the model
        const fullText = `Title: ${title}\nDescription: ${description}\nContent: ${content || ''}`;

        const GOOGLE_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        const systemPrompt = `You are an expert preschool educator. Summarize the provided news article for two audiences:

      1. Adults: 2 sentences of high-level context.
      2. Kids (Age 4-6) in English: Use very simple words, exciting 'wow' facts, and a tone suitable for a 1-minute 'Show and Tell.' (Max 100 words).

      Safety: If the news is scary (accidents, crime, etc.), focus only on the helpful people involved (e.g., 'The brave doctors helped everyone') or skip the scary details.`;

        let result;

        // Try Google Gemini first if key exists
        if (GOOGLE_API_KEY) {
            try {
                result = await generateObject({
                    model: google('gemini-1.5-flash'),
                    schema: summarySchema,
                    prompt: fullText,
                    system: systemPrompt,
                });
                return NextResponse.json(result.object);
            } catch (googleError: any) {
                console.warn("Google API failed, attempting local Ollama fallback:", googleError.message);
                // Fallthrough to Ollama
            }
        }

        // Fallback to Local Ollama (llama3.2)
        try {
            console.log("Attempting local Ollama generation...");
            result = await generateObject({
                model: ollama('llama3.2'),
                schema: summarySchema,
                prompt: fullText,
                system: systemPrompt,
            });
            return NextResponse.json(result.object);
        } catch (ollamaError: any) {
            console.error("Ollama API also failed:", ollamaError.message);
            // Re-throw the original Google error if it existed, or the Ollama error
            throw new Error(`All AI providers failed. Google: ${GOOGLE_API_KEY ? 'Quota/Error' : 'Missing Key'}, Ollama: ${ollamaError.message}`);
        }

    } catch (error) {
        console.error("AI Summarization Error:", error);
        return NextResponse.json(
            { error: "Failed to generate summary", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
