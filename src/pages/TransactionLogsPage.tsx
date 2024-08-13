import { Table, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { api, withCredentials } from "../services/api";
import { getUserLabel } from "@utils/user";
import {
  transactionLogActionLabels,
  transactionLogTypeLabels,
} from "../constants/common";
const { Text } = Typography;

function TransactionLogsPage() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoding] = useState<boolean>(false);

  useEffect(() => {
    handleFetchTransactionLogs();
  }, []);

  async function handleFetchTransactionLogs() {
    try {
      const data = await withCredentials((headers) =>
        api.get("admin/transaction-logs", headers)
      );
      setLogs(data.data);
    } catch {}
  }

  const columns: ColumnsType<any> = [
    {
      title: "Дата действия",
      dataIndex: "timestamp",
      key: "timestamp",
      render: (date) => (
        <Text>{moment(date).format("DD.MM.YYYY (HH:mm:ss)")}</Text>
      ),
    },
    {
      title: "Дата подачи заявки",
      dataIndex: "transaction_timestamp",
      key: "transaction_timestamp",
      render: (date) => (
        <Text>
          {date ? moment(date).format("DD.MM.YYYY (HH:mm:ss)") : "N/A"}
        </Text>
      ),
    },
    {
      title: "Время обработки заявки (hh:mm:ss)",
      key: "processing_time",
      render: (_t, item) => {
        const startTime = moment(item.transaction_timestamp);
        const endTime = moment(item.timestamp);
        const hrs = moment.utc(endTime.diff(startTime)).format("HH");
        const min = moment.utc(endTime.diff(startTime)).format("mm");
        const sec = moment.utc(endTime.diff(startTime)).format("ss");
        return (
          <Text>
            {item.transaction_timestamp ? `${hrs}:${min}:${sec}` : "N/A"}
          </Text>
        );
      },
    },
    {
      title: "Оператор",
      key: "manager",
      render: (_t, item) => <Text>{getUserLabel(item.manager)}</Text>,
    },
    {
      title: "Тип",
      dataIndex: "type",
      key: "type",
      render: (text) => <Text>{transactionLogTypeLabels[text]}</Text>,
    },
    {
      title: "Действие",
      dataIndex: "action",
      key: "action",
      render: (text) => <Text>{transactionLogActionLabels[text]}</Text>,
    },
    {
      title: "Сумма",
      dataIndex: "amount",
      key: "amount",
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: "Пользователь",
      key: "user",
      render: (_t, item) => <Text>{getUserLabel(item.user)}</Text>,
    },
  ];

  return (
    <div>
      <Table
        loading={isLoading}
        columns={columns}
        dataSource={logs}
        rowKey={(log) => log.id}
      />
    </div>
  );
}

export default TransactionLogsPage;
