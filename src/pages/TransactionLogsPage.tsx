import { Button, DatePicker, Select, Space, Table, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { api, withCredentials } from "../services/api";
import { getUserLabel } from "@utils/user";
import {
  transactionLogActionLabels,
  transactionLogTypeLabels,
} from "../constants/common";
import UserSelect from "../components/UserSelect/UserSelect";
import useGetUsers from "../hooks/useGetUsers";
import dayjs from "dayjs";
import { UserRole } from "@customTypes/enum/UserRole";
import InlineText from "components/InlineText";
import { CurrencyFormatter } from "@utils/common";
const { Text } = Typography;
const { RangePicker } = DatePicker;

function TransactionLogsPage() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoding] = useState<boolean>(false);
  const { users, loading: loadingUsres } = useGetUsers({ fetchOnMount: true });
  const [filter, setFilter] = useState<any>({
    userId: null,
    manager_id: null,
    date_begin: null,
    date_end: null,
    transaction_date_begin: null,
    transaction_date_end: null,
    action: null,
    type: null,
  });

  useEffect(() => {
    handleFetchTransactionLogs();
  }, []);

  async function handleFetchTransactionLogs() {
    const params = {};
    for (const [key, value] of Object.entries(filter)) {
      if (value === "" || value === null || value === undefined) continue;
      params[key] = value;
    }
    setIsLoding(true);
    try {
      const data = await withCredentials((headers) =>
        api.get("admin/transaction-logs", { ...headers, params })
      );
      setLogs(data.data);
    } catch {}
    setIsLoding(false);
  }

  const columns: ColumnsType<any> = [
    {
      title: "Дата действия",
      dataIndex: "timestamp",
      key: "timestamp",
      render: (date) => (
        <InlineText>{moment(date).format("DD.MM.YYYY (HH:mm:ss)")}</InlineText>
      ),
    },
    {
      title: "Дата подачи заявки",
      dataIndex: "transaction_timestamp",
      key: "transaction_timestamp",
      render: (date) => (
        <InlineText>
          {date ? moment(date).format("DD.MM.YYYY (HH:mm:ss)") : "N/A"}
        </InlineText>
      ),
    },
    {
      title: "Время обработки заявки (hh:mm:ss)",
      key: "processing_time",
      width: 200,
      render: (_t, item) => {
        const startTime = moment(item.transaction_timestamp);
        const endTime = moment(item.timestamp);
        const hrs = moment.utc(endTime.diff(startTime)).format("HH");
        const min = moment.utc(endTime.diff(startTime)).format("mm");
        const sec = moment.utc(endTime.diff(startTime)).format("ss");
        return (
          <InlineText>
            {item.transaction_timestamp ? `${hrs}:${min}:${sec}` : "N/A"}
          </InlineText>
        );
      },
    },
    {
      title: "Оператор",
      key: "manager",
      width: 150,
      render: (_t, item) => <InlineText>{getUserLabel(item.manager)}</InlineText>,
    },
    {
      title: "Тип",
      dataIndex: "type",
      key: "type",
      render: (text) => <InlineText>{transactionLogTypeLabels[text]}</InlineText>,
    },
    {
      title: "Действие",
      dataIndex: "action",
      key: "action",
      render: (text) => <InlineText>{transactionLogActionLabels[text]}</InlineText>,
    },
    {
      title: "Сумма",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      render: (text) => (
        <InlineText>{CurrencyFormatter.format(text)}</InlineText>
      ),
    },
    {
      title: "Пользователь",
      key: "user",
      render: (_t, item) => <Text>{getUserLabel(item.user)}</Text>,
    },
  ];

  return (
    <div>
      <Space
        direction="horizontal"
        style={{ marginBottom: 16, flexWrap: "wrap" }}
      >
        <div style={{ minWidth: 200 }}>
          <UserSelect
            placeholder="Выберите пользователя"
            users={users}
            loading={loadingUsres}
            onChange={(val) => setFilter((f) => ({ ...f, userId: val }))}
          />
        </div>
        <div style={{ minWidth: 200 }}>
          <UserSelect
            placeholder="Выберите оператора"
            users={users.filter(
              (u) => u.role === UserRole.ADMIN || u.role === UserRole.CASHIER
            )}
            loading={loadingUsres}
            onChange={(val) => setFilter((f) => ({ ...f, managerId: val }))}
          />
        </div>
        <RangePicker
          placeholder={["Начало действия", "Конец действия"]}
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
        <RangePicker
          placeholder={["Начало транзакций", "Конец транзакций"]}
          style={{ minWidth: 200 }}
          showTime={{
            defaultOpenValue: [dayjs().startOf("day"), dayjs().endOf("day")],
          }}
          value={
            filter.transaction_date_begin
              ? [
                  dayjs(filter.transaction_date_begin),
                  dayjs(filter.transaction_date_end),
                ]
              : undefined
          }
          onChange={(dates) => {
            let newValue = ["", ""];
            if (dates) {
              newValue = [dates[0].toISOString(), dates[1].toISOString()];
            }

            setFilter((f) => ({
              ...f,
              transaction_date_begin: newValue[0],
              transaction_date_end: newValue[1],
            }));
          }}
        />

        <Select
          placeholder="Действие"
          style={{ width: 100 }}
          onChange={(val) => setFilter((f) => ({ ...f, action: val }))}
          onClear={() => setFilter((f) => ({ ...f, action: null }))}
          allowClear
          options={[
            { label: "Принято", value: 0 },
            { label: "Отклонено", value: 1 },
          ]}
        />

        <Select
          placeholder="Тип"
          style={{ width: 120 }}
          onChange={(val) => setFilter((f) => ({ ...f, type: val }))}
          onClear={() => setFilter((f) => ({ ...f, type: null }))}
          allowClear
          options={[
            { label: "Депозит", value: 0 },
            { label: "Вывод", value: 1 },
          ]}
        />

        <Button
          type="primary"
          onClick={handleFetchTransactionLogs}
          loading={isLoading}
          disabled={isLoading}
        >
          Поиск
        </Button>
      </Space>
      <Table
        loading={isLoading}
        columns={columns}
        dataSource={logs}
        rowKey={(log) => log.id}
        scroll={{ x: "max-content", y: 500 }}
      />
    </div>
  );
}

export default TransactionLogsPage;
