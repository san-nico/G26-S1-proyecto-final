import Footer from "@/components/global/Footer";
import Navbar from "@/components/global/Navbar";
import styles from "./PageLayout.module.scss";

type PageLayoutProps = {
  children: React.ReactNode;
  className?: string;
  mainClassName?: string;
};

export default function PageLayout({
  children,
  className = styles.layout,
  mainClassName = styles.main,
}: PageLayoutProps) {
  return (
    <div className={className}>
      <div className={styles.shell}>
        <Navbar />
      </div>
      <main className={mainClassName}>{children}</main>
      <div className={styles.shell}>
        <Footer />
      </div>
    </div>
  );
}
