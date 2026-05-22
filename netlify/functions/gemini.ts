/**
 * SPET Online — Gemini AI Netlify Function
 * File: netlify/functions/gemini.ts
 *
 * PURPOSE:
 *   Keeps the GEMINI_API_KEY on the server only.
 *   The React frontend never sees the key — it calls this function instead.
 *
 * SETUP STEPS:
 *   1. Copy this file to: netlify/functions/gemini.ts in your project root
 *   2. In Netlify dashboard → Site settings → Environment variables:
 *      Add: GEMINI_API_KEY = your-real-gemini-api-key
 *      (Do NOT use the VITE_ prefix — that would expose it to the browser)
 *   3. In vite.config.ts, REMOVE the define block:
 *      define: { 'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY) }
 *   4. Deploy — the function runs at: /.netlify/functions/gemini
 *
 * USAGE FROM THE FRONTEND (React):
 *   See: netlify-function/gemini-client.ts for the ready-made client helper
 */

import type { Config, Context } from '@netlify/functions';
import { GoogleGenAI } from '@google/genai';

// ─── Types ────────────────────────────────────────────────────────────────────

interface GeminiRequest {
  /** The user's prompt / question */
  prompt: string;
  /** Optional: override the model (default: gemini-2.0-flash) */
  model?: string;
  /** Optional: max tokens to generate (default: 1024) */
  maxTokens?: number;
  /** Optional: system instruction to set the AI's behaviour */
  systemInstruction?: string;
  /** Optional: conversation history for multi-turn chat */
  history?: Array<{ role: 'user' | 'model'; text: string }>;
}

interface GeminiResponse {
  text: string;
  model: string;
  tokenCount?: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_MODEL = 'gemini-2.0-flash';
const DEFAULT_MAX_TOKENS = 1024;
const MAX_PROMPT_LENGTH = 4000; // prevent abuse / runaway costs

// Default system instruction for SPET Online — customise as needed
const DEFAULT_SYSTEM_INSTRUCTION = `You are a helpful assistant for SPET Online, a premium electronics store. 
Help customers find products, answer questions about specifications, compare items, and assist with their shopping experience.
Be concise, friendly, and accurate. If you don't know something specific about SPET Online's inventory, say so honestly.`;

// Allowed origins — add your custom domain here when you get one
const ALLOWED_ORIGINS = [
  'https://spetonline.netlify.app',
  'http://localhost:3000',
  'http://localhost:5173',
];

// ─── CORS helper ──────────────────────────────────────────────────────────────

function getCorsHeaders(requestOrigin: string | null): Record<string, string> {
  const origin =
    requestOrigin && ALLOWED_ORIGINS.includes(requestOrigin)
      ? requestOrigin
      : ALLOWED_ORIGINS[0];

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export default async function handler(req: Request, context: Context) {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Only accept POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed. Use POST.' }),
      { status: 405, headers: corsHeaders }
    );
  }

  // Confirm the API key exists server-side (never sent to the client)
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('[gemini] GEMINI_API_KEY environment variable is not set.');
    return new Response(
      JSON.stringify({ error: 'AI service is not configured. Contact support.' }),
      { status: 503, headers: corsHeaders }
    );
  }

  // Parse and validate the request body
  let body: GeminiRequest;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON in request body.' }),
      { status: 400, headers: corsHeaders }
    );
  }

  const { prompt, model, maxTokens, systemInstruction, history } = body;

  if (!prompt || typeof prompt !== 'string') {
    return new Response(
      JSON.stringify({ error: 'Missing required field: prompt (string).' }),
      { status: 400, headers: corsHeaders }
    );
  }

  if (prompt.trim().length === 0) {
    return new Response(
      JSON.stringify({ error: 'Prompt cannot be empty.' }),
      { status: 400, headers: corsHeaders }
    );
  }

  if (prompt.length > MAX_PROMPT_LENGTH) {
    return new Response(
      JSON.stringify({ error: `Prompt too long. Maximum ${MAX_PROMPT_LENGTH} characters.` }),
      { status: 400, headers: corsHeaders }
    );
  }

  const selectedModel = model ?? DEFAULT_MODEL;
  const selectedMaxTokens = typeof maxTokens === 'number' ? maxTokens : DEFAULT_MAX_TOKENS;
  const selectedSystem = systemInstruction ?? DEFAULT_SYSTEM_INSTRUCTION;

  // ─── Call Gemini ────────────────────────────────────────────────────────────

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Build message history for multi-turn conversations
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    if (history && Array.isArray(history)) {
      for (const turn of history) {
        if (turn.role && turn.text) {
          contents.push({
            role: turn.role,
            parts: [{ text: turn.text }],
          });
        }
      }
    }

    // Add the current user message
    contents.push({
      role: 'user',
      parts: [{ text: prompt }],
    });

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents,
      config: {
        maxOutputTokens: selectedMaxTokens,
        systemInstruction: selectedSystem,
      },
    });

    const text = response.text ?? '';
    const tokenCount = response.usageMetadata?.totalTokenCount;

    const result: GeminiResponse = {
      text,
      model: selectedModel,
      ...(tokenCount !== undefined && { tokenCount }),
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: corsHeaders,
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[gemini] API call failed:', message);

    // Don't leak internal error details to the client
    return new Response(
      JSON.stringify({ error: 'AI request failed. Please try again.' }),
      { status: 502, headers: corsHeaders }
    );
  }
}

// Tell Netlify this is an edge-compatible function
export const config: Config = {
  path: '/api/gemini',
};
