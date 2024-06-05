export enum GameCategory {
  ALL = "",
  MAIN="main",
  TOP = "top",
  NEW = "new",
  DISCOUNT = "discount",
  CARDS = "cards",
  LIVE = "live",
  FAST = "fast",
}

export const GameCategoryLabel = {
  [GameCategory.ALL]: "Все",
  [GameCategory.MAIN]: "Главная",
  [GameCategory.TOP]: "Лучшие",
  [GameCategory.NEW]: "Новые",
  [GameCategory.DISCOUNT]: "Акции",
  [GameCategory.CARDS]: "Карты",
  [GameCategory.LIVE]: "Лайв",
  [GameCategory.FAST]: "Быстрые",
}

export const GameCategories = Object.entries(GameCategory).map(
  ([_key, value]) => ({
    label: GameCategoryLabel[value],
    value: value
  })
);

console.log(GameCategories)