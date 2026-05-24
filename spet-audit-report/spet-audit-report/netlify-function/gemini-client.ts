/**
 * SPET Online — Gemini AI Client Helper
 * File: src/lib/gemini-client.ts
 *
 * Drop-in replacement for any direct @google/genai calls in your React components.
 * Instead of calling the Gemini API directly (which requires the API key in the browser),
 * this calls your secure Netlify Function at /api/gemini.
 *
 * USAGE:
 *   import { askGemini, createGeminiChat } from '@/lib/gemini-client';
 *
 *   // Single question
 *   const answer = await askGemini('What laptops do you recommend under R15,000?');
 *
 *   // Multi-turn chat
 *   const chat = createGeminiChat();
 *   const reply1 = await chat.send('Show me gaming laptops');
 *   const reply2 = await chat.send('Which has the best battery life?');
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GeminiOptions {
  /** Override the default model */
  model?: string;
  /** Max tokens to generate (default: 1024) */
  maxTokens?: number;
  /** Override the system instruction */
  systemInstruction?: string;
}

export interface GeminiResult {
  text: string;
  model: string;
  tokenCount?: number;
}

interface ChatTurn {
  role: 'user' | 'model';
  text: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

// In development this hits localhost, in production it hits your Netlify Function
const GEMINI_ENDPOINT =
  import.meta.env.DEV
    ? 'http://localhost:8888/api/gemini'   // netlify dev local port
    : '/api/gemini';

// ─── Core fetch helper ────────────────────────────────────────────────────────

async function callGeminiFunction(
  prompt: string,
  options: GeminiOptions = {},
  history: ChatTurn[] = []
): Promise<GeminiResult> {
  const response = await fetch(GEMINI_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      history,
      model: options.model,
      maxTokens: options.maxTokens,
      systemInstruction: options.systemInstruction,
    }),
  });

  if (!response.ok) {
    let errorMessage = `Request failed: ${response.status}`;
    try {
      const err = await response.json();
      if (err.error) errorMessage = err.error;
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(errorMessage);
  }

  const data: GeminiResult = await response.json();
  return data;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Ask Gemini a single question with no conversation history.
 *
 * @example
 * const result = await askGemini('What are the best headphones under R2,000?');
 * console.log(result.text);
 */
export async function askGemini(
  prompt: string,
  options: GeminiOptions = {}
): Promise<GeminiResult> {
  return callGeminiFunction(prompt, options, []);
}

/**
 * Create a stateful chat session that maintains conversation history.
 * Each call to `send()` automatically includes all previous turns.
 *
 * @example
 * const chat = createGeminiChat({ systemInstruction: 'You are a product expert.' });
 * const r1 = await chat.send('Show me gaming laptops');
 * const r2 = await chat.send('Which one has the best GPU?');
 * chat.clearHistory(); // reset if needed
 */
export function createGeminiChat(options: GeminiOptions = {}) {
  const history: ChatTurn[] = [];

  return {
    /** Send a message and get a reply. History is maintained automatically. */
    async send(prompt: string): Promise<GeminiResult> {
      const result = await callGeminiFunction(prompt, options, [...history]);

      // Append this exchange to history for next turn
      history.push({ role: 'user', text: prompt });
      history.push({ role: 'model', text: result.text });

      return result;
    },

    /** Get a copy of the current conversation history */
    getHistory(): ChatTurn[] {
      return [...history];
    },

    /** Clear conversation history (start a new conversation) */
    clearHistory(): void {
      history.length = 0;
    },

    /** How many turns have happened so far */
    get turnCount(): number {
      return history.length / 2;
    },
  };
}

// ─── React hook ───────────────────────────────────────────────────────────────

import { useState, useCallback, useRef } from 'react';

export interface UseGeminiState {
  loading: boolean;
  error: string | null;
  result: GeminiResult | null;
}

/**
 * React hook for single-question Gemini interactions.
 *
 * @example
 * const { ask, loading, result, error } = useGemini();
 *
 * <button onClick={() => ask('Recommend a TV under R10,000')}>
 *   {loading ? 'Thinking...' : 'Ask AI'}
 * </button>
 * {result && <p>{result.text}</p>}
 */
export function useGemini(options: GeminiOptions = {}) {
  const [state, setState] = useState<UseGeminiState>({
    loading: false,
    error: null,
    result: null,
  });

  const ask = useCallback(
    async (prompt: string) => {
      setState({ loading: true, error: null, result: null });
      try {
        const result = await askGemini(prompt, options);
        setState({ loading: false, error: null, result });
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Something went wrong';
        setState({ loading: false, error: message, result: null });
        return null;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [options.model, options.maxTokens, options.systemInstruction]
  );

  return { ...state, ask };
}

/**
 * React hook for multi-turn Gemini chat sessions.
 *
 * @example
 * const { send, loading, error, history } = useGeminiChat();
 *
 * <input onKeyDown={e => e.key === 'Enter' && send(e.currentTarget.value)} />
 * {history.map((turn, i) => <div key={i}><b>{turn.role}:</b> {turn.text}</div>)}
 */
export function useGeminiChat(options: GeminiOptions = {}) {
  const chatRef = useRef(createGeminiChat(options));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ChatTurn[]>([]);

  const send = useCallback(async (prompt: string): Promise<GeminiResult | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await chatRef.current.send(prompt);
      setHistory(chatRef.current.getHistory());
      setLoading(false);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
      setLoading(false);
      return null;
    }
  }, []);

  const clearHistory = useCallback(() => {
    chatRef.current.clearHistory();
    setHistory([]);
    setError(null);
  }, []);

  return { send, loading, error, history, clearHistory };
}
