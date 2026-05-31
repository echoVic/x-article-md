import EditorPage from "@/components/editor-page";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata("editor");

export default function Page() {
  return <EditorPage />;
}
