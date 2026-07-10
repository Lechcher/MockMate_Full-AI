// Polyfills for React Native runtime gaps (structuredClone, TextEncoderStream/TextDecoderStream)

// structuredClone polyfill
if (typeof globalThis.structuredClone !== 'function') {
	const { structuredClone } = require('@ungap/structured-clone');
	globalThis.structuredClone = structuredClone;
}

// TextEncoderStream / TextDecoderStream polyfill
if (typeof globalThis.TextEncoderStream === 'undefined') {
	const { TextEncoderStream, TextDecoderStream } = require('@stardazed/streams-text-encoding');
	globalThis.TextEncoderStream = TextEncoderStream;
	globalThis.TextDecoderStream = TextDecoderStream;
}

export {};
