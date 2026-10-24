function getMeasurementId() {
  return process.env.NEXT_PUBLIC_GA_ID?.trim();
}

export function GoogleAnalytics() {
  if (process.env.NODE_ENV !== "production") {
    return null;
  }

  const measurementId = getMeasurementId();

  if (!measurementId) {
    return null;
  }

  // Plain async snippet instead of next/script afterInteractive: keeps gtag
  // loading + the first-screen pageview, but avoids Next injecting a
  // high-priority `<link rel=preload as=script>` that competes with the LCP
  // critical path on slow networks. async = non-blocking, pageview still fires.
  return (
    <>
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} />
      <script
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${measurementId}');`,
        }}
      />
    </>
  );
}
