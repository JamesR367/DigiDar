import { useState, useEffect } from "react";
import "./settings.css";
import Cancel from "../../assets/cancel.svg?react";
import type { SettingModalProps } from "./SettingsUtils";
import type { User } from "../../utils/types";
export type { User };
import {
  COLOR_OPTIONS,
  rgbStringToHex,
  hexToRgbString,
  pushUser,
  fetchUsers,
  deleteUser,
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

  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await fetchUsers();
        setUsers(data);
      } catch (err) {
        console.error("Failed to load users:", err);
      }
    };
    loadUsers();
  }, []);


  function handleColorChange(event: React.ChangeEvent<HTMLInputElement>) {
    const hex = event.target.value;
    setPrimaryColor(hex);
    document
      .querySelector<HTMLElement>(":root")!
      .style.setProperty("--primary-rgb", hexToRgbString(hex));
  }

  const handleAddUser = async () => {
    if (!userName.trim()) return;
    const userData: User = { id: 0, username: userName, color: selectedColor };
    try {
      await pushUser(userData);
      const updatedUsers = await fetchUsers();
      setUsers(updatedUsers);
      setUserName("");
    } catch (err) {
      console.error("Failed to create user:", err);
    }
    setOpenModal(false); //maybe delete
  };

  const handleDeleteUser = async (id: number) => {
    try {
      await deleteUser(id);
      setUsers(users.filter((user) => user.id !== id));
    } catch (err) {
      console.error("Failed to delete user:", err);
    }
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
        <div className="user-management-container">
            <p className="section-label">Current Users</p>
            <div className="user-list">
              {users.length === 0 ? (
                <p className="empty-msg">No users found.</p>
              ) : (
                users.map((user) => (
                  <div key={user.id} className="user-item">
                    <div className="user-info">
                      <span 
                        className="user-color-preview" 
                        style={{ backgroundColor: user.color }}
                      ></span>
                      <span className="user-name-text">{user.username}</span>
                    </div>
                    <button 
                      className="delete-user-btn"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
      </div>
    </div>
  );
}

export default CalendarSettings;
