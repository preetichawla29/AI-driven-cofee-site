import styles from "./EmptyState.module.css";

/** Friendly message for when the API returns no items to show. */
export default function EmptyState({ title, children, tone = "light" }) {
  return (
    <div className={`${styles.empty} ${tone === "dark" ? styles.dark : ""}`}>
      <p className={styles.title}>{title}</p>
      {children && <p className={styles.body}>{children}</p>}
    </div>
  );
}
