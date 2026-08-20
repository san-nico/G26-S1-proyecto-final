import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/app", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/app")>();
  return {
    ...actual,
    getBalancePageData: vi.fn(),
  };
});

import BalancePage from "@/app/balance/page";
import { getBalancePageData } from "@/lib/app";

const mockedGetBalancePageData = vi.mocked(getBalancePageData);

const balanceAccount = (account: Partial<{
  CodigoCuenta: string;
  DescripcionCuenta: string;
  MonedaTotal: string;
}> = {}) => ({
  CodigoCuenta: "100000000",
  DescripcionCuenta: "Activo Total",
  CodigoInstitucion: "001",
  NombreInstitucion: "Banco de Chile",
  Anho: "2026",
  Mes: "06",
  MonedaChilenaNoReajustable: null,
  MonedaReajustablePorIPC: null,
  MonedaReajustablePorTipoDeCambio: null,
  MonedaExtranjera: null,
  MonedaReajustable: null,
  MonedaTotal: "1000000000",
  ...account,
});

beforeEach(() => {
  mockedGetBalancePageData.mockReset();
});

describe("balance route", () => {
  it("renders bank name and accounts", async () => {
    mockedGetBalancePageData.mockResolvedValue({
      bankName: "Banco de Chile",
      accounts: [balanceAccount()],
      error: "",
    });

    render(
      await BalancePage({
        searchParams: Promise.resolve({ codigo: "001", year: "2026", month: "06" }),
      }),
    );

    expect(screen.getByText("Banco de Chile")).toBeInTheDocument();
    expect(screen.getByText("Activo Total")).toBeInTheDocument();
  });

  it("shows an error when the API call fails", async () => {
    mockedGetBalancePageData.mockResolvedValue({
      bankName: "",
      accounts: [],
      error: "No se pudieron consultar los datos del balance en la CMF.",
    });

    render(
      await BalancePage({
        searchParams: Promise.resolve({ codigo: "001", year: "2026", month: "06" }),
      }),
    );

    expect(
      screen.getByText(
        "No se pudieron consultar los datos del balance en la CMF.",
      ),
    ).toBeInTheDocument();
  });
});