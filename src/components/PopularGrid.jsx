import BookCard from "@/components/BookCard";

export default function PopularGrid({ items }) {
  if (!items || items.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-6 text-muted">
        No popular books yet. Add a few reviews and they’ll show up here.
      </div>
    );
  }

  return (
    <section className="mt-8 min-w-full md:px-32">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg sm:text-xl font-semibold text-primary">
          Popular
        </h2>
        <p className="h-full text-xs sm:text-sm text-muted">
          Sorted by reviews, then titles
        </p>
      </div>

      <div className="mt-2 w-fit mx-auto">
        <div
        className="
          grid gap-4
          grid-cols-2
          sm:grid-cols-3
          md:grid-cols-4
          lg:grid-cols-5
        "
        >
          {items.map((b) => (
            <BookCard key={b.googleBooksId} book={b} />
          ))}
        </div>
      </div>
    </section>
  );
}
