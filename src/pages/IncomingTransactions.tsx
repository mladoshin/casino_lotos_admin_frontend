import { App, Button, Space, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useContext, useEffect, useState } from "react";
import { api, withCredentials } from "../services/api";
import { AppContext } from "../context/AppContext";
import { UserRole } from "../routes/types";
import { getUserLabel } from "@utils/user";
const { Text } = Typography;

const IncomingTransactions = () => {
  const { user } = useContext(AppContext);
  const [appState, setAppState] = useState();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    let url = "";
    if (user?.role === UserRole.ADMIN) {
      url = "admin/transactions";
    } else if (user?.role === UserRole.MANAGER) {
      url = "manager/transactions";
    }

    try {
      const resp = await withCredentials((headers) => api.get(url, headers));
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

  async function cancelTransaction(transactionId: string) {
    await withCredentials((headers) =>
      api.post(
        "admin/cancel-transaction",
        {
          transaction_id: transactionId,
        },
        headers
      )
    );
    await fetchData();
  }

  const columns: ColumnsType<any> = [
    {
      title: "Пользователь",
      key: "user",
      dataIndex: "user",
      render: (user) => <Text>{getUserLabel(user)}</Text>,
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
      title: "Реквизиты получателя",
      key: "recipient_payment_info",
      dataIndex: "recipient_payment_info",
      render: (text) => <Text>{text || "–"}</Text>,
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
        // не показывать кнопки менеджерам
        if (user?.role !== UserRole.ADMIN) return null;

        if (
          (item.type === "bank" || item.type === "cashback") &&
          item.status === "waiting_confirmation"
        ) {
          return (
            <Space>
              <Button onClick={() => confirmTransaction(item.id)}>
                Подтвердить
              </Button>
              <Button onClick={() => cancelTransaction(item.id)}>
                Отклонить
              </Button>
            </Space>
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
