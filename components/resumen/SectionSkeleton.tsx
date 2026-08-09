export default function SectionSkeleton({ title }: { title: string }) {
  return (
    <section
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="card flex flex-col gap-4 p-5 sm:p-6"
    >
      <h2 className="border-b border-line pb-2 text-xs font-bold uppercase tracking-wider text-muted">
        {title}
      </h2>
      <div className="flex items-center justify-center gap-3 py-10 text-sm text-muted">
        <span className="size-5 animate-spin rounded-full border-2 border-brand-100 border-t-brand-700" />
        Cargando {title.toLowerCase()}…
      </div>
    </section>
  );
}
