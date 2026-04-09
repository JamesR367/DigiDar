import type { CalendarEvent } from "./Context";

const EVENTS_BASE_URL = "http://localhost:8001/events/";

export type EventPatch = Partial<{
  title: string;
  start_datetime: string;
  end_datetime: string;
  all_day: boolean;
  user_id: number;
}>;

export async function patchEvent(
  eventId: number,
  patch: EventPatch,
): Promise<CalendarEvent> {
  const response = await fetch(`${EVENTS_BASE_URL}${eventId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });

  if (!response.ok) {
    throw new Error(`HTTP error: Status ${response.status}`);
  }

  return response.json();
}

export async function deleteEvent(eventId: number): Promise<void> {
  const response = await fetch(`${EVENTS_BASE_URL}${eventId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`HTTP error: Status ${response.status}`);
  }
}

