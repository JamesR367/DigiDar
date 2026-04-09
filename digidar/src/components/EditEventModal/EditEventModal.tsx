import { useEffect, useState } from "react";
import "./EditEventModal.css";
import Cancel from "../../assets/cancel.svg?react";
import { TimePicker } from "react-accessible-time-picker";
import type { CalendarEvent } from "../../utils/Context";
import type { User } from "../../utils/types";
import { fetchUsers } from "../EventModal/EventModalUtils";

export type EditEventModalProps = {
  event: CalendarEvent;
  setOpenModal: (open: boolean) => void;
  onSave: (updates: {
    title: string;
    start_datetime: string;
    end_datetime: string;
    all_day: boolean;
    user_id: number;
  }) => Promise<void>;
};

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

function toTimeValue(d: Date): { hour: string; minute: string } {
  return { hour: pad2(d.getHours()), minute: pad2(d.getMinutes()) };
}

function setTimeOnIsoDate(isoDate: string, time: { hour: string; minute: string }) {
  return `${isoDate}T${time.hour}:${time.minute}:00`;
}

export default function EditEventModal({ event, setOpenModal, onSave }: EditEventModalProps) {
  const [userList, setUserList] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number>(event.user_id);
  const [title, setTitle] = useState<string>(event.title);
  const [isAllDay, setIsAllDay] = useState<boolean>(event.all_day);
  const start = new Date(event.start_datetime);
  const end = new Date(event.end_datetime);
  const [startTime, setStartTime] = useState(toTimeValue(start));
  const [endTime, setEndTime] = useState(toTimeValue(end));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers()
      .then((users) => setUserList(users))
      .catch((err) => console.error("Failed to fetch users:", err));
  }, []);

  const handleSave = async () => {
    setError(null);
    setBusy(true);
    try {
      const isoDate = event.start_datetime.toString().split("T")[0]!;
      const startIso = setTimeOnIsoDate(isoDate, startTime);
      const endIso = setTimeOnIsoDate(isoDate, endTime);

      await onSave({
        title,
        start_datetime: startIso,
        end_datetime: endIso,
        all_day: isAllDay,
        user_id: selectedUserId,
      });
      setOpenModal(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save event.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-background">
      <div className="modal-container edit-event-modal">
        <div className="modal-header">
          <h1 className="modal-title">Edit Event</h1>
          <Cancel className="back-button" onClick={() => setOpenModal(false)} />
        </div>

        {error && <div className="edit-event-error">{error}</div>}

        <div className="body">
          <div className="time-pickers">
            <div className={`time-picker-group ${isAllDay ? "disabled" : ""}`}>
              <label>Start Time</label>
              <TimePicker
                value={startTime}
                onChange={setStartTime}
                minuteStep={1}
                disabled={isAllDay || busy}
              />
            </div>
            <div className={`time-picker-group ${isAllDay ? "disabled" : ""}`}>
              <label>End Time</label>
              <TimePicker
                value={endTime}
                onChange={setEndTime}
                minuteStep={1}
                disabled={isAllDay || busy}
              />
            </div>
            <div className="all-day-checkbox">
              <label>All Day</label>
              <input
                type="checkbox"
                checked={isAllDay}
                onChange={(e) => setIsAllDay(e.target.checked)}
                disabled={busy}
              />
            </div>
          </div>

          <div className="right-panel">
            <div className="input-group">
              <label>Assign User</label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(Number(e.target.value))}
                disabled={busy}
              >
                {userList.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.username}
                  </option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label>Event Title</label>
              <input
                type="text"
                placeholder="Enter event title"
                value={title}
                maxLength={50}
                onChange={(e) => setTitle(e.target.value)}
                disabled={busy}
              />
            </div>
          </div>
        </div>

        <div className="footer">
          <button className="create-button" onClick={handleSave} disabled={busy}>
            {busy ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

