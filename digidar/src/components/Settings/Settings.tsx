import { useState } from "react";
import "./settings.css";
import Cancel from "../../assets/cancel.svg?react";
import type { User, SettingModalProps } from "./SettingsUtils";
import {
  COLOR_OPTIONS,
  rgbStringToHex,
  hexToRgbString,
  pushUser,
} from "./SettingsUtils";

function CalendarSettings({ setOpenModal }: SettingModalProps) {
  const rootStyles = getComputedStyle(document.querySelector(":root")!)
    .getPropertyValue("--primary-rgb")
    .trim();

  const [primaryColor, setPrimaryColor] = useState(
    rootStyles ? rgbStringToHex(rootStyles) : "#ffffff",
  );
  const [userName, setUserName] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0].hex);

  function handleColorChange(event: React.ChangeEvent<HTMLInputElement>) {
    const hex = event.target.value;
    setPrimaryColor(hex);
    document
      .querySelector<HTMLElement>(":root")!
      .style.setProperty("--primary-rgb", hexToRgbString(hex));
  }

  const handleAddUser = async () => {
    const userData: User = { username: userName, color: selectedColor };
    try {
      await pushUser(userData);
    } catch (err) {
      console.error("Failed to create user:", err);
    }
    setOpenModal(false);
  };

  return (
    <div className="modal-background">
      <div className="modal-container">
        <div className="modal-header">
          <h2 className="modal-title">Settings</h2>
          <Cancel className="back-button" onClick={() => setOpenModal(false)} />
        </div>
        <div className="body">
          <div className="color-picker-container">
            <p>Color Picker</p>
            <input
              className="color-input"
              type="color"
              value={primaryColor}
              onChange={handleColorChange}
            />
          </div>
          <div className="add-user-container">
            <p className="add-user-label">Add Users</p>
            <div className="add-user-input-row">
              <input
                className="add-user-name-input"
                type="text"
                placeholder="Username"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
              <select
                className="user-color-selection"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                style={{ borderLeft: `3px solid ${selectedColor}` }}
              >
                {COLOR_OPTIONS.map(({ label, hex }) => (
                  <option key={hex} value={hex} style={{ color: hex }}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <button className="add-user-button" onClick={handleAddUser}>
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CalendarSettings;
