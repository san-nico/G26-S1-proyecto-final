export default function Loading() {
  return (
    <div className="page-shell">
      <main className="container-main flex items-center justify-center">
        <div
          role="status"
          aria-label="Cargando"
          className="size-10 animate-spin rounded-full border-4 border-brand-100 border-t-brand-700"
        />
      </main>
    </div>
  );
}
