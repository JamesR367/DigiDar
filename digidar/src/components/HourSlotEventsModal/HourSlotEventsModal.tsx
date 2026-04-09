import { useMemo, useState } from "react";
import "./HourSlotEventsModal.css";
import Cancel from "../../assets/cancel.svg?react";
import type { CalendarEvent } from "../../utils/Context";
import { formatTime } from "../DayView/DayUtils";

export type HourSlotEventsModalProps = {
  slotLabel: string;
  slotStart: Date;
  slotEnd: Date;
  events: CalendarEvent[];
  allDayEvents?: CalendarEvent[];
  onClose: () => void;
  onRequestEdit: (event: CalendarEvent) => void;
  onRequestDelete: (event: CalendarEvent) => Promise<void>;
};

function describeEventTime(event: CalendarEvent): string {
  if (event.all_day) return "All day";
  const start = new Date(event.start_datetime);
  const end = new Date(event.end_datetime);
  return `${formatTime(start)} – ${formatTime(end)}`;
}

export default function HourSlotEventsModal({
  slotLabel,
  slotStart,
  slotEnd,
  events,
  allDayEvents = [],
  onClose,
  onRequestEdit,
  onRequestDelete,
}: HourSlotEventsModalProps) {
  const [selectedId, setSelectedId] = useState<number | null>(
    events.length === 1 ? events[0]!.id : null,
  );
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [busyDeleteId, setBusyDeleteId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sortedEvents = useMemo(() => {
    return [...events].sort(
      (a, b) =>
        new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime(),
    );
  }, [events]);

  const selectedEvent = useMemo(() => {
    if (selectedId == null) return null;
    return sortedEvents.find((e) => e.id === selectedId) ?? null;
  }, [selectedId, sortedEvents]);

  const windowLabel = useMemo(() => {
    return `${formatTime(slotStart)} – ${formatTime(slotEnd)}`;
  }, [slotStart, slotEnd]);

  const handleConfirmDelete = async (event: CalendarEvent) => {
    setError(null);
    setBusyDeleteId(event.id);
    try {
      await onRequestDelete(event);
      setConfirmDeleteId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete event.");
    } finally {
      setBusyDeleteId(null);
    }
  };

  return (
    <div className="modal-background" onPointerDown={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className="modal-container hour-slot-modal">
        <div className="modal-header">
          <div>
            <h1 className="modal-title">{slotLabel}</h1>
            <div className="hour-slot-subtitle">{windowLabel}</div>
          </div>
          <Cancel className="back-button" onClick={onClose} />
        </div>

        {error && <div className="hour-slot-error">{error}</div>}

        {sortedEvents.length === 0 && allDayEvents.length === 0 ? (
          <div className="hour-slot-empty">No events in this hour.</div>
        ) : (
          <div className="hour-slot-body">
            {allDayEvents.length > 0 && (
              <div className="hour-slot-allday">
                <div className="hour-slot-section-title">All-day</div>
                <div className="hour-slot-list">
                  {allDayEvents.map((ev) => (
                    <button
                      key={ev.id}
                      type="button"
                      className="hour-slot-row"
                      onClick={() => {
                        setSelectedId(ev.id);
                        setConfirmDeleteId(null);
                      }}
                    >
                      <div className="hour-slot-row-title">{ev.title}</div>
                      <div className="hour-slot-row-time">All day</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {sortedEvents.length > 1 && (
              <div className="hour-slot-list">
                {sortedEvents.map((ev) => (
                  <button
                    key={ev.id}
                    type="button"
                    className={`hour-slot-row ${selectedId === ev.id ? "selected" : ""}`}
                    onClick={() => {
                      setSelectedId(ev.id);
                      setConfirmDeleteId(null);
                    }}
                  >
                    <div className="hour-slot-row-title">{ev.title}</div>
                    <div className="hour-slot-row-time">{describeEventTime(ev)}</div>
                  </button>
                ))}
              </div>
            )}

            <div className="hour-slot-summary">
              {(selectedEvent ??
                sortedEvents[0] ??
                allDayEvents.find((e) => e.id === selectedId) ??
                allDayEvents[0]) && (
                <>
                  <div className="hour-slot-summary-title">
                    {(
                      selectedEvent ??
                      sortedEvents[0] ??
                      allDayEvents.find((e) => e.id === selectedId) ??
                      allDayEvents[0]
                    )!.title}
                  </div>
                  <div className="hour-slot-summary-time">
                    {describeEventTime(
                      (selectedEvent ??
                        sortedEvents[0] ??
                        allDayEvents.find((e) => e.id === selectedId) ??
                        allDayEvents[0])!,
                    )}
                  </div>

                  <div className="hour-slot-actions">
                    <button
                      type="button"
                      className="create-button"
                      onClick={() =>
                        onRequestEdit(
                          (selectedEvent ??
                            sortedEvents[0] ??
                            allDayEvents.find((e) => e.id === selectedId) ??
                            allDayEvents[0])!,
                        )
                      }
                    >
                      Edit
                    </button>

                    {confirmDeleteId ===
                    (selectedEvent ??
                      sortedEvents[0] ??
                      allDayEvents.find((e) => e.id === selectedId) ??
                      allDayEvents[0])!.id ? (
                      <div className="hour-slot-confirm">
                        <div className="hour-slot-confirm-text">
                          Delete this event?
                        </div>
                        <div className="hour-slot-confirm-actions">
                          <button
                            type="button"
                            className="delete-button"
                            onClick={() =>
                              handleConfirmDelete(
                                (selectedEvent ??
                                  sortedEvents[0] ??
                                  allDayEvents.find((e) => e.id === selectedId) ??
                                  allDayEvents[0])!,
                              )
                            }
                            disabled={
                              busyDeleteId ===
                              (selectedEvent ??
                                sortedEvents[0] ??
                                allDayEvents.find((e) => e.id === selectedId) ??
                                allDayEvents[0])!.id
                            }
                          >
                            {busyDeleteId ===
                            (selectedEvent ??
                              sortedEvents[0] ??
                              allDayEvents.find((e) => e.id === selectedId) ??
                              allDayEvents[0])!.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                          <button
                            type="button"
                            className="create-button"
                            onClick={() => setConfirmDeleteId(null)}
                            disabled={
                              busyDeleteId ===
                              (selectedEvent ??
                                sortedEvents[0] ??
                                allDayEvents.find((e) => e.id === selectedId) ??
                                allDayEvents[0])!.id
                            }
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="delete-button"
                        onClick={() =>
                          setConfirmDeleteId(
                            (selectedEvent ??
                              sortedEvents[0] ??
                              allDayEvents.find((e) => e.id === selectedId) ??
                              allDayEvents[0])!.id,
                          )
                        }
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

