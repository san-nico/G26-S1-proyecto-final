import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/bancos", () => ({
  getFullBalance: vi.fn(),
}));

import BalancePage from "@/app/balance/page";
import { getFullBalance } from "@/lib/bancos";

const mockedGetFullBalance = vi.mocked(getFullBalance);

beforeEach(() => {
  mockedGetFullBalance.mockReset();
});

describe("balance route", () => {
  it("renders bank name and non-zero accounts", async () => {
    mockedGetFullBalance.mockResolvedValue({
      bankName: "Banco de Chile",
      accounts: [
        {
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
        },
      ],
    });

    render(
      await BalancePage({
        searchParams: Promise.resolve({ codigo: "001", year: "2026", month: "06" }),
      }),
    );

    expect(screen.getByText("Banco de Chile")).toBeInTheDocument();
    expect(screen.getByText("Activo Total")).toBeInTheDocument();
  });

  it("filters out accounts with zero MonedaTotal", async () => {
    mockedGetFullBalance.mockResolvedValue({
      bankName: "Banco de Chile",
      accounts: [
        {
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
          MonedaTotal: "0",
        },
        {
          CodigoCuenta: "300000000",
          DescripcionCuenta: "Patrimonio Total",
          CodigoInstitucion: "001",
          NombreInstitucion: "Banco de Chile",
          Anho: "2026",
          Mes: "06",
          MonedaChilenaNoReajustable: null,
          MonedaReajustablePorIPC: null,
          MonedaReajustablePorTipoDeCambio: null,
          MonedaExtranjera: null,
          MonedaReajustable: null,
          MonedaTotal: "500000000",
        },
      ],
    });

    render(
      await BalancePage({
        searchParams: Promise.resolve({ codigo: "001", year: "2026", month: "06" }),
      }),
    );

    expect(screen.queryByText("Activo Total")).not.toBeInTheDocument();
    expect(screen.getByText("Patrimonio Total")).toBeInTheDocument();
  });

  it("shows an error when the API call fails", async () => {
    mockedGetFullBalance.mockRejectedValue(new Error("boom"));

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