import {
  Button,
  Dropdown,
  Input,
  MenuProps,
  Modal,
  Space,
  Table,
  Typography,
  notification,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useContext, useEffect, useState } from "react";
import { api, withCredentials } from "../services/api";
import { DeleteOutlined } from "@ant-design/icons";
import ReferralStatisticsModal from "../components/ReferralStatisticsModal";
import { useNavigate } from "react-router-dom"; // Добавлено для использования навигации
import { getUserTelegramLabel } from "@utils/user"; // Добавлено для логики TG
import InlineText from "components/InlineText";
import { AppContext } from "../context/AppContext";
import { UserRole } from "@customTypes/enum/UserRole";

const { Text } = Typography;

const Users = () => {
  const {user} = useContext(AppContext);
  const [messageModalOpen, setMessageModalOpen] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const [appState, setAppState] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSendMessage, setLoadingSendMessage] = useState(false);
  const [referralModalOpen, setReferralModalOpen] = useState<string | null>(
    null
  );
  const [notificationApi, contextHolder] = notification.useNotification();
  const navigate = useNavigate(); // Добавлено для использования навигации

  useEffect(() => {
    if(!user) return;
    fetchData();
  }, [user]);

  async function fetchData() {
    let url = "";
    if(user.role===UserRole.MANAGER){
      url = '/manager/referrals'
    }else{
      url = '/user'
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

  const dropdownActionMenuItems = (itemId: string): MenuProps["items"] => {
    return [
      {
        key: "0",
        label: "Профиль",
        onClick: () => navigate(itemId),
      },
      {
        key: "1",
        label: "Отправить сообщение",
        onClick: () => setMessageModalOpen(itemId),
      },
      {
        key: "2",
        label: "Показать рефералов",
        onClick: () => setReferralModalOpen(itemId),
      },
      {
        key: "3",
        label: "Удалить",
        danger: true,
        onClick: () => handleDeleteUser(itemId),
      },
    ];
  };

  const columns: ColumnsType<any> = [
    {
      title: "ФИО",
      dataIndex: "name",
      key: "name",
      width: 100,
      render: (text) => (
        <InlineText style={{ whiteSpace: "nowrap" }}>{text}</InlineText>
      ),
    },
    {
      title: "Номер телефона",
      dataIndex: "phone",
      key: "phone",
      width: 100,
      render: (text) => (
        <InlineText style={{ whiteSpace: "nowrap" }}>{text}</InlineText>
      ),
    },
    {
      title: "Почта",
      dataIndex: "email",
      key: "email",
      width: 100,
      render: (text) => (
        <InlineText style={{ whiteSpace: "nowrap" }}>{text}</InlineText>
      ),
    },
    {
      title: "TG", // Добавляем колонку TG
      key: "telegram",
      width: 100,
      render: (_text, item) => (
        <InlineText>{getUserTelegramLabel(item)}</InlineText>
      ), // Логика для отображения TG
    },
    {
      title: "Баланс",
      dataIndex: "balance",
      key: "balance",
      width: 100,
      render: (text) => (
        <InlineText style={{ whiteSpace: "nowrap" }}>
          {text.toFixed(2)}
        </InlineText>
      ),
    },
    {
      title: <Text>Проиграно за последнюю неделю</Text>,
      dataIndex: "lastTotalLoss",
      key: "lastTotalLoss",
      width: 100,
      render: (value) => (
        <InlineText style={{ whiteSpace: "nowrap" }}>
          {value.toFixed(2)}
        </InlineText>
      ),
    },
    {
      title: "Заработано за последнюю неделю",
      dataIndex: "lastTotalEarned",
      key: "lastTotalEarned",
      width: 100,
      render: (value) => (
        <InlineText style={{ whiteSpace: "nowrap" }}>
          {value.toFixed(2)}
        </InlineText>
      ),
    },
    {
      title: "Всего проиграно",
      dataIndex: "totalLoss",
      key: "totalLoss",
      width: 100,
      render: (_t, item) => (
        <InlineText style={{ whiteSpace: "nowrap" }}>
          {item.totalLoss.toFixed(2)}
        </InlineText>
      ),
    },
    {
      title: "Всего заработано",
      dataIndex: "totalEarned",
      key: "totalEarned",
      width: 100,
      render: (_t, item) => (
        <InlineText style={{ whiteSpace: "nowrap" }}>
          {item.totalEarned.toFixed(2)}
        </InlineText>
      ),
    },
    {
      title: "",
      key: "action",
      fixed: "right",
      render: (_, item) => (
        <Dropdown menu={{ items: dropdownActionMenuItems(item.id) }}>
          <Button onClick={(e) => e.preventDefault()}>Опции</Button>
        </Dropdown>
      ),
    }
  ];

  return (
    <>
      {contextHolder}
      <Table
        loading={loading}
        columns={columns}
        dataSource={appState}
        rowKey={(user) => user.id}
        scroll={{ x: "max-content", y: 500 }}
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

      <ReferralStatisticsModal
        open={!!referralModalOpen}
        userId={referralModalOpen}
        onClose={() => setReferralModalOpen(null)}
      />
    </>
  );
};

export default Users;
