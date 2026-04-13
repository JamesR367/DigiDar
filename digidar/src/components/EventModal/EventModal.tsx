import { useEffect, useRef, useState, useContext } from "react";
import "./EventModal.css";
import Cancel from "../../assets/cancel.svg?react";
import { TimePicker } from "react-accessible-time-picker";
import { dateContext } from "../../utils/Context";
import HandWritingCanvas from "../HandWritingCanvas/HandwritingCanvas";
import type { HandwritingCanvasHandle } from "../HandWritingCanvas/HandWritingCanvasUtils";
import { parseHandwrittenEventImage } from "../../utils/ocrNlpClient";
import type { User } from "../../utils/types";

import {
  type EventModalProps,
  fetchUsers,
  pushEvent,
  buildEventData,
} from "./EventModalUtils";

function EventModal({ setOpenModal, onEventSaved }: EventModalProps) {
  const selectedDate = useContext(dateContext)!;
  const [userList, setUserList] = useState<User[]>([]);
  const [eventTitle, setEventTitle] = useState<string>("");
  const [isAllDay, setIsAllDay] = useState<boolean>(false);
  const [startTime, setStartTime] = useState({ hour: "00", minute: "00" });
  const [endTime, setEndTime] = useState({ hour: "00", minute: "00" });
  const [handwritingHasInk, setHandwritingHasInk] = useState(false);
  const [ocrBusy, setOcrBusy] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [ocrRawText, setOcrRawText] = useState<string>("");
  const canvasRef = useRef<HandwritingCanvasHandle | null>(null);
  const ocrAbortRef = useRef<AbortController | null>(null);
  const [selectedUser, setSelectedUser] = useState<User>({
    id: 0,
    username: "",
    color: "",
  });
  const timePickerClasses = {
    popoverContent: "event-time-popover-content",
    popoverColumns: "event-time-popover-columns",
  };

  useEffect(() => {
    fetchUsers()
      .then((users) => setUserList(users))
      .catch((err) => console.error("Failed to fetch users:", err));
  }, []);

  useEffect(() => {
    return () => {
      ocrAbortRef.current?.abort();
    };
  }, []);

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
      setOcrError(
        e instanceof Error ? e.message : "Failed to recognize handwriting.",
      );
    } finally {
      setOcrBusy(false);
    }
  };

  const handleCreateEvent = async () => {
    if (selectedUser.id === 0) {
      alert("Please select a user before creating an event.");
      return;
    }
    const eventData = buildEventData(
      selectedDate.toISODate()!,
      eventTitle,
      startTime,
      endTime,
      isAllDay,
      selectedUser,
    );
    try {
      await pushEvent(eventData);
      await onEventSaved?.();
    } catch (err) {
      console.error("Failed to create event:", err);
    }
    setOpenModal(false);
  };

  return (
    <div className="modal-background">
      <div className="modal-container">
        <div className="modal-header">
          <h1 className="modal-title">Add Event</h1>
          <Cancel className="back-button" onClick={() => setOpenModal(false)} />
        </div>
        <div className="body">
          <div className="left-panel">
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
            <div className="input-group">
              <label>Assign User</label>
              <select
                value={selectedUser.username}
                onChange={(e) => {
                  const user = userList.find((u) => u.username === e.target.value);
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
            <div className="time-pickers">
              <div className={`time-picker-group ${isAllDay ? "disabled" : ""}`}>
                <label>Start Time</label>
                <TimePicker
                  value={startTime}
                  onChange={setStartTime}
                  minuteStep={1}
                  disabled={isAllDay}
                  classes={timePickerClasses}
                />
              </div>
              <div className={`time-picker-group ${isAllDay ? "disabled" : ""}`}>
                <label>End Time</label>
                <TimePicker
                  value={endTime}
                  onChange={setEndTime}
                  minuteStep={1}
                  disabled={isAllDay}
                  classes={timePickerClasses}
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
          </div>
          <div className="right-panel">
            <div className="input-group">
              <label>Handwriting</label>
              <HandWritingCanvas
                ref={canvasRef}
                width={460}
                height={210}
                onHasInkChange={setHandwritingHasInk}
                disabled={ocrBusy}
              />
              <div className="ocr-actions">
                <button
                  type="button"
                  className="create-button full-width-button"
                  onClick={handleRecognize}
                  disabled={ocrBusy || !handwritingHasInk}
                >
                  {ocrBusy ? "Recognizing..." : "Recognize"}
                </button>
              </div>
              {ocrError && <div className="ocr-error">{ocrError}</div>}
              {ocrRawText && (
                <div className="ocr-preview">
                  <div className="ocr-preview-title">Detected text</div>
                  <div className="ocr-preview-body">{ocrRawText}</div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="footer">
          <button className="create-button" onClick={handleCreateEvent}>
            Create Event
          </button>
        </div>
      </div>
    </div>
  );
}

export default EventModal;
