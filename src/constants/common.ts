import {
  TransactionLogAction,
  TransactionLogType,
} from "@customTypes/enum/TransactionLog";

export enum GameCategory {
  ALL = "",
  MAIN = "main",
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
};

export const GameCategories = Object.entries(GameCategory).map(
  ([_key, value]) => ({
    label: GameCategoryLabel[value],
    value: value,
  })
);

export const depositModeOptions = [
  { label: "Ручной", value: "manual" },
  { label: "Автоматический", value: "auto" },
];

export const transactionLogActionLabels = {
  [TransactionLogAction.ACCEPT]: "Принято ✅",
  [TransactionLogAction.DECLINE]: "Отклонено ⛔️",
};

export const transactionLogTypeLabels = {
  [TransactionLogType.DEPOSIT]: "Депозит",
  [TransactionLogType.WITHDRAWAL]: "Вывод",
};
