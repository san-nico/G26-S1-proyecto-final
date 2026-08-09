import PageLayout from "@/components/global/PageLayout";
import styles from "./LoadingState.module.scss";

interface LoadingStateProps {
  title?: string;
  description?: string;
}

export default function LoadingState({
  title = "Consultando la CMF",
  description = "Buscando la información solicitada.",
}: LoadingStateProps) {
  return (
    <PageLayout mainClassName={styles.main}>
      <div role="status" aria-live="polite" aria-busy="true" className={styles.card}>
        <span className={styles.spinner} aria-hidden="true" />
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.description}>{description}</p>
      </div>
    </PageLayout>
  );
}
