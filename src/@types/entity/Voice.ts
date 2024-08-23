import { Audio } from "./Audio";

export type Voice = {
  id: number;
  name: string;
  photo: string;
  description: string;
  audios?: Audio[];
};
