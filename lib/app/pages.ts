import type { BalanceAccount } from "@/lib/cmf-bancos";
import {
  ACCOUNTS_BALANCE,
  buildAccountCell,
  getAccountsByAllInstitutions,
  getBanks,
  getFullBalance,
  toNumber,
} from "./index";
import type { AccountCell, Bank } from "./index";

export interface BanksPageData {
  banks: Bank[];
  error: string;
}

export async function getBanksPageData(
  year: string,
  month: string,
): Promise<BanksPageData> {
  try {
    const banks = (await getBanks(year, month)).filter(
      (bank) => bank.CodigoInstitucion !== "999",
    );
    return { banks, error: "" };
  } catch (err) {
    return {
      banks: [],
      error: err instanceof Error ? err.message : "Error al cargar los bancos.",
    };
  }
}

export interface BalancePageData {
  bankName: string;
  accounts: BalanceAccount[];
  error: string;
}

export async function getBalancePageData(
  code: string,
  year: string,
  month: string,
): Promise<BalancePageData> {
  try {
    const data = await getFullBalance(code, year, month);
    const accounts = data.accounts.filter(
      (account) => toNumber(account.MonedaTotal ?? "") !== 0,
    );
    return { bankName: data.bankName, accounts, error: "" };
  } catch {
    return {
      bankName: "",
      accounts: [],
      error: "No se pudieron consultar los datos del balance en la CMF.",
    };
  }
}

export interface ComparadorRow {
  code: string;
  bankName: string;
  cells: Record<string, AccountCell>;
}

export interface ComparadorPageData {
  banks: Bank[];
  rows: ComparadorRow[];
  error: string;
}

export async function getComparadorPageData(
  year: string,
  month: string,
): Promise<ComparadorPageData> {
  let banks: Bank[] = [];
  let error = "";

  try {
    banks = await getBanks(year, month);
  } catch (err) {
    error =
      err instanceof Error ? err.message : "Error al cargar los bancos.";
  }

  const accountMap = await getAccountsByAllInstitutions(
    ACCOUNTS_BALANCE.map((item) => item.code),
    year,
    month,
  );

  const baseCode = ACCOUNTS_BALANCE[0]?.code ?? "";

  const rows = banks
    .map((bank) => {
      const baseRaw = toNumber(accountMap[baseCode]?.[bank.CodigoInstitucion]);
      const cells = Object.fromEntries(
        ACCOUNTS_BALANCE.map((item) => [
          item.code,
          buildAccountCell(
            accountMap[item.code]?.[bank.CodigoInstitucion],
            baseRaw,
            item.code === baseCode,
          ),
        ]),
      );
      return {
        code: bank.CodigoInstitucion,
        bankName: bank.NombreInstitucion,
        cells,
      };
    })
    .sort(
      (a, b) =>
        toNumber(accountMap[baseCode]?.[b.code]) -
        toNumber(accountMap[baseCode]?.[a.code]),
    );

  return { banks, rows, error };
}

export interface HistorialRow {
  year: number;
  cells: Record<string, AccountCell>;
}

export interface HistorialPageData {
  bankName: string;
  rows: HistorialRow[];
}

const YEARS_TO_SHOW = 10;

export async function getHistorialPageData(
  code: string,
  year: string,
  month: string,
): Promise<HistorialPageData> {
  const parsedYear = Number(year);
  const baseYear = Number.isFinite(parsedYear)
    ? parsedYear
    : new Date().getFullYear();
  const years = Array.from({ length: YEARS_TO_SHOW }, (_, i) => baseYear - i);

  const baseCode = ACCOUNTS_BALANCE[0]?.code ?? "";

  const results = await Promise.all(
    years.map(async (y) => {
      try {
        const full = await getFullBalance(code, String(y), month);
        const accounts = new Map(
          full.accounts.map((acc) => [acc.CodigoCuenta, acc]),
        );
        const baseRaw = toNumber(accounts.get(baseCode)?.MonedaTotal ?? undefined);
        const cells = Object.fromEntries(
          ACCOUNTS_BALANCE.map((item) => [
            item.code,
            buildAccountCell(
              accounts.get(item.code)?.MonedaTotal ?? undefined,
              baseRaw,
              item.code === baseCode,
            ),
          ]),
        );
        return { year: y, cells, bankName: full.bankName };
      } catch (error) {
        console.warn(`[CMF] Failed to fetch historial year ${y}:`, error);
        return { year: y, cells: {}, bankName: "" };
      }
    }),
  );

  const bankName = results[0]?.bankName ?? "";
  const rows = results.map(({ year: y, cells }) => ({ year: y, cells }));

  return { bankName, rows };
}