import { Suspense } from "react";
import Footer from "@/components/global/Footer";
import Navbar from "@/components/global/Navbar";

type PageLayoutProps = {
  children: React.ReactNode;
  className?: string;
  mainClassName?: string;
};

export default function PageLayout({
  children,
  className = "page-shell",
  mainClassName = "container-main",
}: PageLayoutProps) {
  return (
    <div className={className}>
      <div className="shrink-0">
        <Suspense>
          <Navbar />
        </Suspense>
      </div>
      <main className={mainClassName}>{children}</main>
      <div className="shrink-0">
        <Footer />
      </div>
    </div>
  );
}
