import { App, Button, Space, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import axios from "axios";
import { useEffect, useState } from "react";
const { Text } = Typography;

const api = axios.create({
  baseURL: "http://95.213.173.58:3000",
  headers: {
    Authorization: `Bearer ${import.meta.env.VITE_BEARER_TOKEN}`,
  },
});

const WithdrawTransactions = () => {
  const [token, setToken] = useState("");
  const [appState, setAppState] = useState();
  const apiAuthOptions = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const [loading, setLoading] = useState(false);
  const { notification } = App.useApp();

  useEffect(() => {
    api
      .post("auth/sign", {
        email: import.meta.env.VITE_EMAIL,
        password: import.meta.env.VITE_PASS,
      })
      .then((res) => setToken(res.data.tokens.accessToken));
  }, []);

  async function fetchData(token: string) {
    api
      .get("admin/withdraw-history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((resp) => {
        setAppState(resp.data.data);
      });
  }

  useEffect(() => {
    if (!token) return;
    fetchData(token);
  }, [token]);

  async function confirmWithdraw(transactionId: string) {
    await api.post(
      "admin/confirm-withdraw",
      {
        withdraw_transaction_id: transactionId,
      },
      apiAuthOptions
    );
    await fetchData(token);
  }

  async function cancelWithdraw(transactionId: string) {
    await api.post(
      "admin/cancel-withdraw",
      {
        withdraw_transaction_id: transactionId,
      },
      apiAuthOptions
    );
    await fetchData(token);
  }

  /*
      "id": "string",
      "user": "string",
      "timestamp": "2024-05-16T21:52:17.945Z",
      "amount": 0,
      "status": "success"
  */
  const columns: ColumnsType<any> = [
    {
      title: "Id",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Пользователь",
      dataIndex: "user",
      key: "user",
      render: (user) => <Text>{user.email}</Text>,
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
      title: "Статус",
      key: "status",
      dataIndex: "status",
    },
    {
      title: "Action",
      key: "action",
      render: (_, item) => {
        if (item.status === "pending") {
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
