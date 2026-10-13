export default function Loading() {
  return (
    <div role="status" aria-label="Loading page">
      <section className="bg-dark text-light">
        <div className="wrap py-20 sm:py-28">
          <div className="skeleton h-3 w-32 rounded-tag" />
          <div className="skeleton mt-5 h-10 w-full max-w-xl rounded-tag sm:h-14" />
          <div className="skeleton mt-6 h-4 w-full max-w-lg rounded-tag" />
          <div className="skeleton mt-3 h-4 w-2/3 max-w-md rounded-tag" />
        </div>
      </section>
      <section className="wrap grid gap-6 py-14 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i}>
            <div className="skeleton aspect-[4/3] rounded-card" />
            <div className="skeleton mt-4 h-5 w-3/4 rounded-tag" />
            <div className="skeleton mt-3 h-4 w-1/2 rounded-tag" />
          </div>
        ))}
      </section>
    </div>
  );
}
