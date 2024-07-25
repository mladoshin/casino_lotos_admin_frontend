import {
  Button,
  Input,
  Modal,
  Space,
  Table,
  Typography,
  notification,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, withCredentials } from "../services/api";
import { AppContext } from "../context/AppContext";
import { UserRole } from "../routes/types";
const { Text } = Typography;

const Users = () => {
  const { user } = useContext(AppContext);
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
    let url = "";
    if (user?.role === UserRole.ADMIN) {
      url = "user";
    } else if (user?.role === UserRole.MANAGER) {
      url = "manager/referrals";
    }

    try {
      setLoading(true);
      const resp = await withCredentials((headers) => api.get(url, headers));
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
      if (userId === "all") {
        let url = "admin/broadcast-message";
        if (user?.role === UserRole.MANAGER) {
          url = "manager/broadcast-message";
        }
        await withCredentials((headers) => api.post(url, { message }, headers));
      } else {
        await withCredentials((headers) =>
          api.post("admin/send-message", { user_id: userId, message }, headers)
        );
      }
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
      render: (text) => <Text>{text.toFixed(2)}</Text>,
    },
    {
      title: "Всего заработано",
      dataIndex: "totalEarned",
      key: "totalEarned",
      render: (_t, item) => (
        <Text style={{ textAlign: "right", width: "100%", display: "block" }}>
          {item.lastTotalEarned.toFixed(2)}/{item.totalEarned.toFixed(2)}
        </Text>
      ),
    },
    {
      title: "Всего проиграно",
      dataIndex: "totalLoss",
      key: "totalEarned",
      render: (_t, item) => (
        <Text style={{ textAlign: "right", width: "100%", display: "block" }}>
          {item.lastTotalLoss.toFixed(2)}/{item.totalLoss.toFixed(2)}
        </Text>
      ),
    },
    {
      title: "RTP",
      key: "rtp",
      render: (_t, item) => {
        let rtpValue = null;
        if (item.totalLoss !== 0) {
          rtpValue = (item.totalEarned / item.totalLoss) * 100;
        }
        return (
          <Text style={{ textAlign: "right", width: "100%", display: "block" }}>
            {rtpValue !== null ? `${Math.round(rtpValue)}%` : ""}
          </Text>
        );
      },
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
      dataIndex: "telegram_username",
      key: "telegram_username",
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: "",
      key: "action",
      render: (_, item) =>
        user?.role === UserRole.ADMIN ? (
          <Space>
            <Button onClick={() => navigate(item.id)}>Открыть</Button>
            <Button onClick={() => setMessageModalOpen(item.id)}>
              Сообщение
            </Button>
          </Space>
        ) : null,
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
