const EMAIL_RE = /^\S+@\S+\.\S+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const MAX_NAME = 100;
const MAX_MESSAGE = 1000;

const isText = (value) => typeof value === "string" && value.trim() !== "";

// "2026-10-30" -> local Date at midnight, or null if not a real calendar date
function parseDate(value) {
  if (typeof value !== "string" || !DATE_RE.test(value)) return null;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const real =
    date.getFullYear() === y &&
    date.getMonth() === m - 1 &&
    date.getDate() === d;
  return real ? date : null;
}

// Accepts 4 or "4"; returns the integer or null
function parseGuests(value) {
  if (typeof value === "string" && /^\d+$/.test(value.trim()))
    return Number(value);
  return Number.isInteger(value) ? value : null;
}

/**
 * Validates a booking against the cafe's opening hours. Shared by the API and the
 * booking form so both apply the same rules.
 * Returns { errors } (field -> message) when invalid, otherwise { booking } with cleaned values.
 * Dates and times are interpreted in the local time zone of whoever runs it.
 * Options: `now` (for tests) and `formatTime` to show "07:00" as e.g. "7:00 AM" in messages.
 */
export function validateBooking(
  body,
  info,
  { now = new Date(), formatTime = (hhmm) => hhmm } = {},
) {
  const input = body && typeof body === "object" ? body : {};
  const errors = {};
  const { minGuests, maxGuests } = info.booking;

  const name = isText(input.name) ? input.name.trim() : "";
  if (!name) errors.name = "Name is required.";
  else if (name.length > MAX_NAME)
    errors.name = `Name must be ${MAX_NAME} characters or fewer.`;

  const email = typeof input.email === "string" ? input.email.trim() : "";
  if (!email) errors.email = "Email is required.";
  else if (!EMAIL_RE.test(email))
    errors.email = "Email must be a valid address, like name@example.com.";

  const date = parseDate(input.date);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!isText(input.date)) errors.date = "Date is required.";
  else if (!date)
    errors.date = "Date must be a real date in YYYY-MM-DD format.";
  else if (date < today) errors.date = "Date must be in the future.";

  const time = typeof input.time === "string" ? input.time.trim() : "";
  if (!time) errors.time = "Time is required.";
  else if (!TIME_RE.test(time))
    errors.time = "Time must be in 24-hour HH:MM format.";
  else if (date && !errors.date) {
    const hours = info.hours.find(({ days }) => days.includes(date.getDay()));
    const [h, m] = time.split(":").map(Number);
    const start = new Date(date);
    start.setHours(h, m);
    if (!hours) errors.date = "We're closed on that day.";
    else if (time < hours.open || time >= hours.close)
      errors.time = `Time must be within opening hours (${formatTime(hours.open)}–${formatTime(hours.close)}) on that day.`;
    else if (start <= now)
      errors.time = "That time has already passed. Please choose a later time.";
  }

  const guests = parseGuests(input.guests);
  if (input.guests === undefined || input.guests === "")
    errors.guests = "Number of guests is required.";
  else if (guests === null || guests < minGuests || guests > maxGuests)
    errors.guests = `Guests must be a whole number from ${minGuests} to ${maxGuests}.`;

  const message =
    input.message === undefined || input.message === null ? "" : input.message;
  if (typeof message !== "string") errors.message = "Message must be text.";
  else if (message.length > MAX_MESSAGE)
    errors.message = `Message must be ${MAX_MESSAGE} characters or fewer.`;

  if (Object.keys(errors).length) return { errors };
  return {
    booking: {
      name,
      email,
      date: input.date,
      time,
      guests,
      message: message.trim(),
    },
  };
}
