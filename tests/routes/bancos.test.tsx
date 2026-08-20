import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/app", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/app")>();
  return {
    ...actual,
    getBanks: vi.fn(),
  };
});

import BanksPage from "@/app/bancos/page";
import { getBanks } from "@/lib/app";

const mockedGetBanks = vi.mocked(getBanks);

beforeEach(() => {
  mockedGetBanks.mockReset();
});

describe("bancos route", () => {
  it("renders the page title and description", async () => {
    mockedGetBanks.mockResolvedValue([]);

    const { container } = render(
      await BanksPage({ searchParams: Promise.resolve({}) }),
    );

    expect(container.querySelector("h1")).toHaveTextContent(
      "Instituciones Bancarias",
    );
    expect(screen.getByText(/Datos oficiales CMF Chile/)).toBeInTheDocument();
  });

  it("renders the list of banks returned by the API", async () => {
    mockedGetBanks.mockResolvedValue([
      { CodigoInstitucion: "001", NombreInstitucion: "Banco de Chile" },
      { CodigoInstitucion: "002", NombreInstitucion: "Banco Estado" },
    ]);

    render(await BanksPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByText("Banco de Chile")).toBeInTheDocument();
    expect(screen.getByText("Banco Estado")).toBeInTheDocument();
    expect(mockedGetBanks).toHaveBeenCalled();
  });

  it("filters out the 999 SISTEMA FINANCIERO entry", async () => {
    mockedGetBanks.mockResolvedValue([
      { CodigoInstitucion: "001", NombreInstitucion: "Banco de Chile" },
      { CodigoInstitucion: "999", NombreInstitucion: "SISTEMA FINANCIERO" },
    ]);

    render(await BanksPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByText("Banco de Chile")).toBeInTheDocument();
    expect(screen.queryByText("SISTEMA FINANCIERO")).not.toBeInTheDocument();
  });

  it("shows an error alert when the API call fails", async () => {
    mockedGetBanks.mockRejectedValue(new Error("CMF no disponible"));

    render(await BanksPage({ searchParams: Promise.resolve({}) }));

    expect(
      screen.getByRole("alert", { name: "" }),
    ).toBeInTheDocument();
    expect(screen.getByText("CMF no disponible")).toBeInTheDocument();
  });
});