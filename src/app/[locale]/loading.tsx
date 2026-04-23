export default function HomeLoading() {
  return (
    <div className="animate-pulse">
      {/* Hero skeleton */}
      <div className="relative mb-10 rounded-2xl overflow-hidden bg-muted/30 border border-border/50 px-6 py-12 flex flex-col items-center gap-4">
        <div className="h-5 w-40 bg-muted rounded-full" />
        <div className="h-10 w-72 bg-muted rounded-lg" />
        <div className="h-5 w-96 bg-muted rounded-lg" />
        <div className="flex gap-3">
          <div className="h-10 w-28 bg-muted rounded-lg" />
          <div className="h-10 w-36 bg-muted rounded-lg" />
        </div>
      </div>

      {/* Category filter skeleton */}
      <div className="flex gap-2 overflow-hidden mb-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-8 w-24 bg-muted rounded-full shrink-0" />
        ))}
      </div>

      {/* Prompt cards skeleton */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mt-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border/50 bg-muted/20 p-5 flex flex-col gap-3">
            <div className="h-5 w-3/4 bg-muted rounded" />
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-4 w-2/3 bg-muted rounded" />
            <div className="flex gap-2 mt-2">
              <div className="h-6 w-16 bg-muted rounded-full" />
              <div className="h-6 w-16 bg-muted rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
