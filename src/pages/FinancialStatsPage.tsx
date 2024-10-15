import React, { useContext, useEffect, useState } from "react";
import { api, withCredentials } from "../services/api";
import { AppContext } from "../context/AppContext";
import { AutoComplete, Card, Select, Table, Typography } from "antd";
import { DatePicker, Space } from "antd";
import { UserRole } from "../types/enum/UserRole";
import { ColumnsType } from "antd/es/table";
const { RangePicker } = DatePicker;
const { Text } = Typography;
import dayjs from "dayjs";
import { getUserLabel, getUserTelegramLabel } from "@utils/user";
import UserSelect from "components/UserSelect/UserSelect";
import useGetUsers from "../hooks/useGetUsers";

function FinancialStatsPage() {
  const { user } = useContext(AppContext);
  const [data, setData] = useState<null | { result: any; total: any }>(null);
  const [selectedUserId, setSelectedUserId] = useState<null | string>(null);
  const [loading, _setLoading] = useState({
    users: false,
    data: false,
  });
  const [dateRange, setDateRange] = useState([null, null]);
  const {users, loading: loadingUsers} = useGetUsers({fetchOnMount: true})

  useEffect(() => {
    if (user.role === UserRole.ADMIN || user.role === UserRole.MANAGER) {
      handleFetchData();
    }
  }, [user.role, selectedUserId, dateRange]);

  const setLoading = (field: string, value: boolean) => {
    _setLoading((cur) => ({ ...cur, [field]: value }));
  };

  async function handleFetchData() {
    let params = {};
    if (selectedUserId) {
      params = { user_id: selectedUserId };
    }

    if (dateRange[0] && dateRange[1]) {
      params = { ...params, start_date: dateRange[0], end_date: dateRange[1] };
    }

    try {
      setLoading("data", true);
      const resp = await withCredentials((headers) =>
        api.get(`/${user.role}/financial-stats`, { ...headers, params: params })
      );
      setData(resp.data);
    } catch (error) {
      console.log(error);
      alert(error);
    }

    setLoading("data", false);
  }

  const columns: ColumnsType<any> = [
    {
      title: "ФИО",
      key: "name",
      render: (_text, item) => {
        let name = [item.user.name, item.user.surname].join(" ");

        return <Text>{name}</Text>;
      },
    },
    {
      title: "Номер телефона",
      key: "tel",
      render: (_text, item) => <Text>{item.user.phone}</Text>,
    },
    {
      title: "Почта",
      key: "email",
      render: (_text, item) => <Text>{item.user.email}</Text>,
    },
    {
      title: "Телеграм",
      key: "telegram",
      render: (_text, item) => <Text>{getUserTelegramLabel(item.user)}</Text>,
    },
    {
      title: "Депозит",
      dataIndex: "deposit_amount",
      key: "deposit_amount",
      render: (text) => <Text>{text} руб</Text>,
      sorter: (a, b) => a.deposit_amount - b.deposit_amount,
    },
    {
      title: "Вывод",
      dataIndex: "withdraw_amount",
      key: "withdraw_amount",
      render: (text) => <Text>{text} руб</Text>,
      sorter: (a, b) => a.withdraw_amount - b.withdraw_amount,
    },
    {
      title: "Доход",
      dataIndex: "profit",
      key: "profit",
      render: (text) => <Text>{text} руб</Text>,
      sorter: (a, b) => a.profit - b.profit,
    },
    {
      title: "Кэшбэк",
      dataIndex: "cashback_amount",
      key: "cashback_amount",
      render: (text) => <Text>{text} руб</Text>,
      sorter: (a, b) => a.cashback_amount - b.cashback_amount,
    },
  ];

  return (
    <div
      style={{ display: "flex", alignItems: "center", flexDirection: "column" }}
    >
      <Space direction="vertical">
        <UserSelect loading={loadingUsers} users={users} onChange={val => setSelectedUserId(val)}/>
        <RangePicker
          showTime={{
            defaultOpenValue: [dayjs().startOf("day"), dayjs().endOf("day")],
          }}
          value={
            dateRange[0]
              ? [dayjs(dateRange[0]), dayjs(dateRange[1])]
              : undefined
          }
          onChange={(dates) => {
            let newValue = ["", ""];
            if (dates) {
              newValue = [dates[0].toISOString(), dates[1].toISOString()];
            }

            setDateRange(newValue);
          }}
        />
      </Space>
      <div style={{ marginTop: 24 }}>
        <Table
          dataSource={data?.result || []}
          columns={columns}
          summary={(_data) => data && (
            <>
              <Table.Summary.Row style={{ background: "#f5f5f5" }}>
                <Table.Summary.Cell index={0}>
                  <b>Сумма</b>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1}></Table.Summary.Cell>
                <Table.Summary.Cell index={2}></Table.Summary.Cell>
                <Table.Summary.Cell index={3}></Table.Summary.Cell>
                <Table.Summary.Cell index={4}>
                  <Text strong>{data?.total.totalDeposit}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={5}>
                  <Text strong>{data.total.totalWithrawal}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={6}>
                  <Text strong>{data.total.totalProfit}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={7}>
                  <Text strong>{data.total.totalCashback}</Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </>
          )}
        />
      </div>
    </div>
  );
}

export default FinancialStatsPage;
