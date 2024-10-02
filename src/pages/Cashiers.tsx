import { Button, Input, Modal, Space, Table, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { api, withCredentials } from "../services/api";
import { ColumnsType } from "antd/es/table";
const { Text } = Typography;
import { DeleteOutlined } from "@ant-design/icons";
import { getUserTelegramLabel } from "@utils/user";

function Cashiers() {
  const [cashiers, setCashiers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [createCashierModalOpen, setCreateCashierModalOpen] = useState(false);
  const [loadingCreateCashier, setLoadingCreateCashier] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [telegramId, setTelegramId] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function handleCreateCashier(email: string, password: string) {
    try {
      setLoadingCreateCashier(true);
      await withCredentials((headers) =>
        api.post("admin/create-cashier", { email, password, telegram_id: telegramId }, headers)
      );
      handleModalClose();
      await fetchData();
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingCreateCashier(false);
    }
  }

  const handleModalClose = () => {
    setCreateCashierModalOpen(false);
    setEmail("");
    setPassword("");
  };

  async function fetchData() {
    try {
      setLoading(true);
      const resp = await withCredentials((headers) =>
        api.get(`admin/cashiers`, headers)
      );
      setCashiers(resp.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  const columns: ColumnsType<any> = [
    {
      title: "Имя",
      dataIndex: "name",
      key: "name",
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
      key: "telegram",
      render: (_text, user) => <Text>{getUserTelegramLabel(user)}</Text>,
    },
    {
      title: "",
      key: "action",
      render: (_, item) => (
        <Space
          style={{
            width: "100%",
            marginLeft: 20,
            justifyContent: "flex-end",
            padding: "0px 30px",
          }}
        >
          <Button icon={<DeleteOutlined />} danger />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Table
        loading={loading}
        columns={columns}
        dataSource={cashiers}
        rowKey={(manager) => manager.id}
      />
      <Space>
        <Button type="primary" onClick={() => setCreateCashierModalOpen(true)}>
          Создать кассира
        </Button>
      </Space>

      <Modal
        open={!!createCashierModalOpen}
        title="Новый кассир"
        onCancel={handleModalClose}
        footer={[
          <Button key="back" onClick={handleModalClose}>
            Отменить
          </Button>,
          <Button
            type="primary"
            loading={loadingCreateCashier}
            onClick={() => handleCreateCashier(email, password)}
          >
            Отправить
          </Button>,
        ]}
      >
        <Input
          placeholder="Введите логин"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          style={{ marginTop: 10 }}
          placeholder="Введите пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Input
          style={{ marginTop: 10 }}
          placeholder="Введите telegram id"
          value={telegramId}
          onChange={(e) => setTelegramId(e.target.value)}
        />
      </Modal>
    </div>
  );
}

export default Cashiers;
