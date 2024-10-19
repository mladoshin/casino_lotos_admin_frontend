import { Button, DatePicker, Space, Table, Typography } from "antd";
import UserSelect from "components/UserSelect/UserSelect";
import useGetUsers from "../../hooks/useGetUsers";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { api, withCredentials } from "../../services/api";
import { ColumnsType } from "antd/es/table";
import InlineText from "../../components/InlineText";
import { getUserLabel } from "@utils/user";
import moment from "moment";
import { Link } from "react-router-dom";
const { RangePicker } = DatePicker;
const { Text } = Typography;

interface ManagerReferralHistoryProps {
  referralInvitationId?: string;
}

function ManagerReferralHistory({
  referralInvitationId,
}: ManagerReferralHistoryProps) {
  const { users, loading: loadingUsers } = useGetUsers({ fetchOnMount: true });
  const [referralHistory, setReferralHistory] = useState<any[]>([]);

  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [filter, setFilter] = useState<any>({
    referralInvitationId: referralInvitationId || null,
    dateFrom: null,
    dateTo: null,
    userId: null,
  });

  useEffect(() => {
    handleFetchReferralHistory();
  }, [referralInvitationId]);

  async function handleFetchReferralHistory() {
    setLoadingHistory(true);
    setErrorMessage("");
    try {
      const params = {};
      for (const [key, value] of Object.entries(filter)) {
        if (value === "" || value === null || value === undefined) continue;
        params[key] = value;
      }
      if (referralInvitationId) {
        params["referralInvitationId"] = referralInvitationId;
      }

      const resp = await withCredentials((headers) =>
        api.get("/manager-referral-history", { ...headers, params })
      );
      setReferralHistory(resp.data);
      if (resp.data?.length === 0) {
        setErrorMessage("Not found!");
      }
    } catch (err) {
      setErrorMessage(err.message);
    }
    setLoadingHistory(false);
  }

  const columns: ColumnsType<any> = [
    {
      title: "Пользователь",
      key: "user",
      width: 200,
      render: (_: any, item: any) => (
        <InlineText style={{ whiteSpace: "nowrap" }}>
          {getUserLabel(item.user)}
        </InlineText>
      ),
    },
    {
      title: "Дата",
      dataIndex: "created_at",
      key: "created_at",
      width: 150,
      render: (text) => (
        <InlineText>{moment(text).format("DD.MM.YYYY HH:mm:ss")}</InlineText>
      ),
    },
    {
      title: "Тип ссылки",
      dataIndex: "source",
      key: "source",
      width: 150,
      render: (text) => (
        <InlineText>{text}</InlineText>
      ),
    },
  ];

  return (
    <div>
      <Space direction="horizontal" style={{ marginBottom: 16 }}>
        <div style={{ minWidth: 200 }}>
          <UserSelect
            users={users}
            loading={loadingUsers}
            onChange={(val) => setFilter((f) => ({ ...f, userId: val }))}
          />
        </div>
        <RangePicker
          placeholder={["Начальная дата", "Конечная дата"]}
          style={{ minWidth: 200 }}
          showTime={{
            defaultOpenValue: [dayjs().startOf("day"), dayjs().endOf("day")],
          }}
          value={
            filter.date_begin
              ? [dayjs(filter.dateFrom), dayjs(filter.dateTo)]
              : undefined
          }
          onChange={(dates) => {
            let newValue = ["", ""];
            if (dates) {
              newValue = [dates[0].toISOString(), dates[1].toISOString()];
            }

            setFilter((f) => ({
              ...f,
              dateFrom: newValue[0],
              dateTo: newValue[1],
            }));
          }}
        />
        <Button
          type="primary"
          onClick={handleFetchReferralHistory}
          loading={loadingHistory}
          disabled={loadingHistory}
        >
          Поиск
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={referralHistory}
        rowKey={(item) => item.id}
        scroll={{ x: "max-content", y: 500 }}
        loading={loadingHistory}
      />
      {errorMessage && (
        <center style={{ padding: "12px" }}>
          <Text>{errorMessage}</Text>
        </center>
      )}
    </div>
  );
}

export default ManagerReferralHistory;
