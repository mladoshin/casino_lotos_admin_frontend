import {
  Button,
  Tag,
  Typography,
  Table,
  App,
  notification,
  Space,
  Modal,
  Input,
} from "antd";
import { useEffect, useState } from "react";
const { Text } = Typography;
import type { ColumnsType } from "antd/es/table";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

const Users = () => {
  const [messageModalOpen, setMessageModalOpen] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");

  const [appState, setAppState] = useState();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingSendMessage, setLoadingSendMessage] = useState(false);
  const [notificationApi, contextHolder] = notification.useNotification();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const resp = await api.get(`user`);
      setAppState(resp.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage(userId: string, message: string) {
    try {
      setLoadingSendMessage(true);
      await api.post("admin/send-message", { user_id: userId, message });
      setMessage("");
      notificationApi.success({ message: "Сообщение успешно отправлено" });
    } catch (error) {
      console.log(error);
      notificationApi.error({ message: "Ошибка отправки сообщения" });
    } finally {
      setLoadingSendMessage(false);
    }
  }

  const columns: ColumnsType<any> = [
    {
      title: "ФИО",
      dataIndex: "name",
      key: "name",
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: "Баланс",
      dataIndex: "balance",
      key: "balance",
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: "Заработано",
      dataIndex: "earned",
      key: "earned",
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: "Номер телефона",
      dataIndex: "phone",
      key: "phone",
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: "Почта",
      dataIndex: "email",
      key: "email",
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: "TG",
      dataIndex: "telegram_id",
      key: "telegram_id",
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: "",
      key: "action",
      render: (_, item) => (
        <Space>
          <Button onClick={() => navigate(item.id)}>Открыть</Button>
          <Button onClick={() => setMessageModalOpen(item.id)}>
            Сообщение
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
        dataSource={appState}
        rowKey={(meditation) => meditation.id}
      />

      <Modal
        open={!!messageModalOpen}
        title="Новое сообщение"
        onCancel={() => setMessageModalOpen(null)}
        footer={[
          <Button key="back" onClick={() => setMessageModalOpen(null)}>
            Отменить
          </Button>,
          <Button
            type="primary"
            loading={loadingSendMessage}
            onClick={() => sendMessage(messageModalOpen, message)}
          >
            Отправить
          </Button>,
        ]}
      >
        <Input.TextArea
          rows={4}
          placeholder="Введите сообщение"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </Modal>
    </>
  );
};

export default Users;
