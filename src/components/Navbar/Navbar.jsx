import { useEffect, useState } from "react";
import styles from "./Navbar.module.css";

const LINKS = [
  { label: "Home", href: "#home" },
  { label: "Menu", href: "#menu" },
  { label: "About", href: "#about" },
  { label: "Gallery", href: "#gallery" },
  { label: "Contact", href: "#contact" },
];

function Logo() {
  return (
    <a href="#home" className={styles.logo} aria-label="Brew & Bloom, home">
      <svg
        width="34"
        height="34"
        viewBox="0 0 34 34"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M6 14h18v7a8 8 0 0 1-8 8h-2a8 8 0 0 1-8-8v-7Z"
          fill="currentColor"
        />
        <path
          d="M24 16h2.5a3 3 0 0 1 0 6H24"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path d="M15 11c0-3 2-4 4-6 1 3 0 5-4 6Z" fill="var(--color-accent)" />
      </svg>
      <span>Brew &amp; Bloom</span>
    </a>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("#home");

  // Track which section sits in a band just below the navbar
  useEffect(() => {
    const sections = LINKS.map(({ href }) =>
      document.querySelector(href),
    ).filter(Boolean);
    const navHeight =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--nav-height",
        ),
      ) || 0;
    const visible = new Set();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(({ target, isIntersecting }) =>
          isIntersecting ? visible.add(target) : visible.delete(target),
        );
        // Topmost section in the band wins; keep the last one if none are in it
        const current = sections.find((section) => visible.has(section));
        if (current) setActive(`#${current.id}`);
      },
      { rootMargin: `-${navHeight}px 0px -60% 0px` },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
      <div className={styles.inner}>
        <Logo />

        <button
          type="button"
          className={styles.toggle}
          aria-expanded={open}
          aria-controls="primary-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          <span className={styles.bar} />
          <span className={styles.bar} />
          <span className={styles.bar} />
        </button>

        <nav
          id="primary-nav"
          aria-label="Primary"
          className={`${styles.nav} ${open ? styles.navOpen : ""}`}
        >
          <ul className={styles.list}>
            {LINKS.map(({ label, href }) => (
              <li key={href}>
                <a
                  href={href}
                  className={styles.link}
                  aria-current={active === href ? "true" : undefined}
                  onClick={() => setOpen(false)}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href="#contact"
            className={styles.cta}
            onClick={() => setOpen(false)}
          >
            Book a table
          </a>
        </nav>
      </div>
    </header>
  );
}
