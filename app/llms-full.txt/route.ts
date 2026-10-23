import {
  buildLlmsFullTxt,
  LLMS_TXT_CONTENT_TYPE,
} from "@/lib/llms-txt";

export const dynamic = "force-static";

export function GET() {
  return new Response(buildLlmsFullTxt(), {
    headers: { "Content-Type": LLMS_TXT_CONTENT_TYPE },
  });
}
