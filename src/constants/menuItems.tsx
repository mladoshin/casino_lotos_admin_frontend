import { UsergroupAddOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";

type MenuItem = Required<MenuProps>["items"][number];

export function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: "group"
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    type,
  } as MenuItem;
}

export const adminMenuItems: MenuProps["items"] = [
  getItem("Дашборд", "/"),
  getItem("Уведомления", "/notifications"),
  getItem("Логи депозитов и выводов", "/transaction-logs"),
  getItem("Пользователи", "sub1", <UsergroupAddOutlined />, [
    getItem("Все пользователи", "/users"),
    getItem("Менеджеры", "/managers"),
    getItem("Кассиры", "/cashiers"),
    getItem("Заявки на вывод", "/withdraw-transactions"),
    getItem("Пополнения", "/incoming-transactions"),
    getItem("Финансовая статистика", "/financial-stats"),

  ]),
  getItem("Игры", "sub2", <UsergroupAddOutlined />, [
    getItem("Список игр", "/games"),
    getItem("История игр", "/gameHistory"),
    getItem("Расположение игр", "/game-placement"),
  ]),
  getItem("Настройки", "sub3", <UsergroupAddOutlined />, [
    getItem("Реквизиты", "/payment-details"),
    getItem("Аккаунт", "/account"),
    getItem("Конфигурация", "/casino-config"),

  ]),
];

export const managerMenuItems: MenuProps["items"] = [
  getItem("Уведомления", "/notifications"),
  getItem("Пользователи", "sub1", <UsergroupAddOutlined />, [
    getItem("Рефералы", "/users"),
    getItem("Заявки на вывод", "/withdraw-transactions"),
    getItem("Пополнения", "/incoming-transactions"),
    getItem("Реферальные ссылки", "/referral-invitations"),
    getItem("Финансовая статистика", "/financial-stats"),
  ]),
  getItem("Игры", "sub2", <UsergroupAddOutlined />, [
    getItem("Список игр", "/games"),
    getItem("История игр", "/gameHistory"),
    getItem("Настройки", "sub3", <UsergroupAddOutlined />, [
      getItem("Аккаунт", "/account"),
    ]),
  ]),
];

export const cashierMenuItems: MenuProps["items"] = [
  getItem("Уведомления", "/notifications"),
  getItem("Заявки на вывод", "/withdraw-transactions"),
  getItem("Пополнения", "/incoming-transactions")
];
