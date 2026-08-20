import "@testing-library/jest-dom/vitest";

import { afterEach, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(""),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
}));

vi.mock("next/font/google", () => ({
  Geist: () => ({ variable: "--font-geist-sans", className: "" }),
  Geist_Mono: () => ({ variable: "--font-geist-mono", className: "" }),
}));

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    width,
    height,
    className,
  }: {
    src: string;
    alt?: string;
    width?: number;
    height?: number;
    className?: string;
  }) => (
    <img
      src={src}
      alt={alt ?? ""}
      width={width}
      height={height}
      className={className}
    />
  ),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

afterEach(() => {
  vi.clearAllMocks();
});