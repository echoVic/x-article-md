import { ThreadPageWrapper } from "@/components/thread-page-wrapper";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata("thread");

export default function Page() {
  return <ThreadPageWrapper locale="en" />;
}
