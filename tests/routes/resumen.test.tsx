import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/resumen/sections/FichaSection", () => ({
  default: () => <section data-testid="ficha">Ficha mock</section>,
}));
vi.mock("@/components/resumen/sections/BalanceSection", () => ({
  default: () => <section data-testid="balance">Balance mock</section>,
}));
vi.mock("@/components/resumen/sections/ResultadoSection", () => ({
  default: () => <section data-testid="resultado">Resultado mock</section>,
}));

import ResumenPage from "@/app/resumen/page";

describe("resumen route", () => {
  it("renders the three suspended sections", async () => {
    render(
      await ResumenPage({
        searchParams: Promise.resolve({ codigo: "001", year: "2026", month: "06" }),
      }),
    );

    expect(screen.getByTestId("ficha")).toBeInTheDocument();
    expect(screen.getByTestId("balance")).toBeInTheDocument();
    expect(screen.getByTestId("resultado")).toBeInTheDocument();
  });
});