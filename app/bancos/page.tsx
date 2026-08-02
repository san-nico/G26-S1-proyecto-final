import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/global/Footer";
import Navbar from "@/components/global/Navbar";

export const metadata: Metadata = {
  title: "Instituciones bancarias | CMF Chile",
  description:
    "Consulta el listado de instituciones bancarias registradas en la CMF.",
};

// ==========================================
// 1. TIPOS Y HELPERS
// ==========================================

type Bank = {
  CodigoInstitucion: string;
  NombreInstitucion: string;
};

function formatPeriod(year?: string, month?: string): string {
  const now = new Date();
  const y = parseInt(year || now.getFullYear().toString(), 10);
  const m = parseInt(month || (now.getMonth() + 1).toString(), 10) - 1;

  const date = new Date(y, m, 1);
  const monthName = new Intl.DateTimeFormat("es-CL", { month: "long" }).format(
    date,
  );
  const capitalizedMonth =
    monthName.charAt(0).toUpperCase() + monthName.slice(1);

  return `${capitalizedMonth} de ${y}`;
}

function parseBanks(data: any): Bank[] {
  const raw = data?.DescripcionesCodigosDeInstituciones;
  if (!raw) return [];
  const list = Array.isArray(raw) ? raw : [raw];

  return list.flatMap((b) => {
    const code = b?.CodigoInstitucion?.toString().trim() || "";
    const name = b?.NombreInstitucion?.toString().trim() || "";
    return code && name
      ? [{ CodigoInstitucion: code, NombreInstitucion: name }]
      : [];
  });
}

async function getBanks(year?: string, month?: string): Promise<Bank[]> {
  const apiKey = process.env.CMF_API_KEY;

  if (!apiKey) {
    throw new Error(
      "La clave de la API (CMF_API_KEY) no está configurada en .env.local.",
    );
  }

  const now = new Date();
  const selectedYear = year || now.getFullYear().toString();
  const selectedMonth = (month || (now.getMonth() + 1).toString()).padStart(
    2,
    "0",
  );

  const url = `https://api.cmfchile.cl/api-sbifv3/recursos_api/balances/${selectedYear}/${selectedMonth}/instituciones?apikey=${apiKey}&formato=json`;

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(
      `No se pudo obtener la información de la CMF para ${selectedMonth}/${selectedYear}.`,
    );
  }

  const data = await res.json();
  return parseBanks(data);
}

// ==========================================
// 2. SUBCOMPONENTES
// ==========================================

function BankHeader({ year, month }: { year?: string; month?: string }) {
  const periodText = formatPeriod(year, month);

  return (
    <section className="max-w-3xl">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm font-bold uppercase tracking-widest text-brand-700">
          Datos oficiales CMF Chile
        </p>
        <span className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800 ring-1 ring-inset ring-brand-600/20">
          Periodo: {periodText}
        </span>
      </div>

      <h1 className="mt-3 text-4xl font-bold tracking-tight text-ink sm:text-5xl">
        Instituciones Bancarias
      </h1>

      <p className="mt-4 text-lg leading-8 text-muted">
        Consulta las instituciones registradas y vigentes correspondientes a{" "}
        <span className="font-semibold text-ink">{periodText}</span>.
      </p>
    </section>
  );
}

function BankErrorMessage({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-900"
    >
      <h2 className="font-bold">No se pudo cargar la información</h2>
      <p className="mt-1 text-sm">{message}</p>
    </div>
  );
}

function BankCard({
  bank,
  year,
  month,
}: {
  bank: Bank;
  year?: string;
  month?: string;
}) {
  const now = new Date();
  const selectedYear = year || now.getFullYear().toString();
  const selectedMonth = (month || (now.getMonth() + 1).toString()).padStart(
    2,
    "0",
  );
  const balanceUrl = `/balance?codigo=${bank.CodigoInstitucion}&year=${selectedYear}&month=${selectedMonth}`;
  const resultadoUrl = `/resultado?codigo=${bank.CodigoInstitucion}&year=${selectedYear}&month=${selectedMonth}`;
  return (
    <article className="flex flex-col gap-4 rounded-xl border border-line bg-panel p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <span className="grid size-14 place-items-center rounded-xl border border-line bg-white p-2">
          <img
            src={`/bank-logos/${bank.CodigoInstitucion}.png`}
            alt={`Logo de ${bank.NombreInstitucion}`}
            className="size-10 object-contain"
          />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate font-bold text-ink">
              {bank.NombreInstitucion}
            </h3>
            <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 font-mono text-xs text-muted">
              {bank.CodigoInstitucion}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-line pt-3 text-xs font-medium">
        <Link
          href={balanceUrl}
          target="_blank"
          className="flex-1 rounded-lg border border-line bg-white py-2 text-center text-ink hover:bg-slate-50 transition-colors"
        >
          Ver balance
        </Link>
        <Link
          href={resultadoUrl}
          target="_blank"
          className="flex-1 rounded-lg border border-line bg-white py-2 text-center text-ink hover:bg-slate-50 transition-colors"
        >
          Ver resultado
        </Link>
      </div>
    </article>
  );
}

function BankList({
  banks,
  year,
  month,
}: {
  banks: Bank[];
  year?: string;
  month?: string;
}) {
  if (banks.length === 0) {
    return (
      <p className="mt-6 rounded-xl border border-line bg-panel p-6 text-muted">
        No se encontraron instituciones.
      </p>
    );
  }

  return (
    <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {banks.map((bank) => (
        <BankCard
          key={bank.CodigoInstitucion}
          bank={bank}
          year={year}
          month={month}
        />
      ))}
    </div>
  );
}

// ==========================================
// 3. COMPONENTE PRINCIPAL (PÁGINA)
// ==========================================

export default async function BanksPage({
  searchParams,
}: {
  searchParams: Promise<{
    year?: string | string[];
    month?: string | string[];
  }>;
}) {
  const params = await searchParams;

  const rawYear = Array.isArray(params.year) ? params.year[0] : params.year;
  const rawMonth = Array.isArray(params.month) ? params.month[0] : params.month;

  const year = rawYear?.trim();
  const month = rawMonth?.trim();

  let banks: Bank[] = [];
  let error = "";

  try {
    banks = await getBanks(year, month);
  } catch (err) {
    error = err instanceof Error ? err.message : "Error al cargar los bancos.";
  }

  return (
    <div className="flex min-h-dvh flex-col bg-page">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <BankHeader year={year} month={month} />

        {error ? (
          <BankErrorMessage message={error} />
        ) : (
          <section className="mt-10" aria-labelledby="banks-title">
            <h2 id="banks-title" className="text-2xl font-bold text-ink">
              Instituciones
            </h2>

            <BankList banks={banks} year={year} month={month} />
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
