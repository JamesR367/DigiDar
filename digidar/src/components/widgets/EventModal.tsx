import { useEffect, useRef, useState, useContext } from "react";
import "../../styles/EventModal.css";
import Cancel from "../../assets/cancel.svg?react";
import { TimePicker } from "react-accessible-time-picker";
import { dateContext } from "../../utils/Context";
import HandwritingCanvas, { type HandwritingCanvasHandle } from "./HandwritingCanvas";
import { parseHandwrittenEventImage } from "../../utils/ocrNlpClient";

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
  const [handwritingOpen, setHandwritingOpen] = useState(false);
  const [handwritingHasInk, setHandwritingHasInk] = useState(false);
  const [ocrBusy, setOcrBusy] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [ocrRawText, setOcrRawText] = useState<string>("");
  const canvasRef = useRef<HandwritingCanvasHandle | null>(null);
  const ocrAbortRef = useRef<AbortController | null>(null);
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

  useEffect(() => {
    return () => {
      ocrAbortRef.current?.abort();
    };
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
    } catch (err) {
      console.error("Failed to create event:", err);
    }
    setOpenModal(false);
  };

  const handleRecognize = async () => {
    if (!canvasRef.current) return;
    if (!handwritingHasInk) {
      setOcrError("Write something first.");
      return;
    }

    setOcrError(null);
    setOcrBusy(true);
    ocrAbortRef.current?.abort();
    const ac = new AbortController();
    ocrAbortRef.current = ac;

    try {
      const blob = await canvasRef.current.exportPngBlob();
      const parsed = await parseHandwrittenEventImage(blob, ac.signal);
      setOcrRawText(parsed.rawText || "");

      if (parsed.title) setEventTitle(parsed.title);
      if (parsed.startTime) setStartTime(parsed.startTime);
      if (parsed.endTime) setEndTime(parsed.endTime);
    } catch (e) {
      setOcrError(e instanceof Error ? e.message : "Failed to recognize handwriting.");
    } finally {
      setOcrBusy(false);
    }
  };

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
            <div className="input-group">
              <label>Handwritten input</label>
              <button
                type="button"
                onClick={() => setHandwritingOpen((v) => !v)}
                className="create-button"
                style={{ width: "100%", height: "48px" }}
              >
                {handwritingOpen ? "Hide handwriting" : "Write it instead"}
              </button>
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
            {handwritingOpen && (
              <div className="input-group">
                <label>Handwriting</label>
                <HandwritingCanvas
                  ref={canvasRef}
                  onHasInkChange={setHandwritingHasInk}
                  disabled={ocrBusy}
                />
                <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                  <button
                    type="button"
                    className="create-button"
                    style={{ width: "100%", height: "48px" }}
                    onClick={handleRecognize}
                    disabled={ocrBusy || !handwritingHasInk}
                  >
                    {ocrBusy ? "Recognizing..." : "Recognize"}
                  </button>
                </div>
                {ocrError && (
                  <div style={{ marginTop: 8, color: "#b00020", fontSize: 12 }}>
                    {ocrError}
                  </div>
                )}
                {ocrRawText && (
                  <div style={{ marginTop: 8, fontSize: 12, opacity: 0.9 }}>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>Detected text</div>
                    <div
                      style={{
                        whiteSpace: "pre-wrap",
                        border: "1px solid rgba(0,0,0,0.15)",
                        borderRadius: 8,
                        padding: 10,
                      }}
                    >
                      {ocrRawText}
                    </div>
                  </div>
                )}
              </div>
            )}
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
