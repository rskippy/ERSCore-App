const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Returns "08:30 ET · D Mon YYYY" using today's date. */
export function getLastUpdatedLabel(): string {
  const now = new Date();
  return `08:30 ET · ${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
}
