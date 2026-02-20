import React from "react";
import "../../styles/EventModal.css";
import Cancel from "../../assets/cancel.svg?react";

interface EventModalProps {
  setOpenModal: (OpenModal: boolean) => void;
}

function EventModal({ setOpenModal }: EventModalProps) {
  return (
    <div className="modalBackground">
      <div className="modalContainer">
        <div className="back-button-container">
          <Cancel
            className="back-button"
            onClick={() => {
              setOpenModal(false);
            }}
          />
        </div>
        <div className="title">
          <h1>Add Event</h1>
        </div>
        <div className="body"></div>
        <div className="footer">
          <button
            className="create-button"
            onClick={() => {
              setOpenModal(false);
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
