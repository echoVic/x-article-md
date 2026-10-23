import { ComparePage } from "@/components/compare-page";
import { buildCompareMetadata } from "@/lib/compare-copy";

export const metadata = buildCompareMetadata("en");

export default function Page() {
  return <ComparePage locale="en" />;
}
