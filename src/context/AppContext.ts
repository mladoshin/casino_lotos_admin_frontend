import { User } from "@customTypes/entity/User";
import { createContext } from "react";

export const AppContext = createContext<{ user: User | null }>({
  user: null,
});
