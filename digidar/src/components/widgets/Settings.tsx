import { useEffect, useState } from "react";
import "../../styles/settings.css";
import Cancel from "../../assets/cancel.svg?react";

interface User {
  username: string;
  color: string;
}

interface SettingModalProps {
  setOpenModal: (OpenModal: boolean) => void;
}

const COLOR_OPTIONS = [
  { label: "Royal Blue", hex: "#4169E1" },
  { label: "Emerald Green", hex: "#2E8B57" },
  { label: "Coral Pink", hex: "#FF7F50" },
  { label: "Deep Orchid", hex: "#9932CC" },
  { label: "Goldenrod", hex: "#DAA520" },
  { label: "Teal", hex: "#008080" },
  { label: "Crimson", hex: "#DC143C" },
  { label: "Slate Gray", hex: "#708090" },
  { label: "Dark Orange", hex: "#FF8C00" },
  { label: "Medium Sea Green", hex: "#3CB371" },
  { label: "Steel Blue", hex: "#4682B4" },
  { label: "Indian Red", hex: "#CD5C5C" },
  { label: "Dark Turquoise", hex: "#00CED1" },
  { label: "Amethyst", hex: "#9966CC" },
  { label: "Olive Drab", hex: "#6B8E23" },
];

function CalendarSettings({ setOpenModal }: SettingModalProps) {
  var rootStyles = getComputedStyle(document.querySelector(":root")!)
    .getPropertyValue("--primary-rgb")
    .trim();

  const [primaryColor, setPrimaryColor] = useState(
    rootStyles ? rgbStringToHex(rootStyles) : "#ffffff",
  );
  const [userName, setUserName] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0].hex);

  const pushUser = async (userData: User) => {
    console.log(userData);
    try {
      const response = await fetch("http://localhost:8001/users/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error: Status ${response.status}`);
      }
      const result = await response.json();
      console.log("User created:", result);
    } catch (err) {
      console.error("Failed to create user:", err);
    }
    setOpenModal(false);
  };

  function rgbStringToHex(rgb: string): string {
    const parts = rgb
      .trim()
      .split(",")
      .map((v) => parseInt(v.trim(), 10));
    if (parts.length !== 3 || parts.some(isNaN)) return "#ffffff";
    return "#" + parts.map((v) => v.toString(16).padStart(2, "0")).join("");
  }

  function hexToRgbString(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
  }

  function handleColorChange(event: React.ChangeEvent<HTMLInputElement>) {
    const hex = event.target.value;
    setPrimaryColor(hex);
    document
      .querySelector<HTMLElement>(":root")!
      .style.setProperty("--primary-rgb", hexToRgbString(hex));
  }

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
            <button
              className="add-user-button"
              onClick={() => {
                const userData: User = {
                  username: userName,
                  color: selectedColor,
                };
                pushUser(userData);
              }}
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CalendarSettings;
