import { createContext } from "react";
import { User } from "../routes/types";

export const AppContext = createContext<{ user: User | null }>({
  user: null,
});
