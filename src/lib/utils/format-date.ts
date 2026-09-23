const DATE_LOCALE = "en-US";

export function formatShortDate(iso: string): string {
  return new Intl.DateTimeFormat(DATE_LOCALE, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatDateTime(
  iso: string,
  style: "medium" | "full" = "medium",
): string {
  return new Intl.DateTimeFormat(DATE_LOCALE, {
    dateStyle: style,
    timeStyle: "short",
  }).format(new Date(iso));
}
