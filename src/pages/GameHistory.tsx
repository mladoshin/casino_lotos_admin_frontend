import { User } from "@customTypes/entity/User";
import { getUserLabel } from "@utils/user";
import { Button, Collapse, DatePicker, Space, Spin, Typography } from "antd";
import UserSelect from "../components/UserSelect/UserSelect";
import useGetUsers from "../hooks/useGetUsers";
import React, { useEffect, useState } from "react";
import { api, withCredentials } from "../services/api";
import moment from "moment";
import Table, { ColumnsType } from "antd/es/table";
import InlineText from "components/InlineText";
import { CurrencyFormatter } from "@utils/common";
import dayjs from "dayjs";
const { RangePicker } = DatePicker;
const { Text } = Typography;

interface GameHistoryProps {
  user?: User;
}

interface GamesLogListProps {
  logs?: any[];
  loading?: boolean;
}

function GamesLogList({ logs, loading }: GamesLogListProps) {
  const columns: ColumnsType<any> = [
    {
      title: "id",
      dataIndex: "id",
      key: "id",
      width: 100,
      render: (text) => (
        <InlineText style={{ whiteSpace: "nowrap" }}>{text}</InlineText>
      ),
    },
    {
      title: "Id игры",
      dataIndex: "gameId",
      key: "gameId",
      width: 100,
      render: (text) => <InlineText>{text}</InlineText>,
    },
    {
      title: "bet",
      dataIndex: "bet",
      key: "bet",
      width: 100,
      render: (text) => (
        <InlineText style={{ whiteSpace: "nowrap" }}>
          {CurrencyFormatter.format(+text)}
        </InlineText>
      ),
    },
    {
      title: "win",
      dataIndex: "win",
      key: "win",
      width: 100,
      render: (text) => (
        <InlineText style={{ whiteSpace: "nowrap" }}>
          {CurrencyFormatter.format(+text)}
        </InlineText>
      ),
    },
    {
      title: "date",
      dataIndex: "date",
      key: "date",
      width: 100,
      render: (text) => (
        <InlineText style={{ whiteSpace: "nowrap" }}>
          {moment(text).format("DD.MM.YYYY HH:mm:ss")}
        </InlineText>
      ),
    },
  ];

  return (
    <Table
      loading={loading}
      columns={columns}
      dataSource={logs}
      rowKey={(log) => log.id}
      scroll={{ x: "max-content", y: 500 }}
    />
  );
}

function GameHistory({ user: selectedUser }: GameHistoryProps) {
  const { users, loading: loadingUsers } = useGetUsers({ fetchOnMount: true });
  const [gameSessions, setGameSessions] = useState<any[]>([]);
  const [sessionLogs, setSessionLogs] = useState<any>({});

  const [loadingSessions, setLoadingSessions] = useState<boolean>(false);
  const [loadingSessionLogs, setLoadingSessionLogs] = useState<
    Record<string, boolean>
  >({});
  const [errorMessage, setErrorMessage] = useState("");

  const [filter, setFilter] = useState<any>({
    userId: null,
    date_begin: null,
    date_end: null,
  });

  useEffect(() => {
    handleFetchGameHistory();
  }, [selectedUser]);

  async function handleFetchGameHistory() {
    let userId = filter.userId;
    if (selectedUser) {
      userId = selectedUser.id;
    }
    if (!userId) return;
    setErrorMessage("");
    setLoadingSessions(true);
    setSessionLogs({});
    try {
      const params = {};
      for (const [key, value] of Object.entries(filter)) {
        if (value === "" || value === null || value === undefined) continue;
        params[key] = value;
      }

      const resp = await withCredentials((headers) =>
        api.get(`/user/${userId}/game-history`, { ...headers, params })
      );
      setGameSessions(resp.data);
      if (resp.data?.length === 0) {
        setErrorMessage("Игровые сессии не найдены");
      }
    } catch (error) {
      console.log(error);
      setErrorMessage(error.message);
    }
    setLoadingSessions(false);
  }

  async function handleFetchSessionLogs(sessionId: string) {
    if (sessionLogs[sessionId]) {
      console.log("Hit session logs cache");
      return;
    }

    setLoadingSessionLogs((s) => ({ ...s, [sessionId]: true }));
    try {
      const resp = await withCredentials((headers) =>
        api.get(`/game-history/${sessionId}`, headers)
      );
      setSessionLogs((s) => ({ ...s, [sessionId]: resp.data }));
    } catch (error) {
      console.log(error);
    }
    setLoadingSessionLogs((s) => ({ ...s, [sessionId]: false }));
  }

  const collapseItems = gameSessions?.map((session) => ({
    label: `${session.sessionId} (${moment(session.date).format(
      "DD.MM.YYYY HH:mm:ss"
    )})`,
    key: session.sessionId,
    children: (
      <GamesLogList
        logs={sessionLogs[session.sessionId]}
        loading={loadingSessionLogs[session.sessionId]}
      />
    ),
  }));

  function onChange(val: string[]) {
    console.log(val);
    const newElement = val[val.length - 1];
    if (newElement) {
      handleFetchSessionLogs(newElement);
    }
  }

  return (
    <div>
      <Space direction="horizontal" style={{ marginBottom: 16 }}>
        <div style={{ minWidth: 200 }}>
          <UserSelect
            disabled={!!selectedUser}
            defaultValue={selectedUser ? getUserLabel(selectedUser) : null}
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
        <Button
          type="primary"
          onClick={handleFetchGameHistory}
          loading={loadingSessions}
          disabled={loadingSessions}
        >
          Поиск
        </Button>
      </Space>

      <Collapse
        items={collapseItems}
        defaultActiveKey={[]}
        onChange={onChange}
      />
      {loadingSessions && (
        <center style={{ padding: "12px" }}>
          <Spin />
        </center>
      )}

      {errorMessage && (
        <center style={{ padding: "12px" }}>
          <Text>{errorMessage}</Text>
        </center>
      )}
    </div>
  );
}

export default GameHistory;
