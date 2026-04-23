export default function PromptDetailLoading() {
  return (
    <div className="max-w-3xl mx-auto animate-pulse">
      {/* Back button skeleton */}
      <div className="h-4 w-12 bg-muted rounded mb-6" />

      <div className="space-y-6">
        {/* Title & badge */}
        <div>
          <div className="flex items-start justify-between gap-4 flex-wrap mb-2">
            <div className="h-8 w-2/3 bg-muted rounded" />
            <div className="h-6 w-20 bg-muted rounded-full" />
          </div>
          <div className="h-4 w-full bg-muted rounded mt-2" />
          <div className="h-4 w-3/4 bg-muted rounded mt-2" />

          {/* Author row */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 bg-muted rounded-full" />
              <div className="h-4 w-24 bg-muted rounded" />
            </div>
            <div className="flex gap-2">
              <div className="h-6 w-12 bg-muted rounded-full" />
              <div className="h-6 w-12 bg-muted rounded-full" />
            </div>
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* Prompt content skeleton */}
        <div className="bg-muted/40 rounded-lg p-4 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`h-3 bg-muted rounded ${i % 3 === 2 ? 'w-2/3' : 'w-full'}`} />
          ))}
        </div>

        <div className="h-px bg-border" />

        {/* Output skeleton */}
        <div className="space-y-2">
          <div className="h-5 w-32 bg-muted rounded" />
          <div className="h-20 w-full bg-muted/40 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
