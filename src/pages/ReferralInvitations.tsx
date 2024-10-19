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
import ReferralInvitationForm from "components/ReferralInvitationForm/ReferralInvitationForm";
import Swal from "sweetalert2";
import CopyableText from "components/CopyableText/CopyableText";

function ReferralInvitations() {
  const [referralInvitations, setReferralInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [referralInvitationModalOpen, setReferralInvitationModalOpen] =
    useState({
      open: false,
      referrralInvitation: null,
    });

  const [loadingSaveReferralInvitations, setLoadingSaveReferralInvitations] =
    useState<boolean>(false);

  const [managerReferralHistoryModalOpen, setManagerReferralHistoryModalOpen] =
    useState<any>({
      open: false,
      referralInvitationId: null,
    });

  useEffect(() => {
    fetchData();
  }, []);

  async function handleSubmitReferralInviatationForm(name: string) {
    const referralInvitation = referralInvitationModalOpen.referrralInvitation;
    try {
      setLoadingSaveReferralInvitations(true);
      const body = {
        name,
      };
      if (referralInvitation) {
        //edit
        await withCredentials((headers) =>
          api.patch(`/referral-invite/${referralInvitation.id}`, body, headers)
        );
      } else {
        //create new
        await withCredentials((headers) =>
          api.post("referral-invite", body, headers)
        );
      }

      handleModalClose();
      await fetchData();
    } catch (error) {
      console.log(error);
      Swal.fire("Error", error.message, "error");
    } finally {
      setLoadingSaveReferralInvitations(false);
    }
  }

  const handleModalClose = () => {
    setReferralInvitationModalOpen({ open: false, referrralInvitation: null });
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
        key: "1",
        label: "Изменить",
        onClick: () =>
          setReferralInvitationModalOpen({
            open: true,
            referrralInvitation: item,
          }),
      },
      {
        key: "2",
        label: "Удалить",
        danger: true,
        onClick: () => handleDeleteReferralInvitation(item.id),
      },
    ];
  };

  const columns: ColumnsType<any> = [
    {
      title: "Название",
      dataIndex: "name",
      key: "name",
      render: (text: string) => (
        <InlineText>{text}</InlineText>
      ),
    },
    {
      title: "Дата создания",
      dataIndex: "created_at",
      key: "created_at",
      render: (timestamp) => (
        <InlineText>{moment(timestamp).format("D.MM.YYYY")}</InlineText>
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
      render: (link) => <CopyableText>{link}</CopyableText>,
    },
    {
      title: "ТГ Ссылка",
      dataIndex: "tg_link",
      key: "tg_link",
      render: (link) => <CopyableText>{link}</CopyableText>,
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
          onClick={() =>
            setReferralInvitationModalOpen({
              open: true,
              referrralInvitation: null,
            })
          }
        >
          Создать ссылку
        </Button>
      </Space>

      <Modal
        open={!!referralInvitationModalOpen.open}
        title={
          !referralInvitationModalOpen.referrralInvitation
            ? "Новая реферальная ссылка"
            : "Редактирование реферальной ссылки"
        }
        onCancel={handleModalClose}
        footer={null}
      >
        <ReferralInvitationForm
          open={!!referralInvitationModalOpen.open}
          initialValue={referralInvitationModalOpen?.referrralInvitation}
          loading={loadingSaveReferralInvitations}
          onClose={handleModalClose}
          onSubmit={handleSubmitReferralInviatationForm}
        />
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
