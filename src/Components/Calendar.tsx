import { useState } from "react";
import { EventClickArg, CustomButtonInput } from "@fullcalendar/core/index.js";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import ruLocale from "@fullcalendar/core/locales/ru";
import Modal from "@mui/material/Modal";
import Room from "./Room";

export default function Calendar() {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleEventClick = (arg: EventClickArg) => {
    console.log(arg.event.title);
  };

  // const CustomToolbar: ToolbarInput = {
  //   center: "title",
  //   start: "",
  //   end: "today prev,next",
  // };

  const CustomButton: CustomButtonInput = {
    text: "Запланировать событие",
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
        events={[
          {
            title: "Conference 1",
            start: "2024-04-01T10:00:00",
            end: "2024-04-01T11:30:00",
          },
          {
            title: "Conference 2",
            start: "2024-04-01T15:00:00",
            end: "2024-04-01T16:00:00",
          },
        ]}
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
        <Room />
      </Modal>
    </>
  );
}
