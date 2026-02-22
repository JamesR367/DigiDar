import { useEffect, useState, useContext } from "react";
import "../../styles/EventModal.css";
import Cancel from "../../assets/cancel.svg?react";
import { TimePicker } from "react-accessible-time-picker";
import { dateContext } from "../Context";

interface User {
  id: number;
  username: string;
}

interface Event {
  title: string;
  start_datetime: string;
  end_datetime: string;
  all_day: boolean;
  user_id: number;
}

interface EventModalProps {
  setOpenModal: (OpenModal: boolean) => void;
}

function EventModal({ setOpenModal }: EventModalProps) {
  const selectedDate = useContext(dateContext)!;
  const [userList, setUserList] = useState<User[]>([]);
  const [eventTitle, setEventTitle] = useState<string>("");
  const [isAllDay, setIsAllDay] = useState<boolean>(false);
  const [startTime, setStartTime] = useState({ hour: "00", minute: "00" });
  const [endTime, setEndTime] = useState({ hour: "00", minute: "00" });
  const [newEvent, setNewEvent] = useState<Event>({
    title: "",
    start_datetime: "",
    end_datetime: "",
    all_day: false,
    user_id: 0,
  });
  const [selectedUser, setSelectedUser] = useState<User>({
    id: 0,
    username: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:8001/users/");
        if (!response.ok) {
          throw new Error(`HTTP error: Status ${response.status}`);
        }
        const result = await response.json();
        setUserList(result);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };

    fetchData();
  }, []);

  const pushEvent = async (eventData: Event) => {
    try {
      const response = await fetch("http://localhost:8001/events/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error: Status ${response.status}`);
      }
      const result = await response.json();
      console.log("Event created:", result);
    } catch (err) {
      console.error("Failed to create event:", err);
    }
    setOpenModal(false);
  };

  console.log(newEvent);
  return (
    <div className="modal-background">
      <div className="modal-container">
        <div className="modal-header">
          <h1 className="modal-title">Add Event</h1>
          <Cancel className="back-button" onClick={() => setOpenModal(false)} />
        </div>
        <div className="body">
          <div className="time-pickers">
            <div className={`time-picker-group ${isAllDay ? "disabled" : ""}`}>
              <label>Start Time</label>
              <TimePicker
                value={startTime}
                onChange={setStartTime}
                minuteStep={1}
                disabled={isAllDay}
              />
            </div>
            <div className={`time-picker-group ${isAllDay ? "disabled" : ""}`}>
              <label>End Time</label>
              <TimePicker
                value={endTime}
                onChange={setEndTime}
                minuteStep={1}
                disabled={isAllDay}
              />
            </div>
            <div className="all-day-checkbox">
              <label>All Day</label>
              <input
                type="checkbox"
                checked={isAllDay}
                onChange={(e) => setIsAllDay(e.target.checked)}
              />
            </div>
          </div>
          <div className="right-panel">
            <div className="input-group">
              <label>Assign User</label>
              <select
                value={selectedUser.username}
                onChange={(e) => {
                  const user = userList.find(
                    (u) => u.username === e.target.value,
                  );
                  if (user) setSelectedUser(user);
                }}
              >
                <option value="" disabled>
                  Select a user
                </option>
                {userList.map((user: User) => (
                  <option key={user.id} value={user.username}>
                    {user.username}
                  </option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label>Event Title</label>
              <input
                type="text"
                placeholder="Enter event title"
                value={eventTitle}
                maxLength={50}
                onChange={(e) => setEventTitle(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="footer">
          <button
            className="create-button"
            onClick={() => {
              if (selectedUser.id === 0) {
                alert("Please select a user before creating an event.");
                return;
              }
              const date = selectedDate.toISODate();
              const eventData: Event = {
                title: eventTitle,
                start_datetime:
                  date + "T" + startTime.hour + ":" + startTime.minute + ":00",
                end_datetime:
                  date + "T" + endTime.hour + ":" + endTime.minute + ":00",
                all_day: isAllDay,
                user_id: selectedUser.id,
              };
              pushEvent(eventData);
            }}
          >
            Create Event
          </button>
        </div>
      </div>
    </div>
  );
}

export default EventModal;
