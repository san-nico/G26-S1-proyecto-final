import type { Metadata } from "next";
import ResultsView from "./ResultsView";
import styles from "./ResultsView.module.css";

export const metadata: Metadata = {
  title: "Resumen de Resultados | CMF Chile",
};

interface CmfAccount {
  CodigoCuenta?: string;
  MonedaTotal?: string;
  NombreInstitucion?: string;
}

const API_URL = "https://api.cmfchile.cl/api-sbifv3/recursos_api/resultados";

const SUMMARY_GROUPS = [
  {
    code: "550000000",
    category: "Ingresos",
    title: "Ingresos operacionales",
    cardClass: styles.cardIncome,
    textClass: styles.textIncome,
  },
  {
    code: "560000000",
    category: "Gastos",
    title: "Gastos operacionales",
    cardClass: styles.cardExpense,
    textClass: styles.textExpense,
  },
  {
    code: "590000000",
    category: "Resultado",
    title: "Resultado del período",
    cardClass: styles.cardResult,
    textClass: styles.textResult,
  },
] as const;

function formatValue(value?: string) {
  if (!value) return "—";
  const num = Math.round(Number(value.replace(",", ".")));
  return Number.isNaN(num) ? value : num.toLocaleString("es-CL");
}

async function getResultsData(code: string, year: string, month: string) {
  const url = `${API_URL}/${year}/${month}/instituciones/${code}?apikey=${process.env.CMF_API_KEY || ""}&formato=json`;

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 },
  });

  if (!res.ok) throw new Error();

  const data = await res.json();
  const list: CmfAccount[] = Array.isArray(data?.CodigosEstadosDeResultado)
    ? data.CodigosEstadosDeResultado
    : [data?.CodigosEstadosDeResultado];

  let bankName = "";
  const rawData: Record<string, string> = {};

  list.forEach((acc) => {
    if (acc?.CodigoCuenta)
      rawData[acc.CodigoCuenta.trim()] = acc.MonedaTotal ?? "";
    if (!bankName && acc?.NombreInstitucion) bankName = acc.NombreInstitucion;
  });

  bankName ||= code === "999" ? "SISTEMA FINANCIERO" : `Institución ${code}`;

  const cards = SUMMARY_GROUPS.map((group) => ({
    category: group.category,
    title: group.title,
    amount: formatValue(rawData[group.code]),
    cardClass: group.cardClass,
    textClass: group.textClass,
  }));

  return { bankName, cards };
}

export default async function SummaryPage({
  searchParams,
}: {
  searchParams: Promise<{ codigo?: string; year?: string; month?: string }>;
}) {
  const params = await searchParams;
  const now = new Date();
  const code = params.codigo || "999";
  const year = params.year || String(now.getFullYear());
  const month = params.month || String(now.getMonth() + 1).padStart(2, "0");

  let bankName = "";
  let cards: {
    category: string;
    title: string;
    amount: string;
    cardClass: string;
    textClass: string;
  }[] = [];
  let error = "";

  try {
    const data = await getResultsData(code, year, month);
    bankName = data.bankName;
    cards = data.cards;
  } catch {
    error = "No se pudieron consultar los datos en la CMF.";
  }

  return (
    <ResultsView
      bankName={bankName}
      code={code}
      year={year}
      month={month}
      cards={cards}
      error={error}
    />
  );
}
