import { Button, Dropdown, MenuProps, Space, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useContext, useEffect, useState } from "react";
import { api, withCredentials } from "../services/api";
import { AppContext } from "../context/AppContext";
import { UserRole } from "../routes/types";
import { getUserLabel } from "@utils/user";
const { Text } = Typography;

const WithdrawTransactions = () => {
  const { user } = useContext(AppContext);
  const [appState, setAppState] = useState();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    let url = "";
    if ([UserRole.ADMIN, UserRole.CASHIER].includes(user?.role as any)) {
      url = "admin/withdraw-history";
    } else if (user?.role === UserRole.MANAGER) {
      url = "manager/withdraw-history";
    }

    try {
      const resp = await withCredentials((headers) => api.get(url, headers));
      setAppState(resp.data.data);
    } catch (error) {
      console.log(error);
    }
  }

  async function confirmWithdraw(transactionId: string) {
    await withCredentials((headers) =>
      api.post(
        "admin/confirm-withdraw",
        {
          withdraw_transaction_id: transactionId,
        },
        headers
      )
    );
    await fetchData();
  }

  async function cancelWithdraw(transactionId: string) {
    await withCredentials((headers) =>
      api.post(
        "admin/cancel-withdraw",
        {
          withdraw_transaction_id: transactionId,
        },
        headers
      )
    );
    await fetchData();
  }

  const dropdownActionMenuItems = (item: any): MenuProps["items"] => {
    return [
      {
        key: "0",
        label: "Подтвердить",
        onClick: () => confirmWithdraw(item.id),
      },
      {
        key: "1",
        label: "Отклонить",
        danger: true,
        onClick: () => cancelWithdraw(item.id),
      },
    ];
  };

  const columns: ColumnsType<any> = [
    {
      title: "Пользователь",
      dataIndex: "user",
      key: "user",
      render: (user) => <Text>{getUserLabel(user)}</Text>,
    },
    {
      title: "Телефон",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Банк",
      dataIndex: "bank",
      key: "bank",
      width: 100,
    },
    {
      title: "Дата создания",
      key: "timestamp",
      dataIndex: "timestamp",
      render: (text) => <Text>{new Date(text).toLocaleString()}</Text>,
    },
    {
      title: "Сумма",
      key: "amount",
      dataIndex: "amount",
      width: 120,
    },
    {
      title: "Баланс до",
      key: "balance_before",
      width: 120,
      render: (_t: any, item: any) => {
        let userBeforeBalance = item.userAfterBalance + item.amount;
        if (item.status === "cancelled" || item.status === "pending") {
          userBeforeBalance = item.userAfterBalance;
        }
        return <Text>{userBeforeBalance < 0 ? "N/A" : userBeforeBalance}</Text>;
      },
    },
    {
      title: "Баланс после",
      key: "balance_after",
      width: 120,
      render: (_t: any, item: any) =>
        item.status !== "pending" && <Text>{item?.userAfterBalance}</Text>,
    },
    {
      title: "Метод",
      key: "method",
      dataIndex: "method",
      width: 90,
    },
    {
      title: "Валюта",
      key: "currency",
      dataIndex: "currency",
      width: 90,
    },
    {
      title: "Реквизиты",
      key: "requisites",
      width: 150,
      render: (_text, item) => (
        <Text>{item.card || item.sbp || item.crypto_address}</Text>
      ),
    },
    {
      title: "Статус",
      key: "status",
      dataIndex: "status",
    },
    {
      title: "",
      key: "action",
      fixed: "right",
      render: (_, item) => {
        // не показывать кнопки менеджерам и юзерам
        if (user?.role !== UserRole.ADMIN && user?.role !== UserRole.CASHIER) return null;
        
        if (item.status === "pending") {
          return (
            <Dropdown menu={{ items: dropdownActionMenuItems(item) }}>
              <Button onClick={(e) => e.preventDefault()}>Опции</Button>
            </Dropdown>
          );
        }
        return null;
      },
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={appState}
      rowKey={(meditation) => meditation.id}
      scroll={{ x: "max-content", y: 500 }}
    />
  );
};

export default WithdrawTransactions;
