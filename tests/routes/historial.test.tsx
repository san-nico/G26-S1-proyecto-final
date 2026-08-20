import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/app", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/app")>();
  return {
    ...actual,
    getHistorialPageData: vi.fn(),
  };
});

import HistorialPage from "@/app/historial/page";
import { getHistorialPageData } from "@/lib/app";

const mockedGetHistorialPageData = vi.mocked(getHistorialPageData);

beforeEach(() => {
  mockedGetHistorialPageData.mockReset();
});

describe("historial route", () => {
  it("renders the bank name in the heading", async () => {
    mockedGetHistorialPageData.mockResolvedValue({
      bankName: "Banco de Chile",
      rows: [
        {
          year: 2026,
          cells: {
            "100000000": { money: "1,00 B", percent: "100%" },
            "200000000": { money: "0,60 B", percent: "60%" },
            "300000000": { money: "0,40 B", percent: "40%" },
          },
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
    mockedGetHistorialPageData.mockResolvedValue({ bankName: "", rows: [] });

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