import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/app", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/app")>();
  return {
    ...actual,
    getBanksPageData: vi.fn(),
  };
});

import BanksPage from "@/app/bancos/page";
import { getBanksPageData } from "@/lib/app";

const mockedGetBanksPageData = vi.mocked(getBanksPageData);

beforeEach(() => {
  mockedGetBanksPageData.mockReset();
});

describe("bancos route", () => {
  it("renders the page title and description", async () => {
    mockedGetBanksPageData.mockResolvedValue({ banks: [], error: "" });

    const { container } = render(
      await BanksPage({ searchParams: Promise.resolve({}) }),
    );

    expect(container.querySelector("h1")).toHaveTextContent(
      "Instituciones Bancarias",
    );
    expect(screen.getByText(/Datos oficiales CMF Chile/)).toBeInTheDocument();
  });

  it("renders the list of banks returned by the API", async () => {
    mockedGetBanksPageData.mockResolvedValue({
      banks: [
        { CodigoInstitucion: "001", NombreInstitucion: "Banco de Chile" },
        { CodigoInstitucion: "002", NombreInstitucion: "Banco Estado" },
      ],
      error: "",
    });

    render(await BanksPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByText("Banco de Chile")).toBeInTheDocument();
    expect(screen.getByText("Banco Estado")).toBeInTheDocument();
    expect(mockedGetBanksPageData).toHaveBeenCalled();
  });

  it("does not render institutions when the list is empty", async () => {
    mockedGetBanksPageData.mockResolvedValue({ banks: [], error: "" });

    render(await BanksPage({ searchParams: Promise.resolve({}) }));

    expect(
      screen.getByText("No se encontraron instituciones."),
    ).toBeInTheDocument();
  });

  it("shows an error alert when the API call fails", async () => {
    mockedGetBanksPageData.mockResolvedValue({
      banks: [],
      error: "CMF no disponible",
    });

    render(await BanksPage({ searchParams: Promise.resolve({}) }));

    expect(
      screen.getByRole("alert", { name: "" }),
    ).toBeInTheDocument();
    expect(screen.getByText("CMF no disponible")).toBeInTheDocument();
  });
});