import { useState } from "react";
import { EventClickArg, CustomButtonInput, EventSourceInput } from "@fullcalendar/core/index.js";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import ruLocale from "@fullcalendar/core/locales/ru";
import Modal from "@mui/material/Modal";
import Room from "./Room";

const SCHEDULE_EVENT = "Запланировать событие"

export type CalendarEvent = {
  title: string
  start: string
  end: string
}

export default function Calendar() {
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleEventClick = (arg: EventClickArg) => {

  };

  const CustomButton: CustomButtonInput = {
    text: SCHEDULE_EVENT,
    click: handleOpen,
  };

  return (
    <>
      <FullCalendar
        firstDay={1}
        customButtons={{ addMeeting: CustomButton }}
        headerToolbar={{
          start: "addMeeting",
          center: "title",
          end: "today prev,next",
        }}
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale={ruLocale}
        events={{ events }}
        displayEventTime={true}
        displayEventEnd={true}
        eventClick={handleEventClick}
      />
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Room addEvents={setEvents} />
      </Modal>
    </>
  );
}