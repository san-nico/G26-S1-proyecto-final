// src/components/ui/LoadingState.tsx
import Footer from "@/components/global/Footer";
import Navbar from "@/components/global/Navbar";

interface LoadingStateProps {
  title?: string;
  description?: string;
}

export default function LoadingState({
  title = "Consultando la CMF",
  description = "Buscando la información solicitada.",
}: LoadingStateProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-page">
      <Navbar />

      <main className="grid flex-1 place-items-center px-4 py-12">
        <div
          aria-live="polite"
          aria-busy="true"
          className="w-full max-w-md rounded-xl border border-line bg-panel p-6 text-center shadow-sm"
        >
          <span className="mx-auto block size-9 animate-spin rounded-full border-4 border-brand-100 border-t-brand-700" />
          <h1 className="mt-5 font-bold text-ink">{title}</h1>
          <p className="mt-1 text-sm text-muted">{description}</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
