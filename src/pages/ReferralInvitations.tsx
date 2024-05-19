import {
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  Space,
  Table,
  Typography,
} from "antd";
import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import { ColumnsType } from "antd/es/table";
const { Text } = Typography;
import { DeleteOutlined } from "@ant-design/icons";
import moment from "moment";

function ReferralInvitations() {
  const [referralInvitations, setReferralInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [
    createReferralInvitationModalOpen,
    setCreateReferralInvitationModalOpen,
  ] = useState(false);
  const [
    loadingCreateReferralInvitations,
    setLoadingCreateReferralInvitations,
  ] = useState(false);
  const [expireDate, setExpireDate] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function handleCreateReferralInvitation(expireDate: string) {
    try {
      setLoadingCreateReferralInvitations(true);
      await api.post("referral-invite", { expire_date: expireDate });
      handleModalClose();
      await fetchData();
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingCreateReferralInvitations(false);
    }
  }

  const handleModalClose = () => {
    setCreateReferralInvitationModalOpen(false);
    setExpireDate("");
  };

  async function fetchData() {
    try {
      setLoading(true);
      const resp = await api.get(`referral-invite`);
      setReferralInvitations(resp.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteReferralInvitation(id: string) {
    try {
      await api.delete(`referral-invite/${id}`);
      await fetchData();
    } catch (error) {
      console.log(error);
    }
  }

  const columns: ColumnsType<any> = [
    {
      title: "Дата создания",
      dataIndex: "created_at",
      key: "created_at",
      render: (timestamp) => (
        <Text>{moment(timestamp).format("D.MM.YYYY")}</Text>
      ),
    },
    {
      title: "Действует до",
      dataIndex: "expire_date",
      key: "expire_date",
      render: (timestamp) => (
        <Text>{moment(timestamp).format("D.MM.YYYY")}</Text>
      ),
    },
    {
      title: "Статус",
      dataIndex: "is_used",
      key: "is_used",
      render: (isUsed) => (
        <Text>{isUsed ? "Использовано" : "Не использовано"}</Text>
      ),
    },
    {
      title: "Ссылка",
      dataIndex: "id",
      key: "id",
      render: (id) => <Text>{id}</Text>,
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
            onClick={() => handleDeleteReferralInvitation(item.id)}
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
        dataSource={referralInvitations}
        rowKey={(referralInvitation) => referralInvitation.id}
      />
      <Space>
        <Button
          type="primary"
          onClick={() => setCreateReferralInvitationModalOpen(true)}
        >
          Создать ссылку
        </Button>
      </Space>

      <Modal
        open={!!createReferralInvitationModalOpen}
        title="Новая реферальная ссылка"
        onCancel={handleModalClose}
        footer={[
          <Button key="back" onClick={handleModalClose}>
            Отменить
          </Button>,
          <Button
            type="primary"
            loading={loadingCreateReferralInvitations}
            onClick={() => handleCreateReferralInvitation(expireDate)}
          >
            Отправить
          </Button>,
        ]}
      >
        <Form layout="vertical">
          <Form.Item label="Действует до" name="expire_date">
            <DatePicker onChange={(_, date: string) => setExpireDate(date)} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default ReferralInvitations;
