import { App, Button, Table, Typography } from "antd";
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

const IncomingTransactions = () => {
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
      .get("admin/transactions", {
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

  async function confirmTransaction(transactionId: string) {
    await api.post(
      "admin/confirm-transaction",
      {
        transaction_id: transactionId,
      },
      apiAuthOptions
    );
    await fetchData(token);
  }

  /*
            "id": "d810b617-671d-4c99-9c58-ac7459d5000d",
            "invoice_id": "INV-1BAZX8G5",
            "timestamp": "2024-05-07T20:02:46.238Z",
            "type": "crypto",
            "method": "crypto",
            "amount": 100,
            "status": "pending"
  */
  const columns: ColumnsType<any> = [
    {
      title: "Id",
      dataIndex: "id",
      key: "id",
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: "Invoice Id",
      dataIndex: "invoice_id",
      key: "invoice_id",
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: "Пользователь",
      key: "user",
      dataIndex: "user",
      render: (user) => <Text>{user?.email}</Text>,
    },
    {
      title: "Дата создания",
      key: "timestamp",
      dataIndex: "timestamp",
      render: (text) => <Text>{new Date(text).toLocaleString()}</Text>,
    },
    {
      title: "Тип",
      key: "type",
      dataIndex: "type",
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: "Метод",
      key: "method",
      dataIndex: "method",
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
        if (item.type === "bank" && item.status === "pending") {
          return (
            <Button onClick={() => confirmTransaction(item.id)}>
              Подтвердить
            </Button>
          );
        }else if(item.type==="crypto" && item.status==="pending"){
          return (
            <Button onClick={() => (window as any).open(`https://app.cryptocloud.plus/payment/transaction/${item.invoice_id}`, '_blank').focus()}>
              Оплатить (тест)
            </Button>
          )
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

export default IncomingTransactions;
