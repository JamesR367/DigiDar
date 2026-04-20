export interface User {
  id: number;
  username: string;
  color: string;
}

export interface SettingModalProps {
  setOpenModal: (OpenModal: boolean) => void;
}

export const COLOR_OPTIONS = [
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
  { label: "Firebrick", hex: "#B22222" },
  { label: "Dark Turquoise", hex: "#00CED1" },
  { label: "Amethyst", hex: "#9966CC" },
  { label: "Olive Drab", hex: "#6B8E23" },
];

export function rgbStringToHex(rgb: string): string {
  const parts = rgb
    .trim()
    .split(",")
    .map((v) => parseInt(v.trim(), 10));
  if (parts.length !== 3 || parts.some(isNaN)) return "#ffffff";
  return "#" + parts.map((v) => v.toString(16).padStart(2, "0")).join("");
}

export function hexToRgbString(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

export async function pushUser(userData: User): Promise<void> {
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
}

export async function fetchUsers(): Promise<User[]> {
  const response = await fetch("http://localhost:8001/users/");
  if (!response.ok) {
    throw new Error('Failed to fetch users: ${response.status}');
  }
  return await response.json();
}

export async function deleteUser(userId: number): Promise<void> {  

  const response = await fetch(`http://localhost:8001/users/${userId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Failed to delete user: ${response.status}`);
  }
  
  console.log(`User ${userId} deleted successfully`);
}