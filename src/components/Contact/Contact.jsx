import { useRef, useState } from "react";
import { validateBooking } from "../../../shared/validateBooking.js";
import { createBooking, getInfo } from "../../api/client";
import { useFetch } from "../../hooks/useFetch";
import { formatDate, formatHours, formatTime } from "../../utils/format";
import EmptyState from "../EmptyState";
import FetchStatus from "../FetchStatus";
import Skeleton from "../Skeleton";
import styles from "./Contact.module.css";

const EMPTY = {
  name: "",
  email: "",
  date: "",
  time: "",
  guests: "2",
  message: "",
};
const FIELD_ORDER = Object.keys(EMPTY);

const FIELD_LABELS = {
  name: "Name",
  email: "Email",
  date: "Date",
  time: "Time",
  guests: "Guests",
  message: "Message",
};

function today() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

// Opening hours for a "YYYY-MM-DD" date, or null if closed that day
function hoursFor(info, yyyymmdd) {
  const [y, m, d] = yyyymmdd.split("-").map(Number);
  const day = new Date(y, m - 1, d).getDay();
  return info.hours.find(({ days }) => days.includes(day)) ?? null;
}

function timeHint(info, date) {
  if (!date) return "Choose a date to see that day's opening hours.";
  const hours = hoursFor(info, date);
  return hours
    ? `Open ${formatHours(hours)} on ${formatDate(date)}.`
    : `We're closed on ${formatDate(date)}.`;
}

