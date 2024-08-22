import { Button, Space, Table, Typography } from "antd";
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
    if (user?.role === UserRole.ADMIN) {
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

  const columns: ColumnsType<any> = [
    {
      title: "Пользователь",
      dataIndex: "user",
      key: "user",
      render: (user) => <Text>{getUserLabel(user)}</Text>,
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
    },
    {
      title: "Метод",
      key: "method",
      dataIndex: "method",
    },
    {
      title: "Валюта",
      key: "currency",
      dataIndex: "currency",
    },
    {
      title: "Реквизиты",
      key: "currency",
      render: (_text, item) => <Text>{item.card || item.sbp || item.crypto_address}</Text>,

    },
    {
      title: "Статус",
      key: "status",
      dataIndex: "status",
    },
    {
      title: "Action",
      key: "action",
      render: (_, item) => {
        if (item.status === "pending" && user?.role === UserRole.ADMIN) {
          return (
            <Space>
              <Button onClick={() => cancelWithdraw(item.id)}>Отменить</Button>
              <Button onClick={() => confirmWithdraw(item.id)}>
                Подтвердить
              </Button>
            </Space>
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
    />
  );
};

export default WithdrawTransactions;
