import { Button, Input, Modal, Space, Table, Typography, notification } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { api, withCredentials } from "../services/api";
import { DeleteOutlined } from "@ant-design/icons";
import ReferralStatisticsModal from "./ReferralStatisticsModal";
import { useNavigate } from "react-router-dom"; // Добавлено для использования навигации
import { getUserTelegramLabel } from "@utils/user"; // Добавлено для логики TG

const { Text } = Typography;

const Users = () => {
  const [messageModalOpen, setMessageModalOpen] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const [appState, setAppState] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSendMessage, setLoadingSendMessage] = useState(false);
  const [referralModalOpen, setReferralModalOpen] = useState<string | null>(null);
  const [notificationApi, contextHolder] = notification.useNotification();
  const navigate = useNavigate(); // Добавлено для использования навигации

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const resp = await withCredentials((headers) => api.get("user", headers));
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
      await withCredentials((headers) =>
        api.post("admin/send-message", { user_id: userId, message }, headers)
      );
      setMessage("");
      notificationApi.success({ message: "Сообщение успешно отправлено" });
    } catch (error) {
      console.log(error);
      notificationApi.error({ message: "Ошибка отправки сообщения" });
    } finally {
      setLoadingSendMessage(false);
    }
  }

  async function handleDeleteUser(userId: string) {
    if (!confirm("Уверены, что хотите удалить пользователя?")) return;

    try {
      await withCredentials((headers) =>
        api.delete(`/user/${userId}`, headers)
      );
      await fetchData();
    } catch (err) {
      console.log(err);
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
      render: (text) => <Text>{text.toFixed(2)}</Text>,
    },
    {
      title: "Всего заработано",
      dataIndex: "totalEarned",
      key: "totalEarned",
      render: (_t, item) => (
        <Text>
          {item.lastTotalEarned.toFixed(2)}/{item.totalEarned.toFixed(2)}
        </Text>
      ),
    },
    {
      title: "Всего проиграно",
      dataIndex: "totalLoss",
      key: "totalEarned",
      render: (_t, item) => (
        <Text>
          {item.lastTotalLoss.toFixed(2)}/{item.totalLoss.toFixed(2)}
        </Text>
      ),
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
      title: "TG", // Добавляем колонку TG
      key: "telegram",
      render: (_text, item) => <Text>{getUserTelegramLabel(item)}</Text>, // Логика для отображения TG
    },
    {
      title: "",
      key: "action",
      render: (_, item) => (
        <Space>
          <Button onClick={() => setMessageModalOpen(item.id)}>Сообщение</Button>
          <Button onClick={() => setReferralModalOpen(item.id)}>
            Показать рефералов
          </Button>
          <Button onClick={() => navigate(item.id)}>Открыть</Button> {/* Кнопка "Открыть" */}
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDeleteUser(item.id)}
          />
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
        rowKey={(user) => user.id}
      />
      <Button
        type="primary"
        loading={loadingSendMessage}
        onClick={() => setMessageModalOpen("all")}
      >
        Отправить сообщение всем
      </Button>

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
            onClick={() => sendMessage(messageModalOpen as string, message)}
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

      {referralModalOpen && (
        <ReferralStatisticsModal
          userId={referralModalOpen}
          onClose={() => setReferralModalOpen(null)}
        />
      )}
    </>
  );
};

export default Users;