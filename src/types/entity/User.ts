import { UserRole } from "../enum/UserRole";

export interface User {
  id: string;
  username: string;
  name: string;
  surname: string;
  dob: string;
  gender: string;
  country: string;
  city: string;
  address: string;
  zip: string;
  balance: number;
  role: UserRole;
  earned: number;
  phone: string;
  email: string;
  isBan: boolean;
  telegram_id: number | null;
  telegram_username: string | null;
  bonusAutoActivation: boolean;
}
