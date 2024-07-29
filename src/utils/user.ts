import { User } from "@types/entity/User";

export function getUserLabel(user: User) {
  const primaryInfo =
    user.email || user.telegram_username || user.phone || user.telegram_id;
  let fullname = "";
  if (user.name || user.surname) {
    fullname = `${user.name || ""} ${user.surname || ""}`;
  }

  let userLabel = primaryInfo;
  if (fullname) {
    userLabel = `${userLabel} (${fullname})`;
  }
  return userLabel;
}

export function getUserTelegramLabel(user: User) {
  let resultLabel = "N/A";
  if (user.telegram_id) {
    resultLabel = `${user.telegram_id}`;

    if (user.telegram_username) {
      resultLabel += ` (${user.telegram_username})`;
    }
  }

  return resultLabel
}
