import { EditorPageWrapper } from "@/components/editor-page-wrapper";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata("zhEditor");

export default function Page() {
  return <EditorPageWrapper locale="zh" />;
}
