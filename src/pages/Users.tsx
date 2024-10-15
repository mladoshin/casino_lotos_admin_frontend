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
import { useState } from "react";
import { api, withCredentials } from "../services/api";
import ReferralStatisticsModal from "../components/ReferralStatisticsModal";
import { useNavigate } from "react-router-dom"; // Добавлено для использования навигации
import { getUserTelegramLabel } from "@utils/user"; // Добавлено для логики TG
import InlineText from "components/InlineText";
import UserSelect from "../components/UserSelect/UserSelect";
import useGetUsers from "../hooks/useGetUsers";
import { CurrencyFormatter } from "@utils/common";

const { Text } = Typography;

const Users = () => {
  const [messageModalOpen, setMessageModalOpen] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const [loadingSendMessage, setLoadingSendMessage] = useState(false);
  const [referralModalOpen, setReferralModalOpen] = useState<string | null>(
    null
  );
  const [notificationApi, contextHolder] = notification.useNotification();
  const navigate = useNavigate(); // Добавлено для использования навигации
  const {
    users,
    loading: loadingUsers,
    refetch,
  } = useGetUsers({ fetchOnMount: true });
  const [filter, setFilter] = useState<any>({
    userId: null,
  });

  function handleFetchData() {
    const params = {};
    for (const [key, value] of Object.entries(filter)) {
      if (value === "" || value === null || value === undefined) continue;
      params[key] = value;
    }
    refetch(params);
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
      await handleFetchData();
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
      align: 'right',
      render: (text) => (
        <InlineText style={{ whiteSpace: "nowrap", textAlign: "right" }}>
          {CurrencyFormatter.format(text)}
        </InlineText>
      ),
    },
    {
      title: <Text>Проиграно за последнюю неделю</Text>,
      key: "lastTotalLoss",
      width: 100,
      align: 'right',
      render: (_: any, item: any) => (
        <InlineText style={{ whiteSpace: "nowrap" }}>
          {CurrencyFormatter.format(item.totalLoss-item.lastTotalLoss)}
        </InlineText>
      ),
    },
    {
      title: "Заработано за последнюю неделю",
      key: "lastTotalEarned",
      width: 100,
      align: 'right',
      render: (_:any, item: any) => (
        <InlineText style={{ whiteSpace: "nowrap", textAlign: "right" }}>
          {CurrencyFormatter.format(item.totalEarned - item.lastTotalEarned)}
        </InlineText>
      ),
    },
    {
      title: "Всего проиграно",
      dataIndex: "totalLoss",
      key: "totalLoss",
      width: 100,
      align: 'right',
      render: (_t, item) => (
        <InlineText style={{ whiteSpace: "nowrap", textAlign: "right" }}>
          {CurrencyFormatter.format(item.totalLoss)}
        </InlineText>
      ),
    },
    {
      title: "Всего заработано",
      dataIndex: "totalEarned",
      key: "totalEarned",
      width: 100,
      align: 'right',
      render: (_t, item) => (
        <InlineText style={{ whiteSpace: "nowrap", textAlign: "right" }}>
          {CurrencyFormatter.format(item.totalEarned)}
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
    },
  ];

  return (
    <>
      {contextHolder}

      <Space direction="horizontal" style={{ marginBottom: 16 }}>
        <div style={{ minWidth: 200 }}>
          <UserSelect
            users={users}
            loading={loadingUsers}
            onChange={(val) => setFilter((f) => ({ ...f, userId: val }))}
          />
        </div>
        <Button
          type="primary"
          onClick={handleFetchData}
          loading={loadingUsers}
          disabled={loadingUsers}
        >
          Поиск
        </Button>
      </Space>
      <Table
        loading={loadingUsers}
        columns={columns as any}
        dataSource={users}
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
