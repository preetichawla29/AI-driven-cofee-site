import styles from "./About.module.css";

// Placeholder photo from Unsplash; swap for the cafe's own shot later
// and rewrite the alt text to match it.
const ABOUT_IMAGE =
  "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1200&q=80";

const svgProps = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true",
};

function BeanIcon() {
  return (
    <svg {...svgProps}>
      <ellipse cx="12" cy="12" rx="6" ry="9" transform="rotate(35 12 12)" />
      <path d="M8.5 6.5c3 2 1 8.5 7 11" />
    </svg>
  );
}

function LoafIcon() {
  return (
    <svg {...svgProps}>
      <path d="M4 12a8 5 0 0 1 16 0v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
      <path d="M9 9.5l-1 2.5M13 9.5l-1 2.5M17 10l-1 2" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg {...svgProps}>
      <path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

const HIGHLIGHTS = [
  { label: "Small-batch roasts", Icon: BeanIcon },
  { label: "Baked daily", Icon: LoafIcon },
  { label: "Locally sourced", Icon: PinIcon },
];

export default function About() {
  return (
    <section
      id="about"
      className={styles.about}
      aria-labelledby="about-heading"
    >
      <div className={styles.inner}>
        <img
          src={ABOUT_IMAGE}
          alt="Barista pouring water from a gooseneck kettle into a glass pour-over coffee maker"
          className={styles.image}
          width="1200"
          height="900"
          loading="lazy"
        />

        <div className={styles.content}>
          <p className={styles.label}>Our story</p>
          <h2 id="about-heading" className={styles.heading}>
            Rooted in good coffee
          </h2>
          <p>
            Brew &amp; Bloom started as a weekend coffee cart with one grinder
            and a lot of curiosity. Today we roast our beans in small batches
            right here, chasing the sweet spot where every cup tastes its best.
          </p>
          <p>
            Our bakers start before sunrise, and we work with nearby farms and
            dairies for the rest. It's simple food and honest coffee, made by
            people who love both.
          </p>

          <ul role="list" className={styles.highlights}>
            {HIGHLIGHTS.map(({ label, Icon }) => (
              <li key={label} className={styles.highlight}>
                <span className={styles.icon}>
                  <Icon />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
