/**
 * Text-to-Speech API route
 * 
 * Converts text to speech using OpenAI-compatible endpoint
 */

import { generateSpeech } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

// Create OpenAI-compatible client
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://9router.chickenkiller.com/v1',
});

const ttsModel = process.env.OPENAI_TTS_MODEL || 'google-tts/en';

export async function POST(req: Request) {
  try {
    const { text }: { text: string } = await req.json();

    if (!text) {
      return new Response(JSON.stringify({ error: 'Text is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = await generateSpeech({
      model: openai.speech(ttsModel),
      text,
    });

    // Return audio as base64
    return new Response(JSON.stringify({ 
      audio: result.audio.base64,
      format: 'mp3',
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('TTS API error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate speech' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
