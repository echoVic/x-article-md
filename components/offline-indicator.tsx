"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getSnapshot() {
  return !navigator.onLine;
}

function getServerSnapshot() {
  return false;
}

export function OfflineIndicator() {
  const isOffline = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!isOffline) return null;

  const isZh = typeof document !== "undefined" && document.documentElement.lang === "zh";

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-[var(--radius)] bg-[var(--warning)] text-white text-xs font-medium shadow-md">
      {isZh
        ? "当前离线 — AI 功能不可用"
        : "You are offline — AI features are unavailable."}
    </div>
  );
}
