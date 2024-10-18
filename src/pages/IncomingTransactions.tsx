import {
  App,
  Button,
  DatePicker,
  Dropdown,
  MenuProps,
  Select,
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
import UserSelect from "components/UserSelect/UserSelect";
import useGetUsers from "../hooks/useGetUsers";
import dayjs from "dayjs";
import InlineText from "components/InlineText";
import { CurrencyFormatter } from "@utils/common";
import { User } from "@customTypes/entity/User";

const { Text } = Typography;
const { RangePicker } = DatePicker;

interface IncomingTransactionsProps {
  user?: User;
}

const IncomingTransactions = ({
  user: selectedUser,
}: IncomingTransactionsProps) => {
  const { user } = useContext(AppContext);
  const [appState, setAppState] = useState();
  const { users, loading: loadingUsres } = useGetUsers({ fetchOnMount: true });
  const [loading, setLoading] = useState<boolean>(false);

  const [filter, setFilter] = useState<any>({
    userId: null,
    date_begin: null,
    date_end: null,
    status: null,
    type: null,
  });

  useEffect(() => {
    fetchData();
  }, [selectedUser]);

  async function fetchData() {
    let url = "";
    if (user?.role === UserRole.ADMIN || user?.role === UserRole.CASHIER) {
      url = "admin/transactions";
    } else if (user?.role === UserRole.MANAGER) {
      url = "manager/transactions";
    }

    const params = {};
    for (const [key, value] of Object.entries(filter)) {
      if (value === "" || value === null || value === undefined) continue;
      params[key] = value;
    }

    if (selectedUser) {
      params["userId"] = selectedUser.id;
    }

    setLoading(true);
    try {
      const resp = await withCredentials((headers) =>
        api.get(url, { ...headers, params })
      );
      setAppState(resp.data.data);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
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
      width: 80,
    },
    {
      title: "Реквизиты получателя",
      key: "payment_details",
      dataIndex: "payment_details",
      render: (paymentDetails) => (
        <InlineText>{paymentDetails?.data}</InlineText>
      ),
    },
    {
      title: "Сумма",
      key: "amount",
      dataIndex: "amount",
      width: 120,
      align: "right",
      render: (value) => (
        <InlineText>{CurrencyFormatter.format(value)}</InlineText>
      ),
    },
    {
      title: "Баланс до",
      key: "balance_before",
      width: 120,
      align: "right",
      render: (_t: any, item: any) => {
        let userBeforeBalance = item?.userAfterBalance - item?.amount;
        if (
          item.status === "cancelled" ||
          item.status === "waiting_confirmation"
        ) {
          userBeforeBalance = item.userAfterBalance;
        }
        return (
          <InlineText>
            {userBeforeBalance < 0
              ? "N/A"
              : CurrencyFormatter.format(userBeforeBalance)}
          </InlineText>
        );
      },
    },
    {
      title: "Баланс после",
      key: "balance_after",
      width: 120,
      align: "right",
      render: (_t: any, item: any) =>
        item.status !== "waiting_confirmation" && (
          <InlineText>
            {CurrencyFormatter.format(item?.userAfterBalance)}
          </InlineText>
        ),
    },
    {
      title: "Имя покупателя",
      key: "sender_name",
      dataIndex: "sender_name",
      width: 120,
    },
    {
      title: "Статус",
      key: "status",
      dataIndex: "status",
      width: "min-content",
    },
    {
      title: "",
      key: "action",
      fixed: "right",
      render: (_, item) => {
        // не показывать кнопки менеджерам и юзерам
        if (user?.role !== UserRole.ADMIN && user?.role !== UserRole.CASHIER)
          return null;

        if (
          (item.type === "bank" || item.type === "cashback") &&
          item.status === "waiting_confirmation"
        ) {
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
    <div>
      <Space direction="horizontal" style={{ marginBottom: 16 }}>
        <div style={{ minWidth: 200 }}>
          <UserSelect
            disabled={!!selectedUser}
            defaultValue={selectedUser ? getUserLabel(selectedUser) : null}
            users={users}
            loading={loadingUsres}
            onChange={(val) => setFilter((f) => ({ ...f, userId: val }))}
          />
        </div>
        <RangePicker
          style={{ minWidth: 200 }}
          showTime={{
            defaultOpenValue: [dayjs().startOf("day"), dayjs().endOf("day")],
          }}
          value={
            filter.date_begin
              ? [dayjs(filter.date_begin), dayjs(filter.date_end)]
              : undefined
          }
          onChange={(dates) => {
            let newValue = ["", ""];
            if (dates) {
              newValue = [dates[0].toISOString(), dates[1].toISOString()];
            }

            setFilter((f) => ({
              ...f,
              date_begin: newValue[0],
              date_end: newValue[1],
            }));
          }}
        />

        <Select
          placeholder="Статус"
          style={{ width: 100 }}
          onChange={(val) => setFilter((f) => ({ ...f, status: val }))}
          onClear={() => setFilter((f) => ({ ...f, status: null }))}
          allowClear
          options={[
            { label: "Pending", value: "pending" },
            { label: "Success", value: "success" },
            { label: "Cancelled", value: "cancelled" },
          ]}
        />

        <Select
          placeholder="Тип"
          style={{ width: 120 }}
          onChange={(val) => setFilter((f) => ({ ...f, type: val }))}
          onClear={() => setFilter((f) => ({ ...f, type: null }))}
          allowClear
          options={[
            { label: "Cashback", value: "cashback" },
            { label: "Bank", value: "bank" },
            { label: "Crypto", value: "crypto" },
          ]}
        />

        <Button
          type="primary"
          onClick={fetchData}
          loading={loading}
          disabled={loading}
        >
          Поиск
        </Button>
      </Space>
      <Table
        loading={loading}
        columns={columns}
        dataSource={appState}
        rowKey={(meditation) => meditation.id}
        scroll={{ x: "max-content", y: 500 }}
      />
    </div>
  );
};

export default IncomingTransactions;
