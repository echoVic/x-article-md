"use client";

export default function OfflinePage() {
  const isZh =
    typeof document !== "undefined" &&
    document.documentElement.lang === "zh";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
      <div className="text-center px-6">
        <h1 className="text-2xl font-bold text-[var(--fg)]">
          {isZh ? "您当前处于离线状态" : "You are offline"}
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          {isZh
            ? "请检查网络连接后重试。"
            : "Please check your network connection and try again."}
        </p>
      </div>
    </div>
  );
}
