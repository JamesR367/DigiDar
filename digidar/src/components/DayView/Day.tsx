import { useState, useContext, useEffect } from "react";
import "./day.css";
import Cancel from "../../assets/cancel.svg?react";
import EventModal from "../EventModal/EventModal";
import { dateContext, type CalendarEvent } from "../../utils/Context";
import HourSlotEventsModal from "../HourSlotEventsModal/HourSlotEventsModal";
import EditEventModal from "../EditEventModal/EditEventModal";
import { deleteEvent, patchEvent } from "../../utils/eventsApi";
import {
  type DayViewProps,
  EVENT_LAYOUT,
  layoutEvents,
  fetchDayEvents,
  formatTime,
} from "./DayUtils";

function DayView({ setView, setSelectedEvents }: DayViewProps) {
  const selectedDate = useContext(dateContext)!;
  const amHours = Array.from({ length: 12 }, (_, i) => i);
  const pmHours = Array.from({ length: 12 }, (_, i) => i + 12);
  const [modalOpen, setModalOpen] = useState(false);
  const [eventList, setEventList] = useState<CalendarEvent[]>([]);
  const [slotModalOpen, setSlotModalOpen] = useState(false);
  const [slotStart, setSlotStart] = useState<Date | null>(null);
  const [slotEnd, setSlotEnd] = useState<Date | null>(null);
  const [slotEvents, setSlotEvents] = useState<CalendarEvent[]>([]);
  const [slotAllDayEvents, setSlotAllDayEvents] = useState<CalendarEvent[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<CalendarEvent | null>(null);
  const [slotInitialSelectedId, setSlotInitialSelectedId] = useState<number | null>(null);

  const reloadEvents = async () => {
    const events = await fetchDayEvents(selectedDate.toISODate()!);
    setEventList(events);
    setSelectedEvents(events);
    return events;
  };

  useEffect(() => {
    reloadEvents().catch((err) => console.error("Failed to fetch events:", err));
  }, [selectedDate]);

  const openSlotModalForHour = (hour: number) => {
    const start = selectedDate.set({ hour, minute: 0, second: 0, millisecond: 0 });
    const end = start.plus({ hours: 1 });
    const slotStartDate = start.toJSDate();
    const slotEndDate = end.toJSDate();

    const overlaps = eventList.filter((ev) => {
      if (ev.all_day) return false;
      const evStart = new Date(ev.start_datetime).getTime();
      const evEnd = new Date(ev.end_datetime).getTime();
      return evStart < slotEndDate.getTime() && evEnd > slotStartDate.getTime();
    });

    const allDay = eventList.filter((ev) => ev.all_day);

    setSlotStart(slotStartDate);
    setSlotEnd(slotEndDate);
    setSlotEvents(overlaps);
    setSlotAllDayEvents(allDay);
    setSlotInitialSelectedId(null);
    setSlotModalOpen(true);
  };

  const openSlotModalForEvent = (ev: CalendarEvent) => {
    const start = new Date(ev.start_datetime);
    setSlotInitialSelectedId(ev.id);
    openSlotModalForHour(start.getHours());
  };

  const renderHalfDay = (hours: number[]) => {
    const firstHour = hours[0];
    const lastHour = hours[hours.length - 1] + 1;
    const totalMinutes = (lastHour - firstHour) * 60;

    const visibleEvents = eventList.filter((event) => {
      const startHour = new Date(event.start_datetime).getHours();
      const endHour = new Date(event.end_datetime).getHours();
      const endMinute = new Date(event.end_datetime).getMinutes();
      return (
        startHour < lastHour &&
        (endHour > firstHour || (endHour === firstHour && endMinute > 0))
      );
    });

    const positioned = layoutEvents(visibleEvents);

    const {
      LEFT_OFFSET_PCT,
      TOTAL_WIDTH_PCT,
      TIME_LABEL_WIDTH_PCT,
      INSET_PCT,
    } = EVENT_LAYOUT;
    const usableWidth = TOTAL_WIDTH_PCT - TIME_LABEL_WIDTH_PCT;

    return (
      <div className="half-day-wrapper">
        <div className="hour-list">
          {hours.map((hour) => {
            const label = selectedDate.set({ hour, minute: 0 });
            return (
              <div
                key={hour}
                className="hour-slot"
                role="button"
                tabIndex={0}
                onClick={() => openSlotModalForHour(hour)}
                onPointerDown={(e) => {
                  if (e.pointerType === "pen") openSlotModalForHour(hour);
                }}
              >
                <span className="time-label">{label.toFormat("h a")}</span>
                <div
                  className={`event-area ${hour % 2 === 0 ? "even-hour" : "odd-hour"}`}
                />
              </div>
            );
          })}
        </div>
        <div className="event-layer">
          {positioned.map(({ event, column, totalColumns }) => {
            const start = new Date(event.start_datetime);
            const end = new Date(event.end_datetime);

            const startMinutes =
              (start.getHours() - firstHour) * 60 + start.getMinutes();
            const endMinutes =
              (end.getHours() - firstHour) * 60 + end.getMinutes();
            const clampedStart = Math.max(0, startMinutes);
            const clampedEnd = Math.min(totalMinutes, endMinutes);

            const topPct = (clampedStart / totalMinutes) * 100;
            const heightPct =
              ((clampedEnd - clampedStart) / totalMinutes) * 100;

            const colWidth = usableWidth / totalColumns;
            const leftPct =
              LEFT_OFFSET_PCT + TIME_LABEL_WIDTH_PCT + column * colWidth;

            return (
              <div
                key={event.id}
                className="calendar-event"
                style={{
                  top: `calc(${topPct}% + 1px)`,
                  height: `calc(${heightPct}% - 2px)`,
                  left: `${leftPct + INSET_PCT}%`,
                  width: `${colWidth - INSET_PCT * 2 - 0.3}%`,
                  borderLeftColor: event.color,
                }}
                role="button"
                tabIndex={0}
                onClick={() => openSlotModalForEvent(event)}
                onPointerDown={(e) => {
                  if (e.pointerType === "pen") openSlotModalForEvent(event);
                }}
              >
                <span className="calendar-event-title">{event.title}</span>
                <span className="calendar-event-time">
                  {event.all_day
                    ? "All day"
                    : `${formatTime(start)} – ${formatTime(end)}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div>
      {modalOpen && (
        <EventModal
          setOpenModal={setModalOpen}
          onEventSaved={() => reloadEvents()}
        />
      )}
      {slotModalOpen && slotStart && slotEnd && (
        <HourSlotEventsModal
          slotLabel={`${selectedDate.weekdayLong}, ${selectedDate.monthLong} ${selectedDate.day}, ${selectedDate.year}`}
          slotStart={slotStart}
          slotEnd={slotEnd}
          events={slotEvents}
          allDayEvents={slotAllDayEvents}
          initialSelectedEventId={slotInitialSelectedId}
          onClose={() => setSlotModalOpen(false)}
          onRequestEdit={(ev) => {
            setSlotModalOpen(false);
            setEventToEdit(ev);
            setEditModalOpen(true);
          }}
          onRequestDelete={async (ev) => {
            await deleteEvent(ev.id);
            const refreshed = await reloadEvents();
            const startMs = slotStart.getTime();
            const endMs = slotEnd.getTime();
            const nextOverlaps = refreshed
              .filter((e) => {
                if (e.all_day) return false;
                const es = new Date(e.start_datetime).getTime();
                const ee = new Date(e.end_datetime).getTime();
                return es < endMs && ee > startMs;
              });
            setSlotEvents(nextOverlaps);
            setSlotAllDayEvents(refreshed.filter((e) => e.all_day));
          }}
        />
      )}
      {editModalOpen && eventToEdit && (
        <EditEventModal
          event={eventToEdit}
          setOpenModal={setEditModalOpen}
          onSave={async (updates) => {
            await patchEvent(eventToEdit.id, updates);
            await reloadEvents();
          }}
        />
      )}
      <div className="day-view-container">
        <div className="day-header">
          <h3>{`${selectedDate.weekdayLong}, ${selectedDate.monthLong} ${selectedDate.day}, ${selectedDate.year}`}</h3>
          <div className="day-header-right-side">
            <button className="event-button" onClick={() => setModalOpen(true)}>
              Add Event
            </button>
            <Cancel className="back-button" onClick={() => setView("month")} />
          </div>
        </div>
        <div className="day-columns">
          <div className="column">{renderHalfDay(amHours)}</div>
          <div className="column">{renderHalfDay(pmHours)}</div>
        </div>
      </div>
    </div>
  );
}

export default DayView;
