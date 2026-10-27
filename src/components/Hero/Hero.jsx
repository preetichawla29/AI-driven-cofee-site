import styles from "./Hero.module.css";

// Placeholder photo from Unsplash; swap for the cafe's own shot later.
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1920&q=80";

export default function Hero() {
  return (
    <section
      id="home"
      className={styles.hero}
      aria-labelledby="hero-heading"
    >
      {/* Decorative backdrop; the text carries the content */}
      <img
        src={HERO_IMAGE}
        alt=""
        className={styles.image}
        fetchPriority="high"
      />
      <div className={styles.overlay} aria-hidden="true" />

      <div className={styles.inner}>
        <div className={styles.content}>
          <p className={styles.tagline}>Specialty coffee &amp; fresh bakes</p>
          <h1 id="hero-heading" className={styles.heading}>
            Where every cup blooms
          </h1>
          <p className={styles.lead}>
            Small-batch roasts, house-made pastries and a cosy corner to slow
            down. Pull up a chair and stay a while.
          </p>
          <div className={styles.actions}>
            <a href="#menu" className={`${styles.button} ${styles.primary}`}>
              View menu
            </a>
            <a
              href="#contact"
              className={`${styles.button} ${styles.secondary}`}
            >
              Book a table
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
