import { getInfo } from "../../api/client";
import { useFetch } from "../../hooks/useFetch";
import { formatHours } from "../../utils/format";
import EmptyState from "../EmptyState";
import FetchStatus from "../FetchStatus";
import Skeleton from "../Skeleton";
import styles from "./Footer.module.css";

const LINKS = [
  { label: "Menu", href: "#menu" },
  { label: "About", href: "#about" },
  { label: "Gallery", href: "#gallery" },
  { label: "Contact", href: "#contact" },
];

// Placeholder for the Visit and Contact columns while info loads
function InfoSkeleton() {
  return [3, 2].map((lines, column) => (
    <div key={column} aria-hidden="true">
      <Skeleton variant="heading" width="50%" tone="dark" />
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} width={i % 2 ? "65%" : "85%"} tone="dark" />
      ))}
    </div>
  ));
}

function InfoColumns({ info }) {
  const hasVisit = info.address?.length > 0 || info.hours?.length > 0;
  const hasContact = info.phone || info.email;

  if (!hasVisit && !hasContact) {
    return (
      <div className={styles.infoStatus}>
        <EmptyState
          title="Opening hours and contact details coming soon."
          tone="dark"
        />
      </div>
    );
  }

  return (
    <>
      {hasVisit && (
        <div>
          <h2 className={styles.heading}>Visit</h2>
          {info.address?.length > 0 && (
            <address className={styles.address}>
              {info.address.map((line) => (
                <span key={line} className={styles.line}>
                  {line}
                </span>
              ))}
            </address>
          )}
          {info.hours?.length > 0 && (
            <ul role="list" className={styles.list}>
              {info.hours.map((hours) => (
                <li key={hours.label}>
                  {hours.label}: {formatHours(hours)}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {hasContact && (
        <div>
          <h2 className={styles.heading}>Contact</h2>
          <ul role="list" className={styles.list}>
            {info.phone && (
              <li>
                <a href={info.phone.href} className={styles.link}>
                  {info.phone.display}
                </a>
              </li>
            )}
            {info.email && (
              <li>
                <a href={`mailto:${info.email}`} className={styles.link}>
                  {info.email}
                </a>
              </li>
            )}
          </ul>
        </div>
      )}
    </>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();
  const { status, data: info, error, retry } = useFetch(getInfo);

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          <div className={styles.brand}>
            <p className={styles.name}>Brew &amp; Bloom</p>
            <p className={styles.tagline}>
              Small-batch coffee and fresh bakes, served with care.
            </p>
          </div>

          <nav aria-labelledby="footer-explore">
            <h2 id="footer-explore" className={styles.heading}>
              Explore
            </h2>
            <ul role="list" className={styles.list}>
              {LINKS.map(({ label, href }) => (
                <li key={href}>
                  <a href={href} className={styles.link}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {info && <InfoColumns info={info} />}

          {status === "loading" && !error && (
            <>
              <FetchStatus
                status={status}
                loadingText="Loading opening hours and contact details…"
              />
              <InfoSkeleton />
            </>
          )}

          {error && (
            <div className={styles.infoStatus}>
              <FetchStatus
                status={status}
                error={error}
                retry={retry}
                errorText="Sorry, our opening hours and contact details didn't load."
                tone="dark"
              />
            </div>
          )}
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {year} Brew &amp; Bloom. All rights reserved.
          </p>
          <a href="#home" className={styles.link}>
            Back to top
          </a>
        </div>
      </div>
    </footer>
  );
}
