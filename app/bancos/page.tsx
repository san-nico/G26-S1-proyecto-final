import type { Metadata } from "next";
import Footer from "@/components/global/Footer";
import BankList from "./BankList";
import Navbar from "@/components/global/Navbar";

export const metadata: Metadata = {
  title: "Instituciones bancarias | CMF Chile",
  description:
    "Consulta el listado de instituciones bancarias registradas en la CMF.",
};

type Bank = {
  CodigoInstitucion: string;
  NombreInstitucion: string;
};

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
  const raw = data?.DescripcionesCodigosDeInstituciones;
  if (!raw) return [];

  return (Array.isArray(raw) ? raw : [raw])
    .map((b) => ({
      CodigoInstitucion: b?.CodigoInstitucion?.toString().trim() || "",
      NombreInstitucion: b?.NombreInstitucion?.toString().trim() || "",
    }))
    .filter((b) => b.CodigoInstitucion && b.NombreInstitucion);
}

export default async function BanksPage({
  searchParams,
}: {
  searchParams: Promise<{
    year?: string | string[];
    month?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const year = (
    Array.isArray(params.year) ? params.year[0] : params.year
  )?.trim();
  const month = (
    Array.isArray(params.month) ? params.month[0] : params.month
  )?.trim();

  let banks: Bank[] = [];
  let error = "";

  try {
    banks = await getBanks(year, month);
  } catch (err) {
    error = err instanceof Error ? err.message : "Error al cargar los bancos.";
  }

  const now = new Date();
  const selectedYear = year || now.getFullYear().toString();
  const selectedMonth = month || (now.getMonth() + 1).toString();
  const periodText = new Intl.DateTimeFormat("es-CL", { month: "long" }).format(
    new Date(parseInt(selectedYear, 10), parseInt(selectedMonth, 10) - 1, 1),
  );
  const capitalizedPeriod = `${periodText.charAt(0).toUpperCase() + periodText.slice(1)} de ${selectedYear}`;

  return (
    <div className="flex min-h-dvh flex-col bg-page">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <BankList
          banks={banks}
          error={error}
          capitalizedPeriod={capitalizedPeriod}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
        />
      </main>

      <Footer />
    </div>
  );
}
