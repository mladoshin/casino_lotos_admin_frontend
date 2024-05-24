export enum GameCategory {
  ALL = "",
  TOP = "top",
  NEW = "new",
  BONUS = "bonus",
  DREAMDROP = "dreamdrop",
  FAST = "fast",
}

export const GameCategories = Object.keys(GameCategory).map(
  (cat: GameCategory) => ({
    label: cat,
    value: GameCategory[cat],
  })
);
