import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/app", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/app")>();
  return {
    ...actual,
    getFullBalance: vi.fn(),
  };
});

import HistorialPage from "@/app/historial/page";
import { getFullBalance } from "@/lib/app";

const mockedGetFullBalance = vi.mocked(getFullBalance);

beforeEach(() => {
  mockedGetFullBalance.mockReset();
});

describe("historial route", () => {
  it("renders the bank name in the heading", async () => {
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
      await HistorialPage({
        searchParams: Promise.resolve({ codigo: "001", year: "2026", month: "06" }),
      }),
    );

    expect(
      screen.getByRole("heading", { name: "Historial de Banco de Chile" }),
    ).toBeInTheDocument();
  });

  it("shows a fallback message when no data is available", async () => {
    mockedGetFullBalance.mockRejectedValue(new Error("boom"));

    render(
      await HistorialPage({
        searchParams: Promise.resolve({ codigo: "001", year: "2026", month: "06" }),
      }),
    );

    expect(
      screen.getByText("No se pudo cargar la información del historial."),
    ).toBeInTheDocument();
  });
});