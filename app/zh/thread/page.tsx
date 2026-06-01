import { ThreadPageWrapper } from "@/components/thread-page-wrapper";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata("zhThread");

export default function Page() {
  return <ThreadPageWrapper locale="zh" />;
}