function Field({ id, label, error, hint, children }) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.fieldLabel}>
        {label}
      </label>
      {hint && (
        <p id={`${id}-hint`} className={styles.hint}>
          {hint}
        </p>
      )}
      {children({
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy || undefined,
      })}
      {error && (
        <p id={`${id}-error`} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}

function BookingForm({ info }) {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ text: "", isError: false });
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef(null);

  const { minGuests, maxGuests } = info.booking;
  const guestOptions = Array.from(
    { length: maxGuests - minGuests + 1 },
    (_, i) => String(minGuests + i),
  );
  const dayHours = values.date ? hoursFor(info, values.date) : null;

  const update = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    // Clear this field's error once the user edits it
    setErrors(({ [name]: _cleared, ...rest }) => rest);
    // Empty the live region so the next message is announced even if identical
    setStatus({ text: "", isError: false });
  };

  // Show field errors, announce a summary and focus the first invalid field
  const showErrors = (found) => {
    setErrors(found);
    const invalid = FIELD_ORDER.filter((key) => found[key]);
    const names = invalid.map((key) => FIELD_LABELS[key]).join(", ");
    setStatus({
      text: `${invalid.length} ${invalid.length === 1 ? "field needs" : "fields need"} attention: ${names}.`,
      isError: true,
    });
    formRef.current.elements[invalid[0]]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    // Same rules as the API, so most mistakes are caught without a round trip
    const { errors: found } = validateBooking(values, info, { formatTime });
    if (found) return showErrors(found);

    setSubmitting(true);
    setStatus({ text: "Sending your booking…", isError: false });
    try {
      const { booking } = await createBooking({
        ...values,
        guests: Number(values.guests),
      });
      const guests = `${booking.guests} ${booking.guests === 1 ? "guest" : "guests"}`;
      setStatus({
        text: `Thanks, ${booking.name}! Your table for ${guests} on ${formatDate(booking.date)} at ${formatTime(booking.time)} is booked. We'll confirm by email.`,
        isError: false,
      });
      setValues(EMPTY);
    } catch (err) {
      if (err.status === 422 && err.body?.errors) {
        showErrors(err.body.errors);
      } else {
        setStatus({
          text: `Sorry, we couldn't send your booking. ${err.message}`,
          isError: true,
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      ref={formRef}
      className={styles.form}
      aria-labelledby="booking-heading"
      noValidate
      onSubmit={handleSubmit}
    >
      <h3 id="booking-heading" className={styles.subheading}>
        Book a table
      </h3>
      <Field id="contact-name" label="Name (required)" error={errors.name}>
        {(props) => (
          <input
            {...props}
            name="name"
            type="text"
            autoComplete="name"
            required
            value={values.name}
            onChange={update}
            className={styles.input}
          />
        )}
      </Field>

      <Field id="contact-email" label="Email (required)" error={errors.email}>
        {(props) => (
          <input
            {...props}
            name="email"
            type="email"
            autoComplete="email"
            required
            value={values.email}
            onChange={update}
            className={styles.input}
          />
        )}
      </Field>

      <div className={styles.row}>
        <Field id="contact-date" label="Date (required)" error={errors.date}>
          {(props) => (
            <input
              {...props}
              name="date"
              type="date"
              min={today()}
              required
              value={values.date}
              onChange={update}
              className={styles.input}
            />
          )}
        </Field>

        <Field
          id="contact-time"
          label="Time (required)"
          hint={timeHint(info, values.date)}
          error={errors.time}
        >
          {(props) => (
            <input
              {...props}
              name="time"
              type="time"
              min={dayHours?.open}
              max={dayHours?.close}
              step="900"
              required
              value={values.time}
              onChange={update}
              className={styles.input}
            />
          )}
        </Field>

        <Field id="contact-guests" label="Guests" error={errors.guests}>
          {(props) => (
            <select
              {...props}
              name="guests"
              value={values.guests}
              onChange={update}
              className={styles.input}
            >
              {guestOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          )}
        </Field>
      </div>

      <Field
        id="contact-message"
        label="Message (optional)"
        error={errors.message}
      >
        {(props) => (
          <textarea
            {...props}
            name="message"
            rows="4"
            value={values.message}
            onChange={update}
            className={styles.input}
          />
        )}
      </Field>

      {/* aria-disabled rather than disabled, so focus stays on the button */}
      <button
        type="submit"
        className={styles.submit}
        aria-disabled={submitting || undefined}
      >
        {submitting ? "Sending…" : "Request booking"}
      </button>

      {/* Always rendered so screen readers announce changes to it */}
      <p
        role="status"
        aria-atomic="true"
        className={`${styles.status} ${status.isError ? styles.statusError : ""}`}
      >
        {status.text}
      </p>
    </form>
  );
}

// Placeholder for the info column and booking form while info loads
function ContactSkeleton() {
  return (
    <div className={styles.grid} aria-hidden="true">
      <div className={styles.info}>
        {[2, 2, 2].map((lines, block) => (
          <div key={block}>
            <Skeleton variant="heading" width="45%" />
            {Array.from({ length: lines }, (_, i) => (
              <Skeleton key={i} width={i ? "60%" : "80%"} />
            ))}
          </div>
        ))}
      </div>
      <div className={styles.form}>
        <Skeleton variant="heading" width="40%" />
        {[0, 1, 2].map((field) => (
          <div key={field} className={styles.field}>
            <Skeleton width="30%" />
            <Skeleton variant="block" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Booking needs opening hours and guest limits; without them, point people to the phone
function BookingUnavailable({ info }) {
  return (
    <div className={styles.form}>
      <h3 className={styles.subheading}>Book a table</h3>
      <EmptyState title="Online booking isn't available right now">
        {info.phone
          ? `Call us on ${info.phone.display} to book a table.`
          : "Drop in and we'll find you a seat."}
      </EmptyState>
    </div>
  );
}

function ContactInfo({ info }) {
  const hasContact = info.phone || info.email;
  return (
    <div className={styles.info}>
      <div>
        <h3 className={styles.subheading}>Find us</h3>
        {info.address?.length > 0 ? (
          <address className={styles.address}>
            {info.address.map((line) => (
              <span key={line} className={styles.addressLine}>
                {line}
              </span>
            ))}
          </address>
        ) : (
          <p className={styles.muted}>Address coming soon.</p>
        )}
      </div>

      <div>
        <h3 className={styles.subheading}>Opening hours</h3>
        {info.hours?.length > 0 ? (
          <dl className={styles.hours}>
            {info.hours.map((hours) => (
              <div key={hours.label} className={styles.hoursRow}>
                <dt>{hours.label}</dt>
                <dd>{formatHours(hours)}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className={styles.muted}>Opening hours coming soon.</p>
        )}
      </div>

      {hasContact && (
        <div>
          <h3 className={styles.subheading}>Get in touch</h3>
          <ul role="list" className={styles.contactList}>
            {info.phone && (
              <li>
                Phone:{" "}
                <a href={info.phone.href} className={styles.link}>
                  {info.phone.display}
                </a>
              </li>
            )}
            {info.email && (
              <li>
                Email:{" "}
                <a href={`mailto:${info.email}`} className={styles.link}>
                  {info.email}
                </a>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function Contact() {
  const { status, data: info, error, retry } = useFetch(getInfo);
  const canBook = info?.hours?.length > 0 && info?.booking;

  return (
    <section
      id="contact"
      className={styles.contact}
      aria-labelledby="contact-heading"
      aria-busy={status === "loading"}
    >
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.label}>Contact</p>
          <h2 id="contact-heading" className={styles.heading}>
            Visit or book a table
          </h2>
          <p className={styles.intro}>
            Drop in any time, or save a spot for brunch with friends.
          </p>
        </header>

        <FetchStatus
          status={status}
          error={error}
          retry={retry}
          loadingText="Loading opening hours and booking details…"
          errorText="Sorry, our opening hours and booking form didn't load."
        />

        {status === "loading" && !error && <ContactSkeleton />}

        {info && (
          <div className={styles.grid}>
            <ContactInfo info={info} />
            {canBook ? (
              <BookingForm info={info} />
            ) : (
              <BookingUnavailable info={info} />
            )}
          </div>
        )}
      </div>
    </section>
  );
}
