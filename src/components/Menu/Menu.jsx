import { getMenu } from "../../api/client";
import { useFetch } from "../../hooks/useFetch";
import { formatPrice } from "../../utils/format";
import EmptyState from "../EmptyState";
import FetchStatus from "../FetchStatus";
import Skeleton from "../Skeleton";
import styles from "./Menu.module.css";

const SKELETON_CARDS = 3;
const SKELETON_ITEMS = 4;

function MenuSkeleton() {
  return (
    <div className={styles.grid} aria-hidden="true">
      {Array.from({ length: SKELETON_CARDS }, (_, card) => (
        <div key={card} className={styles.card}>
          <Skeleton variant="heading" width="40%" />
          <div className={styles.list}>
            {Array.from({ length: SKELETON_ITEMS }, (_, item) => (
              <div key={item}>
                <Skeleton width="75%" />
                <Skeleton width="90%" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Menu() {
  const { status, data, error, retry } = useFetch(getMenu);
  // Hide categories that have nothing in them
  const categories = data?.categories.filter(({ items }) => items.length) ?? [];

  return (
    <section
      id="menu"
      className={styles.menu}
      aria-labelledby="menu-heading"
      aria-busy={status === "loading"}
    >
      <div className={styles.inner}>
        <header className={styles.header}>
          <h2 id="menu-heading" className={styles.heading}>
            Our menu
          </h2>
          <p className={styles.intro}>
            Roasted in small batches and baked fresh each morning.
          </p>
        </header>

        <FetchStatus
          status={status}
          error={error}
          retry={retry}
          loadingText="Loading the menu…"
          errorText="Sorry, the menu didn't load."
        />

        {status === "loading" && !error && <MenuSkeleton />}

        {data && categories.length === 0 && (
          <EmptyState title="Our menu is being updated">
            Check back soon, or ask at the counter for today's coffee and bakes.
          </EmptyState>
        )}

        {categories.length > 0 && (
          <div className={styles.grid}>
            {categories.map(({ id, title, items }) => (
              <div key={id} className={styles.card}>
                <h3 className={styles.category}>{title}</h3>
                <ul role="list" className={styles.list}>
                  {items.map(({ id: itemId, name, description, price }) => (
                    <li key={itemId} className={styles.item}>
                      <div className={styles.row}>
                        <span className={styles.name}>{name}</span>
                        <span className={styles.price}>
                          {formatPrice(price, data.currency)}
                        </span>
                      </div>
                      <p className={styles.description}>{description}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
