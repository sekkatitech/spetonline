// Feedback and newsletter: shared wording, the open/closed state of the side panels, and the
// calls to /api/feedback and /api/newsletter (netlify/functions/feedback.mjs, newsletter.mjs).
import { create } from 'zustand';

// Stored with every sign-up as proof of consent; the server keeps its own identical copy.
export const NEWSLETTER_CONSENT_TEXT =
  'I agree to receive email newsletters and promotional offers from SPET Online. I can unsubscribe at any time.';

export const FEEDBACK_REASONS = [
  { value: 'browsing', label: 'Browsing' },
  { value: 'buying', label: 'Buying' },
  { value: 'comparing_prices', label: 'Comparing prices' },
  { value: 'testing', label: 'Testing the website' },
] as const;

export const FEEDBACK_EASE = [
  { value: 1, label: 'Very easy' },
  { value: 2, label: 'Easy' },
  { value: 3, label: 'Okay' },
  { value: 4, label: 'Difficult' },
  { value: 5, label: 'Very difficult' },
] as const;

export const FEEDBACK_TOPICS = [
  { value: 'suggestion', label: 'Suggestion' },
  { value: 'technical_problem', label: 'Technical problem' },
  { value: 'product_request', label: 'Product request' },
  { value: 'other', label: 'Other' },
] as const;

export type FeedbackReason = (typeof FEEDBACK_REASONS)[number]['value'];
export type FeedbackTopic = (typeof FEEDBACK_TOPICS)[number]['value'];
export type NewsletterSource = 'footer_band' | 'side_panel' | 'tester_page';
export type EngagementPanel = 'feedback' | 'newsletter' | null;

interface EngagementState {
  open: EngagementPanel;
  setOpen: (panel: EngagementPanel) => void;
  toggle: (panel: Exclude<EngagementPanel, null>) => void;
}

export const useEngagement = create<EngagementState>((set) => ({
  open: null,
  setOpen: (open) => set({ open }),
  toggle: (panel) => set((state) => ({ open: state.open === panel ? null : panel })),
}));

function deviceType(): 'mobile' | 'tablet' | 'desktop' {
  const ua = navigator.userAgent;
  if (/ipad|tablet|kindle|silk/i.test(ua) || (/android/i.test(ua) && !/mobile/i.test(ua))) return 'tablet';
  if (/mobi|iphone|ipod|android/i.test(ua)) return 'mobile';
  return 'desktop';
}

async function post(url: string, body: unknown): Promise<{ ok: boolean; error: string }> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) return { ok: true, error: '' };
    if (res.status === 429) return { ok: false, error: 'Too many tries. Please wait a minute and try again.' };
    const data = await res.json().catch(() => null);
    return { ok: false, error: data?.error || 'Something went wrong. Please try again.' };
  } catch {
    return { ok: false, error: 'You seem to be offline. Please check your connection and try again.' };
  }
}

export interface FeedbackInput {
  reason: FeedbackReason | null;
  ease: number | null;
  topic: FeedbackTopic;
  message: string;
  email: string;
  source: 'widget' | 'tester_page';
  /** Hidden honeypot field; people leave it empty. */
  website: string;
  openedAt: number;
}

export function sendFeedback(input: FeedbackInput) {
  return post('/api/feedback', {
    reason: input.reason,
    ease: input.ease,
    topic: input.topic,
    message: input.message,
    email: input.email,
    source: input.source,
    website: input.website,
    elapsedMs: Date.now() - input.openedAt,
    // Only the path: query strings can carry order numbers or search terms.
    pagePath: window.location.pathname,
    device: deviceType(),
  });
}

export function subscribeNewsletter(input: {
  email: string;
  consent: boolean;
  source: NewsletterSource;
  website: string;
  openedAt: number;
}) {
  return post('/api/newsletter', {
    email: input.email,
    consent: input.consent,
    source: input.source,
    website: input.website,
    elapsedMs: Date.now() - input.openedAt,
    pagePath: window.location.pathname,
  });
}

export function confirmNewsletter(token: string) {
  return post('/api/newsletter/confirm', { token });
}

export function unsubscribeNewsletter(token: string) {
  return post('/api/newsletter/unsubscribe', { token });
}
