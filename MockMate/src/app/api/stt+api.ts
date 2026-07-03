/**
 * Speech-to-Text API route
 * 
 * Transcribes audio to text using OpenAI-compatible endpoint
 */

import { transcribe } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

// Create OpenAI-compatible client
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://9router.chickenkiller.com/v1',
});

const sttModel = process.env.OPENAI_STT_MODEL || 'gemini/gemini-2.5-pro';

export async function POST(req: Request) {
  try {
    const { audio }: { audio: string } = await req.json();

    if (!audio) {
      return new Response(JSON.stringify({ error: 'Audio data is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Audio can be base64 string, Uint8Array, or Buffer
    // If it's base64, convert it to Uint8Array
    const audioData = audio.startsWith('data:') 
      ? Buffer.from(audio.split(',')[1], 'base64')
      : Buffer.from(audio, 'base64');

    const result = await transcribe({
      model: openai.transcription(sttModel),
      audio: audioData,
    });

    return new Response(JSON.stringify({ 
      text: result.text,
      language: result.language,
      durationInSeconds: result.durationInSeconds,
      segments: result.segments,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('STT API error:', error);
    return new Response(JSON.stringify({ error: 'Failed to transcribe audio' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
