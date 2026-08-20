import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/app", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/app")>();
  return {
    ...actual,
    getBanks: vi.fn(),
    getAccountsByAllInstitutions: vi.fn(),
  };
});

import ComparadorPage from "@/app/comparador/page";
import { getAccountsByAllInstitutions, getBanks } from "@/lib/app";

const mockedGetBanks = vi.mocked(getBanks);
const mockedGetAccounts = vi.mocked(getAccountsByAllInstitutions);

beforeEach(() => {
  mockedGetBanks.mockReset();
  mockedGetAccounts.mockReset();
});

describe("comparador route", () => {
  it("renders the comparador header and a bank row", async () => {
    mockedGetBanks.mockResolvedValue([
      { CodigoInstitucion: "001", NombreInstitucion: "Banco de Chile" },
    ]);
    mockedGetAccounts.mockResolvedValue({
      "100000000": { "001": "1000000000" },
      "200000000": { "001": "600000000" },
      "300000000": { "001": "400000000" },
    });

    render(
      await ComparadorPage({
        searchParams: Promise.resolve({ codigo: "", year: "2026", month: "06" }),
      }),
    );

    expect(screen.getByText("Banco de Chile")).toBeInTheDocument();
  });

  it("shows an error message when loading banks fails", async () => {
    mockedGetBanks.mockRejectedValue(new Error("CMF caída"));
    mockedGetAccounts.mockResolvedValue({});

    render(
      await ComparadorPage({
        searchParams: Promise.resolve({ codigo: "", year: "2026", month: "06" }),
      }),
    );

    expect(screen.getByText("CMF caída")).toBeInTheDocument();
  });
});