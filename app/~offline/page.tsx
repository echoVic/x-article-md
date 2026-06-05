export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
      <div className="text-center px-6">
        <h1 className="text-2xl font-bold text-[var(--fg)]">You are offline</h1>
        <p className="mt-2 text-[var(--muted)]">
          Please check your network connection and try again.
        </p>
      </div>
    </div>
  );
}
