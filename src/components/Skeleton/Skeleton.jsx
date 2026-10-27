import styles from "./Skeleton.module.css";

/**
 * Grey placeholder shape shown while data loads. Always hidden from assistive
 * tech; pair it with FetchStatus, which announces the loading message.
 * - variant: "text" (one line of body text), "heading", "block" (form control) or "tile" (4:3 image)
 * - width: any CSS width, e.g. "60%"
 * - tone: "light" (cream/white backgrounds) or "dark" (espresso footer)
 */
export default function Skeleton({
  variant = "text",
  width = "100%",
  tone = "light",
}) {
  return (
    <span
      aria-hidden="true"
      className={`${styles.skeleton} ${styles[variant]} ${tone === "dark" ? styles.dark : ""}`}
      style={{ inlineSize: width }}
    />
  );
}
