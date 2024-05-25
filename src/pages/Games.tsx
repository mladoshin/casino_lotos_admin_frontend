import { App, Avatar, Button, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { api, withCredentials } from "../services/api";
const { Text } = Typography;

const Games = () => {
  const [appState, setAppState] = useState();
  const [loading, setLoading] = useState(false);
  const { notification } = App.useApp();
  const openNotification = () => {
    notification.info({
      message: `Игра недоступна`,
      placement: "topRight",
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const resp = await withCredentials((headers) =>
        api.get("games", headers)
      );
      setAppState(resp.data);
    } catch (error) {
      console.log(error);
    }
  }

  const openGame = (id: number) => {
    setLoading(true);
  };

  const columns: ColumnsType<any> = [
    {
      title: "Название",
      dataIndex: "img",
      key: "img",
      render: (src) => <Avatar src={src} shape="square" size={64} />,
    },
    {
      title: "Название",
      dataIndex: "name",
      key: "name",
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: "Категории",
      key: "categories",
      dataIndex: "categories",
      render: (_, { categories }) => <Tag color={"green"}>{categories}</Tag>,
    },
    {
      title: "Action",
      key: "action",
      render: (_, item) => (
        <Button onClick={() => openGame(item.id)} loading={loading}>
          Запросить ссылку на игру
        </Button>
      ),
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

export default Games;
