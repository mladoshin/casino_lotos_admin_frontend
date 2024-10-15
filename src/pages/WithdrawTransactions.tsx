import {
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

interface WithdrawTransactionsProps {
  user?: User;
}

const WithdrawTransactions = ({
  user: selectedUser,
}: WithdrawTransactionsProps) => {
  const { user } = useContext(AppContext);
  const [appState, setAppState] = useState();
  const { users, loading: loadingUsres } = useGetUsers({ fetchOnMount: true });
  const [loading, setLoading] = useState<boolean>(false);

  const [filter, setFilter] = useState<any>({
    userId: null,
    date_begin: null,
    date_end: null,
    status: null,
    method: null,
  });

  useEffect(() => {
    fetchData();
  }, [selectedUser]);

  async function fetchData() {
    let url = "";
    if ([UserRole.ADMIN, UserRole.CASHIER].includes(user?.role as any)) {
      url = "admin/withdraw-history";
    } else if (user?.role === UserRole.MANAGER) {
      url = "manager/withdraw-history";
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
      align: "right",
      render: (value) => (
        <InlineText style={{ whiteSpace: "nowrap" }}>
          {CurrencyFormatter.format(value)}
        </InlineText>
      ),
    },
    {
      title: "Баланс до",
      key: "balance_before",
      width: 120,
      align: "right",
      render: (_t: any, item: any) => {
        let userBeforeBalance = item.userAfterBalance + item.amount;
        if (item.status === "cancelled" || item.status === "pending") {
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
        item.status !== "pending" && (
          <InlineText>
            {CurrencyFormatter.format(item?.userAfterBalance)}
          </InlineText>
        ),
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
        <InlineText>{item.card || item.sbp || item.crypto_address}</InlineText>
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
        if (user?.role !== UserRole.ADMIN && user?.role !== UserRole.CASHIER)
          return null;

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
          placeholder="Метод"
          style={{ width: 120 }}
          onChange={(val) => setFilter((f) => ({ ...f, method: val }))}
          onClear={() => setFilter((f) => ({ ...f, method: null }))}
          allowClear
          options={[
            { label: "Card", value: "card" },
            { label: "SBP", value: "sbp" },
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

export default WithdrawTransactions;
