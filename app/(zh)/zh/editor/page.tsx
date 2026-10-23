import { FocusEditorPage } from "@/components/focus-editor-page";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata("zhEditor");

export default function Page() {
  return <FocusEditorPage locale="zh" />;
}
