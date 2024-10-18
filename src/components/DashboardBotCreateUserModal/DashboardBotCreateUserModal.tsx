import { Button, Modal } from "antd";
import UserSelect from "../UserSelect/UserSelect";
import useGetUsers from "../../hooks/useGetUsers";
import React, { useState } from "react";

interface DashboardBotCreateUserModalProps {
  open: boolean;
  loading?: boolean;
  onCreate: (userId: string) => Promise<void>;
  onClose: () => void;
}

function DashboardBotCreateUserModal({
  open,
  loading,
  onCreate,
  onClose,
}: DashboardBotCreateUserModalProps) {
  const { users, loading: loadingUsers } = useGetUsers({ fetchOnMount: true });
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  return (
    <Modal
      title={`Добавить пользователя для бота ежедневной статистики`}
      onCancel={onClose}
      width={500}
      open={open}
      footer={[
        <Button key="back" onClick={onClose}>
          Отменить
        </Button>,
        <Button
          type="primary"
          loading={loading}
          onClick={() => onCreate(selectedUserId)}
        >
          Отправить
        </Button>,
      ]}
    >
      <UserSelect
        disabled={loading}
        users={users}
        loading={loadingUsers}
        onChange={(userId) => setSelectedUserId(userId)}
      />
    </Modal>
  );
}

export default DashboardBotCreateUserModal;
