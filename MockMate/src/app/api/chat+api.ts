/**
 * AI Chat API route
 *
 * Handles streaming chat responses using OpenAI-compatible endpoint
 */

import { createOpenAI } from "@ai-sdk/openai";
import {
	convertToModelMessages,
	createUIMessageStreamResponse,
	streamText,
	toUIMessageStream,
	type UIMessage,
} from "ai";

// Create OpenAI-compatible client
const openai = createOpenAI({
	apiKey: process.env.OPENAI_API_KEY,
	baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
});

const model = process.env.OPENAI_MODEL || "gpt-4o";

export async function POST(req: Request) {
	try {
		const { messages }: { messages: UIMessage[] } = await req.json();

		const result = streamText({
			model: openai(model),
			messages: await convertToModelMessages(messages),
			system:
				"You are a helpful AI interview coach. Provide constructive feedback and guidance to help users improve their interview skills.",
		});

		return createUIMessageStreamResponse({
			stream: toUIMessageStream({ stream: result.stream }),
			headers: {
				"Content-Type": "application/octet-stream",
				"Content-Encoding": "none",
			},
		});
	} catch (error) {
		console.error("AI Chat API error:", error);
		return new Response(
			JSON.stringify({ error: "Failed to process chat request" }),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			},
		);
	}
}
