// "16:30" -> "4:30 PM" (or the visitor's local format)
export function formatTime(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return new Date(2000, 0, 1, h, m).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

// "2026-10-30" -> "Friday, October 30" (or the visitor's local format)
export function formatDate(yyyymmdd) {
  const [y, mo, d] = yyyymmdd.split("-").map(Number);
  return new Date(y, mo - 1, d).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

// { open: "07:00", close: "18:00" } -> "7:00 AM – 6:00 PM"
export const formatHours = ({ open, close }) =>
  `${formatTime(open)} – ${formatTime(close)}`;

// 4.2, "USD" -> "$4.20"
export const formatPrice = (amount, currency) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency }).format(
    amount,
  );
