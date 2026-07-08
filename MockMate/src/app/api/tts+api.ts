/**
 * Text-to-Speech API route
 *
 * Converts text to speech using OpenAI-compatible endpoint
 */

import { createOpenAI } from "@ai-sdk/openai";
import { generateSpeech } from "ai";

// Create OpenAI-compatible client
// Fail closed on missing env (no implicit fallback to a private proxy).
const openaiBaseUrl = process.env.OPENAI_BASE_URL;
if (!openaiBaseUrl) {
	throw new Error("OPENAI_BASE_URL env var is required for the TTS route");
}
const openai = createOpenAI({
	apiKey: process.env.OPENAI_API_KEY,
	baseURL: openaiBaseUrl,
});

const ttsModel = process.env.OPENAI_TTS_MODEL || "google-tts/en";

export async function POST(req: Request) {
	try {
		const { text }: { text: string } = await req.json();

		if (!text) {
			return new Response(JSON.stringify({ error: "Text is required" }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}

		const result = await generateSpeech({
			model: openai.speech(ttsModel),
			text,
		});

		// Return audio as base64
		return new Response(
			JSON.stringify({
				audio: result.audio.base64,
				format: "mp3",
			}),
			{
				status: 200,
				headers: { "Content-Type": "application/json" },
			},
		);
	} catch (error) {
		console.error("TTS API error:", error);
		return new Response(
			JSON.stringify({ error: "Failed to generate speech" }),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			},
		);
	}
}
