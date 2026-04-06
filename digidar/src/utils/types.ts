export interface User {
  id: number;
  username: string;
  color: string;
}

export interface Event {
  title: string;
  start_datetime: string;
  end_datetime: string;
  all_day: boolean;
  user_id: number;
  user_color: string;
}