import {
  App,
  Button,
  Dropdown,
  MenuProps,
  Space,
  Table,
  Typography,
} from "antd";
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
    if (user?.role === UserRole.ADMIN || user?.role === UserRole.CASHIER) {
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

  const dropdownActionMenuItems = (item: any): MenuProps["items"] => {
    if (item.type === "bank" || item.type === "cashback") {
      return [
        {
          key: "0",
          label: "Подтвердить",
          onClick: () => confirmTransaction(item.id),
        },
        {
          key: "1",
          label: "Отклонить",
          danger: true,
          onClick: () => cancelTransaction(item.id),
        },
      ];
    } else if (item.type === "crypto" && item.status === "pending") {
      return [
        {
          key: "0",
          label: "Оплатить (тест)",
          onClick: () => {
            (window as any)
              .open(
                `https://app.cryptocloud.plus/payment/transaction/${item.invoice_id}`,
                "_blank"
              )
              .focus();
          },
        },
      ];
    } else {
      return [];
    }
  };

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
      width: 80
    },
    {
      title: "Реквизиты получателя",
      key: "payment_details",
      dataIndex: "payment_details",
      render: (paymentDetails) => <Text>{paymentDetails?.data}</Text>,
    },
    {
      title: "Сумма",
      key: "amount",
      dataIndex: "amount",
      width: 120
    },
    {
      title: "Баланс до",
      key: "balance_before",
      width: 120,
      render: (_t: any, item: any) => {
        let userBeforeBalance = item?.userAfterBalance - item?.amount;
        if (
          item.status === "cancelled" ||
          item.status === "waiting_confirmation"
        ) {
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
        item.status !== "waiting_confirmation" && (
          <Text>{item?.userAfterBalance}</Text>
        ),
    },
    {
      title: "Имя покупателя",
      key: "sender_name",
      dataIndex: "sender_name",
      width: 120
    },
    {
      title: "Статус",
      key: "status",
      dataIndex: "status",
      width: 'min-content'
    },
    {
      title: "",
      key: "action",
      fixed: "right",
      render: (_, item) => {
        if (item.status === "waiting_confirmation") {
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

export default IncomingTransactions;
