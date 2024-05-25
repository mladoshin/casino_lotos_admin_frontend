import { App, Button, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import axios from "axios";
import { useEffect, useState } from "react";
import { api, withCredentials } from "../services/api";
const { Text } = Typography;

const IncomingTransactions = () => {
  const [appState, setAppState] = useState();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const resp = await withCredentials((headers) =>
        api.get("admin/transactions", headers)
      );
      setAppState(resp.data.data);
    } catch (error) {
      console.log(error);
    }
  }

  async function confirmTransaction(transactionId: string) {
    await withCredentials((headers) =>
      api.post(
        "admin/confirm-transaction",
        {
          transaction_id: transactionId,
        },
        headers
      )
    );
    await fetchData();
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
        } else if (item.type === "crypto" && item.status === "pending") {
          return (
            <Button
              onClick={() =>
                (window as any)
                  .open(
                    `https://app.cryptocloud.plus/payment/transaction/${item.invoice_id}`,
                    "_blank"
                  )
                  .focus()
              }
            >
              Оплатить (тест)
            </Button>
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

export default IncomingTransactions;
