export const MEETUP_NAME = "Supabase × Clerk × Devin Peshawar Meetup";
export const MEETUP_SHORT = "Peshawar Meetup";
export const MEETUP_EYEBROW = "Supabase × Clerk × Devin";
export const MEETUP_DATE = "September 25, 2026";
export const MEETUP_CITY = "Peshawar";

export function getLumaEventUrl() {
  const url = process.env.NEXT_PUBLIC_LUMA_EVENT_URL?.trim();
  return url && url.startsWith("https://") ? url : "";
}
