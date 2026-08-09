import styles from "./Footer.module.scss";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        Consulta de datos bancarios publicados por API de la CMF Chile.
      </div>
    </footer>
  );
}
