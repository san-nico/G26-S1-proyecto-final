import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/app", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/app")>();
  return {
    ...actual,
    getComparadorPageData: vi.fn(),
  };
});

import ComparadorPage from "@/app/comparador/page";
import { getComparadorPageData } from "@/lib/app";

const mockedGetComparadorPageData = vi.mocked(getComparadorPageData);

beforeEach(() => {
  mockedGetComparadorPageData.mockReset();
});

describe("comparador route", () => {
  it("renders the comparador header and a bank row", async () => {
    mockedGetComparadorPageData.mockResolvedValue({
      banks: [{ CodigoInstitucion: "001", NombreInstitucion: "Banco de Chile" }],
      rows: [
        {
          code: "001",
          bankName: "Banco de Chile",
          cells: {
            "100000000": { money: "1,00 B", percent: "100%" },
            "200000000": { money: "0,60 B", percent: "60%" },
            "300000000": { money: "0,40 B", percent: "40%" },
          },
        },
      ],
      error: "",
    });

    render(
      await ComparadorPage({
        searchParams: Promise.resolve({ codigo: "", year: "2026", month: "06" }),
      }),
    );

    expect(screen.getByText("Banco de Chile")).toBeInTheDocument();
  });

  it("shows an error message when loading banks fails", async () => {
    mockedGetComparadorPageData.mockResolvedValue({
      banks: [],
      rows: [],
      error: "CMF caída",
    });

    render(
      await ComparadorPage({
        searchParams: Promise.resolve({ codigo: "", year: "2026", month: "06" }),
      }),
    );

    expect(screen.getByText("CMF caída")).toBeInTheDocument();
  });
});