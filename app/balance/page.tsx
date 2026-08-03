import type { Metadata } from "next";
import BalanceView from "./BalanceView";
import styles from "./BalanceView.module.css";

export const metadata: Metadata = {
  title: "Resumen de Balance | CMF Chile",
};

interface CmfAccount {
  CodigoCuenta?: string;
  MonedaTotal?: string;
  NombreInstitucion?: string;
}

const API_URL = "https://api.cmfchile.cl/api-sbifv3/recursos_api/balances";

const TARGET_ACCOUNTS = [
  {
    code: "100000000",
    category: "Activo",
    title: "Activo Total",
    style: styles.cardActivo,
  },
  {
    code: "200000000",
    category: "Pasivo",
    title: "Pasivo Total",
    style: styles.cardPasivo,
  },
  {
    code: "300000000",
    category: "Patrimonio",
    title: "Patrimonio Total",
    style: styles.cardPatrimonio,
  },
];

function formatValue(value?: string) {
  if (!value) return "—";
  const num = Math.round(Number(value.replace(",", ".")));
  return Number.isNaN(num) ? value : num.toLocaleString("es-CL");
}

async function getBalanceData(code: string, year: string, month: string) {
  const url = `${API_URL}/${year}/${month}/instituciones/${code}?apikey=${process.env.CMF_API_KEY || ""}&formato=json`;

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 },
  });

  if (!res.ok) throw new Error();

  const data = await res.json();
  const list: CmfAccount[] = Array.isArray(data?.CodigosBalances)
    ? data.CodigosBalances
    : [data?.CodigosBalances];

  let bankName = "";
  const rawData: Record<string, string> = {};

  list.forEach((acc) => {
    if (acc?.CodigoCuenta)
      rawData[acc.CodigoCuenta.trim()] = acc.MonedaTotal ?? "";
    if (!bankName && acc?.NombreInstitucion) bankName = acc.NombreInstitucion;
  });

  bankName ||= code === "999" ? "SISTEMA FINANCIERO" : `Institución ${code}`;

  const cards = TARGET_ACCOUNTS.map((item) => ({
    category: item.category,
    title: item.title,
    amount: formatValue(rawData[item.code]),
    style: item.style,
  }));

  return { bankName, cards };
}

export default async function BalancePage({
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
    style: string;
  }[] = [];
  let error = "";

  try {
    const data = await getBalanceData(code, year, month);
    bankName = data.bankName;
    cards = data.cards;
  } catch {
    error = "No se pudieron consultar los datos del balance en la CMF.";
  }

  return (
    <BalanceView
      bankName={bankName}
      code={code}
      year={year}
      month={month}
      cards={cards}
      error={error}
    />
  );
}
