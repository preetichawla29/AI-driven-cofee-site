import { useCallback, useEffect, useId, useRef, useState } from "react";
import { getGallery } from "../../api/client";
import { useFetch } from "../../hooks/useFetch";
import EmptyState from "../EmptyState";
import FetchStatus from "../FetchStatus";
import Skeleton from "../Skeleton";
import styles from "./Gallery.module.css";

const SKELETON_SLIDES = 3;

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function ChevronIcon({ direction }) {
  return (
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
      <path d={direction === "prev" ? "M15 18l-6-6 6-6" : "M9 6l6 6-6 6"} />
    </svg>
  );
}

/**
 * Scroll-snap carousel: swipe or scroll sideways, use the arrow buttons, or
 * focus the track and use the arrow keys. No autoplay, so nothing moves on its own.
 */
function PhotoCarousel({ photos }) {
  const trackRef = useRef(null);
  const trackId = useId();
  const [view, setView] = useState({
    first: 0,
    visible: 1,
    atStart: true,
    atEnd: false,
  });

  // Work out which slides are showing from the scroll position
  const measure = useCallback(() => {
    const track = trackRef.current;
    const slide = track?.firstElementChild;
    if (!slide) return;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const step = slide.offsetWidth + gap;
    setView({
      first: Math.round(track.scrollLeft / step),
      visible: Math.max(1, Math.round((track.clientWidth + gap) / step)),
      atStart: track.scrollLeft <= 1,
      atEnd: track.scrollLeft + track.clientWidth >= track.scrollWidth - 1,
    });
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    let frame;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    measure();
    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [measure, photos]);

  const move = (direction) => {
    const track = trackRef.current;
    const slide = track.firstElementChild;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    track.scrollBy({
      left: direction * (slide.offsetWidth + gap),
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  };

  const last = Math.min(view.first + view.visible, photos.length);
  const position =
    view.visible > 1
      ? `Showing photos ${view.first + 1}–${last} of ${photos.length}`
      : `Showing photo ${view.first + 1} of ${photos.length}`;
  const showControls = !(view.atStart && view.atEnd);

  return (
    <div className={styles.carousel}>
      <div
        ref={trackRef}
        id={trackId}
        className={styles.track}
        role="group"
        aria-roledescription="carousel"
        aria-label="Photos of the cafe"
        // Focusable so keyboard users can scroll it with the arrow keys
        tabIndex={0}
      >
        {photos.map(({ id, src, alt, caption, width, height }, i) => (
          <figure
            key={id}
            className={styles.slide}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${photos.length}`}
          >
            <div className={styles.tile}>
              <img
                src={src}
                alt={alt}
                className={styles.image}
                width={width}
                height={height}
                loading="lazy"
              />
            </div>
            {caption && (
              <figcaption className={styles.caption}>{caption}</figcaption>
            )}
          </figure>
        ))}
      </div>

      {showControls && (
        <div className={styles.controls}>
          {/* Announced politely as the visible photos change */}
          <p className={styles.position} role="status">
            {position}
          </p>
          <div className={styles.buttons}>
            <button
              type="button"
              className={styles.arrow}
              aria-controls={trackId}
              aria-label="Previous photo"
              aria-disabled={view.atStart || undefined}
              onClick={() => !view.atStart && move(-1)}
            >
              <ChevronIcon direction="prev" />
            </button>
            <button
              type="button"
              className={styles.arrow}
              aria-controls={trackId}
              aria-label="Next photo"
              aria-disabled={view.atEnd || undefined}
              onClick={() => !view.atEnd && move(1)}
            >
              <ChevronIcon direction="next" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Gallery() {
  const { status, data, error, retry } = useFetch(getGallery);
  const photos = data?.photos ?? [];

  return (
    <section
      id="gallery"
      className={styles.gallery}
      aria-labelledby="gallery-heading"
      aria-busy={status === "loading"}
    >
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.label}>Gallery</p>
          <h2 id="gallery-heading" className={styles.heading}>
            A peek inside
          </h2>
          <p className={styles.intro}>
            Fresh bakes, slow pours and the corners our regulars love.
          </p>
        </header>

        <FetchStatus
          status={status}
          error={error}
          retry={retry}
          loadingText="Loading photos…"
          errorText="Sorry, the photos didn't load."
        />

        {status === "loading" && !error && (
          // Same track layout as the carousel, so the page doesn't jump when photos arrive
          <div className={styles.track} aria-hidden="true">
            {Array.from({ length: SKELETON_SLIDES }, (_, i) => (
              <div key={i} className={styles.slide}>
                <Skeleton variant="tile" />
                <Skeleton width="70%" />
              </div>
            ))}
          </div>
        )}

        {data && photos.length === 0 && (
          <EmptyState title="No photos yet">
            We're still snapping pictures. Come and see the place in person!
          </EmptyState>
        )}

        {photos.length > 0 && <PhotoCarousel photos={photos} />}
      </div>
    </section>
  );
}
