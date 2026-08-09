export interface BalanceTarget {
  code: string;
  category: string;
  title: string;
  style: string;
}

export const TARGET_ACCOUNTS: BalanceTarget[] = [
  {
    code: "100000000",
    category: "Activo",
    title: "Activo Total",
    style: "border-income-200 bg-income-50/60 text-income-700",
  },
  {
    code: "200000000",
    category: "Pasivo",
    title: "Pasivo Total",
    style: "border-alert-border bg-[#fef3c7]/60 text-[#b45309]",
  },
  {
    code: "300000000",
    category: "Patrimonio",
    title: "Patrimonio Total",
    style: "border-result-200 bg-result-50/60 text-result-700",
  },
];

export interface ResultTarget {
  code: string;
  category: string;
  title: string;
  cardClass: string;
  textClass: string;
}

export const SUMMARY_GROUPS: ResultTarget[] = [
  {
    code: "550000000",
    category: "Ingresos",
    title: "Ingresos operacionales",
    cardClass: "border-income-200 bg-income-50",
    textClass: "text-income-700",
  },
  {
    code: "560000000",
    category: "Gastos",
    title: "Gastos operacionales",
    cardClass: "border-expense-200 bg-expense-50",
    textClass: "text-expense-700",
  },
  {
    code: "590000000",
    category: "Resultado",
    title: "Resultado del período",
    cardClass: "border-result-200 bg-result-50",
    textClass: "text-result-700",
  },
];
