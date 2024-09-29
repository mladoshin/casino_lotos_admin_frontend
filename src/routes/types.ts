import { GameCategory } from "../constants/common";

export interface Props {
  isAuth: boolean;
}

export type GameCategoryType = keyof typeof GameCategory;

export enum UserRole {
  ADMIN = "admin",
  MANAGER = "manager",
  CASHIER = 'cashier'
}
