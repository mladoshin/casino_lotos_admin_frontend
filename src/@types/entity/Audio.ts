import { Voice } from "./Voice";

export type Audio = {
  id?: number;
  link: string;
  meditation_id?: number;
  voice_id?: number;
  voice?: Voice
};
