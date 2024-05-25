import { GameCategory } from "../constants/common";

export interface Props {
  isAuth: boolean;
}

export type GameCategoryType = keyof typeof GameCategory;

export enum UserRole {
  ADMIN = "admin",
  MANAGER = "manager",
}
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
  telegram_id: string;
  bonusAutoActivation: boolean;
}
