import React from "react";
import { Modal } from "antd";
import { getUserLabel } from "@utils/user";
import { User } from "@customTypes/entity/User";
import GameHistory from "../../pages/GameHistory";

interface UserGameHistoryModalProps {
  open: boolean;
  user?: User;
  onClose: () => void;
}

const UserGameHistoryModal = ({ open, user, onClose }: UserGameHistoryModalProps) => {
  const userLabel = user ? getUserLabel(user) : "";

  return (
    <Modal
      title={`История игр ${user ? userLabel : ""}`}
      onCancel={onClose}
      footer={null}
      width={1200}
      open={open}
    >
      <GameHistory user={user} />
    </Modal>
  );
};

export default UserGameHistoryModal;
