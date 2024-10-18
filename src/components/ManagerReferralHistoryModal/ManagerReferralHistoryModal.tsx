import { Modal } from "antd";
import ManagerReferralHistory from "components/ManagerReferralHistory/ManagerReferralHistory";
import React from "react";

interface ManagerReferralHistoryModalProps {
  open: boolean;
  referralInvitationId: string;
  onClose: () => void;
}

function ManagerReferralHistoryModal({
  referralInvitationId,
  open,
  onClose,
}: ManagerReferralHistoryModalProps) {
  return (
    <Modal
      title={`Пользователи для ссылки (id = ${referralInvitationId})`}
      onCancel={onClose}
      footer={null}
      width={1200}
      open={open}
    >
      <ManagerReferralHistory referralInvitationId={referralInvitationId} />
    </Modal>
  );
}

export default ManagerReferralHistoryModal;
