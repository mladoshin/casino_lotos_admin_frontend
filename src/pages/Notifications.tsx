import { Button, Space, Table, Typography, notification } from "antd";
import type { ColumnsType } from "antd/es/table";
import moment from "moment";
import { useEffect, useState } from "react";
import { api, withCredentials } from "../services/api";
const { Text } = Typography;

const Notifications = () => {
  const [notifications, setNotifications] = useState();
  const [loading, setLoading] = useState(false);
  const [loadingClearNotifications, setLoadingClearNotifications] = useState<
    string | null
  >(null);

  const [notificationApi, contextHolder] = notification.useNotification();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const resp = await withCredentials((headers) =>
        api.get(`user/notifications`, headers)
      );
      setNotifications(resp.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleClearNotification(notificationId: string) {
    try {
      setLoadingClearNotifications(notificationId);
      await withCredentials((headers) =>
        api.delete(`user/notifications/${notificationId}`, headers)
      );
      await fetchData();
    } catch (error) {
      console.log(error);
      notificationApi.error({ message: "Ошибка очистки уведомления" });
    } finally {
      setLoadingClearNotifications(null);
    }
  }

  const columns: ColumnsType<any> = [
    {
      title: "Дата",
      dataIndex: "timestamp",
      key: "timestamp",
      render: (timestamp) => (
        <Text>{moment(timestamp).format("D.MM.YYYY (H:mm:ss)")}</Text>
      ),
    },
    {
      title: "Тип",
      dataIndex: "type",
      key: "type",
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: "Стутус",
      dataIndex: "status",
      key: "status",
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: "Сообщение",
      dataIndex: "message",
      key: "message",
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: "",
      key: "action",
      render: (_, item) => (
        <Space>
          <Button
            onClick={() => handleClearNotification(item.id)}
            loading={loadingClearNotifications === item.id}
          >
            Очистить
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      <Table
        loading={loading}
        columns={columns}
        dataSource={notifications}
        rowKey={(notification) => notification.id}
      />
    </>
  );
};

export default Notifications;
