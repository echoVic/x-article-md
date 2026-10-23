import { FocusEditorPage } from "@/components/focus-editor-page";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata("editor");

export default function Page() {
  return <FocusEditorPage locale="en" />;
}
