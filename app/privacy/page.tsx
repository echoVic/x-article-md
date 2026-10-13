import { LandingFooter } from "@/components/landing-footer";
import { LandingHeader } from "@/components/landing-header";
import { buildPageMetadata, githubRepoUrl } from "@/lib/seo";
import Link from "next/link";

export const metadata = buildPageMetadata("privacy");

const lastUpdated = "2026-10-13";

export default function PrivacyPage() {
  return (
    <div className="landing">
      <LandingHeader />
      <main>
        <article className="section">
          <div className="container blog-prose">
            <div className="blog-post-header">
              <Link href="/" className="blog-back">
                ← MD2X
              </Link>
              <span>
                Last updated <time dateTime={lastUpdated}>October 13, 2026</time>
              </span>
            </div>

            <h1>Privacy Policy</h1>
            <p>
              MD2X (markdown2x.com) is a free, browser-based tool for turning
              Markdown into rich text and images for X Articles. It has no
              accounts and no sign-up. This page explains what data the site
              handles and where it goes.
            </p>

            <h2>What stays in your browser</h2>
            <ul>
              <li>
                Your Markdown drafts, rendered previews, and generated code,
                table, and Mermaid images are created locally in your browser.
              </li>
              <li>
                Your draft, language preference, and cover-image settings
                (including any API key you enter) are saved in your
                browser&apos;s local storage. They are never sent to MD2X
                servers, and you can clear them at any time by clearing site
                data in your browser.
              </li>
            </ul>

            <h2>What is sent to a server</h2>
            <ul>
              <li>
                <strong>AI polish, translate, and thread split.</strong> When
                you use these features, the selected text is sent to MD2X&apos;s
                API route and forwarded to an AI model provider (DeepSeek by
                default, or the endpoint you configure) to produce the result.
                MD2X does not store this text.
              </li>
              <li>
                <strong>AI cover images.</strong> Cover generation is sent
                directly from your browser to the image API endpoint you
                configure, using your own API key. MD2X servers are not
                involved.
              </li>
              <li>
                <strong>Rate limiting.</strong> To prevent abuse of the AI
                routes, your IP address is used as a short-lived rate-limit
                key (Upstash Redis).
              </li>
            </ul>

            <h2>Analytics</h2>
            <p>
              We use Google Analytics 4, Vercel Web Analytics, and Vercel
              Speed Insights to understand page views, performance, and which
              features are used (for example, &quot;copy body&quot; or
              &quot;copy code image&quot;). These events never include the
              contents of your drafts. Google Analytics may set cookies; you
              can opt out with the{" "}
              <a
                href="https://tools.google.com/dlpage/gaoptout"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Analytics opt-out add-on
              </a>{" "}
              or by blocking cookies for this site.
            </p>

            <h2>Google Search Console</h2>
            <p>
              The site owner uses read-only access to Google Search Console to
              review search performance for markdown2x.com. This does not
              involve any data from visitors beyond what Google Search
              already reports in aggregate.
            </p>

            <h2>Third parties</h2>
            <p>
              The site is hosted on Vercel. Data processed by third-party
              services (Vercel, Google, Upstash, and your chosen AI provider)
              is subject to their own privacy policies. We do not sell or
              share personal data for advertising.
            </p>

            <h2>Changes and contact</h2>
            <p>
              If this policy changes, the date at the top of this page will be
              updated. Questions or requests:{" "}
              <a
                href={`${githubRepoUrl}/issues`}
                target="_blank"
                rel="noopener noreferrer"
              >
                open an issue on GitHub
              </a>
              .
            </p>
          </div>
        </article>
      </main>
      <LandingFooter />
    </div>
  );
}
