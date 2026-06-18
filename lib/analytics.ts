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
  | "export_markdown"
  | "import_markdown"
  | "preflight_run"
  | "template_select";

export function trackEvent(name: EventName, props?: Record<string, string | number | boolean>) {
  track(name, props);
}
