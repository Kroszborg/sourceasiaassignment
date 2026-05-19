export default function OfflinePage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 items-center px-4 py-10 text-center">
      <div className="rounded-lg border bg-card p-8">
        <h1 className="text-2xl font-semibold">You are offline</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Search and booking actions need a network connection. Your last cached bookings may still be available from the My bookings page.
        </p>
      </div>
    </main>
  );
}
