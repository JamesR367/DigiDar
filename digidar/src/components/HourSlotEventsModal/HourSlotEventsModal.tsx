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
  initialSelectedEventId?: number | null;
  onClose: () => void;
  onRequestEdit: (event: CalendarEvent) => void;
  onRequestDelete: (event: CalendarEvent) => Promise<void>;
};

function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className="row-icon-button"
      aria-label={label}
      title={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        fill="currentColor"
        d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm2.92 2.83H5v-.92l8.06-8.06.92.92L5.92 20.08zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        fill="currentColor"
        d="M6 7h12l-1 14H7L6 7zm3-3h6l1 2H8l1-2z"
      />
      <path
        fill="currentColor"
        d="M4 7h16v2H4V7z"
      />
    </svg>
  );
}

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
  initialSelectedEventId = null,
  onClose,
  onRequestEdit,
  onRequestDelete,
}: HourSlotEventsModalProps) {
  const [selectedId, setSelectedId] = useState<number | null>(() => {
    if (initialSelectedEventId != null) return initialSelectedEventId;
    if (events.length === 1) return events[0]!.id;
    if (allDayEvents.length === 1 && events.length === 0) return allDayEvents[0]!.id;
    return null;
  });
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
    return (
      sortedEvents.find((e) => e.id === selectedId) ??
      allDayEvents.find((e) => e.id === selectedId) ??
      null
    );
  }, [allDayEvents, selectedId, sortedEvents]);

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
            <div className="hour-slot-columns">
              <div className="hour-slot-left">
                {allDayEvents.length > 0 && (
                  <div className="hour-slot-allday">
                    <div className="hour-slot-section-title">All-day</div>
                    <div className="hour-slot-list">
                      {allDayEvents.map((ev) => (
                        <button
                          key={ev.id}
                          type="button"
                          className={`hour-slot-row ${selectedId === ev.id ? "selected" : ""}`}
                          onClick={() => {
                            setSelectedId(ev.id);
                            setConfirmDeleteId(null);
                          }}
                        >
                          <div className="hour-slot-row-main">
                            <div className="hour-slot-row-title">{ev.title}</div>
                            <div className="hour-slot-row-time">All day</div>
                          </div>
                          <div className="hour-slot-row-actions">
                            <IconButton label="Edit" onClick={() => onRequestEdit(ev)}>
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              label="Delete"
                              onClick={() => setConfirmDeleteId(ev.id)}
                            >
                              <TrashIcon />
                            </IconButton>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {sortedEvents.length > 0 && (
                  <div className="hour-slot-timed">
                    {allDayEvents.length > 0 && (
                      <div className="hour-slot-section-title">This hour</div>
                    )}
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
                          <div className="hour-slot-row-main">
                            <div className="hour-slot-row-title">{ev.title}</div>
                            <div className="hour-slot-row-time">{describeEventTime(ev)}</div>
                          </div>
                          <div className="hour-slot-row-actions">
                            <IconButton label="Edit" onClick={() => onRequestEdit(ev)}>
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              label="Delete"
                              onClick={() => setConfirmDeleteId(ev.id)}
                            >
                              <TrashIcon />
                            </IconButton>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {confirmDeleteId != null && (
                  <div className="hour-slot-confirm">
                    <div className="hour-slot-confirm-text">Delete this event?</div>
                    <div className="hour-slot-confirm-actions">
                      <button
                        type="button"
                        className="delete-button"
                        onClick={() => {
                          const ev =
                            sortedEvents.find((e) => e.id === confirmDeleteId) ??
                            allDayEvents.find((e) => e.id === confirmDeleteId);
                          if (ev) handleConfirmDelete(ev);
                        }}
                        disabled={busyDeleteId === confirmDeleteId}
                      >
                        {busyDeleteId === confirmDeleteId ? "Deleting..." : "Delete"}
                      </button>
                      <button
                        type="button"
                        className="create-button"
                        onClick={() => setConfirmDeleteId(null)}
                        disabled={busyDeleteId === confirmDeleteId}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="hour-slot-right">
                {selectedEvent ? (
                  <div className="hour-slot-summary">
                    <div className="hour-slot-summary-title">{selectedEvent.title}</div>
                    <div className="hour-slot-summary-time">
                      {describeEventTime(selectedEvent)}
                    </div>
                  </div>
                ) : (
                  <div className="hour-slot-empty">Tap an event to see details.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

