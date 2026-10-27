import { useEffect, useState } from "react";
import styles from "./BackToTop.module.css";

const SHOW_AFTER = 400;

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // A link (not a button) so focus moves to the top of the page with the scroll.
  // Hidden with visibility, which also removes it from the tab order.
  return (
    <a
      href="#home"
      className={`${styles.button} ${visible ? styles.visible : ""}`}
      aria-label="Back to top"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </a>
  );
}
