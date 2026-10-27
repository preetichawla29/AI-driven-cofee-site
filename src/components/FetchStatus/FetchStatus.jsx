import styles from "./FetchStatus.module.css";

/**
 * Loading / error message for data fetched with useFetch.
 * While first loading, the message is for screen readers only (sections show
 * skeletons instead). Errors are shown with a retry button. Renders nothing once loaded.
 */
export default function FetchStatus({
  status,
  error,
  retry,
  loadingText,
  errorText,
  tone = "light",
}) {
  if (status === "success") return null;

  // role="status" so screen readers hear loading and failure messages
  if (!error) {
    return (
      <p role="status" className={styles.srOnly}>
        {loadingText}
      </p>
    );
  }

  const retrying = status === "loading";
  const message = retrying ? "Trying again…" : `${errorText} ${error.message}`;

  return (
    <div className={`${styles.wrap} ${tone === "dark" ? styles.dark : ""}`}>
      <p role="status" className={styles.message}>
        {message}
      </p>
      {/* Kept on screen while retrying so keyboard focus isn't lost */}
      <button
        type="button"
        className={styles.retry}
        aria-disabled={retrying || undefined}
        onClick={() => !retrying && retry()}
      >
        Try again
      </button>
    </div>
  );
}
