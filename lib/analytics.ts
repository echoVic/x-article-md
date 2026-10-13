import { track } from "@vercel/analytics";

type EventName =
  | "polish"
  | "translate"
  | "copy_body"
  | "copy_title"
  | "copy_tweet"
  | "copy_all_tweets"
  | "thread_split"
  | "cover_generate"
  | "cover_download"
  | "cover_copy"
  | "asset_copy"
  | "asset_download"
  | "asset_zip_download"
  | "export_markdown"
  | "import_markdown"
  | "preflight_run"
  | "template_select";

export type EventProps = Record<string, string | number | boolean>;

type Gtag = (command: "event", name: string, params?: EventProps) => void;

/**
 * Sends a product event to both Vercel Web Analytics and GA4.
 *
 * Vercel custom events are only recorded on Pro/Enterprise plans, so GA4 is
 * the source of truth on the Hobby plan. Each sink is isolated: a failure in
 * one must never block the other or the user's action.
 */
export function trackEvent(name: EventName, props?: EventProps) {
  try {
    track(name, props);
  } catch {
    // analytics must never break the UI
  }

  if (typeof window === "undefined") {
    return;
  }

  const gtag = (window as unknown as { gtag?: Gtag }).gtag;
  if (typeof gtag !== "function") {
    return;
  }

  try {
    gtag("event", name, props);
  } catch {
    // ignore
  }
}
