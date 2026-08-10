export interface AccountTarget {
  code: string;
  category: string;
  title: string;
  cardClass: string;
  textClass: string;
}

export const ACCOUNTS_BALANCE: AccountTarget[] = [
  {
    code: "100000000",
    category: "Activo",
    title: "Activo Total",
    cardClass: "border-income-200 bg-income-50/60",
    textClass: "text-income-700",
  },
  {
    code: "200000000",
    category: "Pasivo",
    title: "Pasivo Total",
    cardClass: "border-alert-border bg-[#fef3c7]/60",
    textClass: "text-[#b45309]",
  },
  {
    code: "300000000",
    category: "Patrimonio",
    title: "Patrimonio Total",
    cardClass: "border-result-200 bg-result-50/60",
    textClass: "text-result-700",
  },
];

export const ACCOUNTS_RESULTADO: AccountTarget[] = [
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
