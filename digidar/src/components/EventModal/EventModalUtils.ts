export interface User {
  id: number;
  username: string;
  color: string;
}

interface Event {
  title: string;
  start_datetime: string;
  end_datetime: string;
  all_day: boolean;
  user_id: number;
  user_color: string;
}

export interface EventModalProps {
  setOpenModal: (OpenModal: boolean) => void;
  onEventSaved?: () => void | Promise<void>;
}

export async function fetchUsers(): Promise<User[]> {
  const response = await fetch("http://localhost:8001/users/");
  if (!response.ok) {
    throw new Error(`HTTP error: Status ${response.status}`);
  }
  return response.json();
}

export async function pushEvent(eventData: Event): Promise<void> {
  const response = await fetch("http://localhost:8001/events/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(eventData),
  });
  if (!response.ok) {
    throw new Error(`HTTP error: Status ${response.status}`);
  }
}

export function buildEventData(
  date: string,
  title: string,
  startTime: { hour: string; minute: string },
  endTime: { hour: string; minute: string },
  isAllDay: boolean,
  user: User,
): Event {
  return {
    title,
    start_datetime: `${date}T${startTime.hour}:${startTime.minute}:00`,
    end_datetime: `${date}T${endTime.hour}:${endTime.minute}:00`,
    all_day: isAllDay,
    user_id: user.id,
    user_color: user.color,
  };
}