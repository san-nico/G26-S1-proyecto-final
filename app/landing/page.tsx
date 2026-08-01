import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/global/Footer";
import Navbar from "@/components/global/Navbar";

export const metadata: Metadata = {
  title: "Inicio | CMF Bancos",
  description: "Consulta información bancaria publicada por la CMF Chile.",
};

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-page">
      <Navbar />

      <main className="flex-1">
        <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-brand-700">
              Datos oficiales de Chile
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-ink sm:text-5xl">
              Información bancaria clara y en un solo lugar
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-muted">
              Revisa balances y estados de resultados de las instituciones bancarias usando la información disponible en la API de la CMF.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/balances"
                className="rounded-lg bg-brand-700 px-5 py-3 font-semibold text-white hover:bg-brand-800"
              >
                Consultar balances
              </Link>
              <Link
                href="/resultados"
                className="rounded-lg border border-line bg-panel px-5 py-3 font-semibold text-slate-700 hover:bg-brand-50"
              >
                Ver resultados
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-panel p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold text-ink">¿Qué puedes consultar?</h2>
            <div className="mt-6 space-y-4">
              <article className="rounded-xl bg-brand-50 p-5">
                <p className="font-bold text-brand-900">Balances mensuales</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Activos, pasivos y otras cuentas informadas por cada banco.
                </p>
              </article>
              <article className="rounded-xl bg-slate-50 p-5">
                <p className="font-bold text-ink">Estados de resultados</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Ingresos, gastos y resultados del período seleccionado.
                </p>
              </article>
              <article className="rounded-xl border border-line p-5">
                <p className="font-bold text-ink">Búsqueda sencilla</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Encuentra una institución por su nombre o código CMF.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="border-y border-line bg-panel">
          <div className="mx-auto max-w-6xl px-4 py-10 text-center sm:px-6">
            <h2 className="text-2xl font-bold text-ink">Una herramienta simple para revisar datos públicos</h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted">
              Selecciona una sección, busca el banco y revisa la tabla del último período disponible.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
