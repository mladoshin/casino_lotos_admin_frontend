import { Audio } from "./Audio";
import { Category } from "./Category";

export type Meditation = {
  id: number;
  name: string;
  description: string;
  categories: Category[];
  isSubscribed: boolean;
  audioLenght: number;
  photo: string;
  audios: Audio[];
};
