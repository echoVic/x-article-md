import Script from "next/script";

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

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${measurementId}');`}
      </Script>
    </>
  );
}
