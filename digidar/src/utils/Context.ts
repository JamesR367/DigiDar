import { createContext } from "react";
import { DateTime } from "luxon";

export const dateContext = createContext<DateTime | null>(null);