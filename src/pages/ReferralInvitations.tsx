import {
  Button,
  DatePicker,
  Dropdown,
  Form,
  Input,
  MenuProps,
  Modal,
  Space,
  Table,
  Typography,
} from "antd";
import React, { useEffect, useState } from "react";
import { api, withCredentials } from "../services/api";
import { ColumnsType } from "antd/es/table";
const { Text } = Typography;
import { DeleteOutlined } from "@ant-design/icons";
import moment from "moment";
import InlineText from "components/InlineText";
import { InfoCircleOutlined } from "@ant-design/icons";
import ManagerReferralHistoryModal from "components/ManagerReferralHistoryModal/ManagerReferralHistoryModal";

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
  const [managerReferralHistoryModalOpen, setManagerReferralHistoryModalOpen] =
    useState<any>({
      open: false,
      referralInvitationId: null,
    });

  const [expireDate, setExpireDate] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function handleCreateReferralInvitation(expireDate: string) {
    try {
      setLoadingCreateReferralInvitations(true);
      await withCredentials((headers) =>
        api.post("referral-invite", { expire_date: expireDate }, headers)
      );
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
      const resp = await withCredentials((headers) =>
        api.get(`referral-invite`, headers)
      );
      setReferralInvitations(resp.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteReferralInvitation(id: string) {
    try {
      await withCredentials((headers) =>
        api.delete(`referral-invite/${id}`, headers)
      );
      await fetchData();
    } catch (error) {
      console.log(error);
    }
  }

  const dropdownActionMenuItems = (item: any): MenuProps["items"] => {
    return [
      {
        key: "0",
        label: "Пользователи",
        onClick: () =>
          setManagerReferralHistoryModalOpen({
            open: true,
            referralInvitationId: item.id,
          }),
      },
      {
        key: "6",
        label: "Удалить",
        danger: true,
        onClick: () => handleDeleteReferralInvitation(item.id),
      },
    ];
  };

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
      title: "Количество регистраций",
      dataIndex: "nusers",
      key: "nusers",
      render: (text: number, item: any) => (
        <InlineText>
          {text}
          <Button
            onClick={() =>
              setManagerReferralHistoryModalOpen({
                open: true,
                referralInvitationId: item.id,
              })
            }
            icon={<InfoCircleOutlined />}
            type="link"
            style={{ marginLeft: 4 }}
          />
        </InlineText>
      ),
    },
    {
      title: "Ссылка",
      dataIndex: "link",
      key: "link",
      render: (link) => <Text>{link}</Text>,
    },
    {
      title: "ТГ Ссылка",
      dataIndex: "tg_link",
      key: "tg_link",
      render: (link) => <Text>{link}</Text>,
    },
    {
      title: "",
      key: "action",
      render: (_, item) => (
        <Dropdown menu={{ items: dropdownActionMenuItems(item) }}>
          <Button onClick={(e) => e.preventDefault()}>Опции</Button>
        </Dropdown>
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

      <ManagerReferralHistoryModal
        open={managerReferralHistoryModalOpen.open}
        referralInvitationId={
          managerReferralHistoryModalOpen.referralInvitationId
        }
        onClose={() =>
          setManagerReferralHistoryModalOpen({
            open: false,
            referralInvitationId: null,
          })
        }
      />
    </div>
  );
}

export default ReferralInvitations;
