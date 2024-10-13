import { Button, Input, Modal, Space, Table, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { api, withCredentials } from "../services/api";
import { ColumnsType } from "antd/es/table";
const { Text } = Typography;
import { DeleteOutlined } from "@ant-design/icons";
import { getUserTelegramLabel } from "@utils/user";

function Managers() {
  const [managers, setManagers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [createManagerModalOpen, setCreateManagerModalOpen] = useState(false);
  const [loadingCreateManager, setLoadingCreateManager] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function handleCreateManager(email: string, password: string) {
    try {
      setLoadingCreateManager(true);
      await withCredentials((headers) =>
        api.post("admin/create-manager", { email, password }, headers)
      );
      handleModalClose();
      await fetchData();
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingCreateManager(false);
    }
  }

  const handleModalClose = () => {
    setCreateManagerModalOpen(false);
    setEmail("");
    setPassword("");
  };

  async function handleDeleteManager(id: string) {
    try {
      await withCredentials((headers) =>
        api.delete(`admin/managers/${id}`, headers)
      );
      await fetchData();
    } catch (err) {
      console.log(err);
    }
  }

  async function fetchData() {
    try {
      setLoading(true);
      const resp = await withCredentials((headers) =>
        api.get(`admin/managers`, headers)
      );
      setManagers(resp.data.data);
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
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDeleteManager(item.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Table
        loading={loading}
        columns={columns}
        dataSource={managers}
        rowKey={(manager) => manager.id}
      />
      <Space>
        <Button type="primary" onClick={() => setCreateManagerModalOpen(true)}>
          Создать менеджера
        </Button>
      </Space>

      <Modal
        open={!!createManagerModalOpen}
        title="Новый менеджер"
        onCancel={handleModalClose}
        footer={[
          <Button key="back" onClick={handleModalClose}>
            Отменить
          </Button>,
          <Button
            type="primary"
            loading={loadingCreateManager}
            onClick={() => handleCreateManager(email, password)}
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
      </Modal>
    </div>
  );
}

export default Managers;
