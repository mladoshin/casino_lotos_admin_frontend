import React from "react";
import { Modal} from "antd";
import { getUserLabel } from "@utils/user";
import { User } from "@customTypes/entity/User";
import IncomingTransactions from "../../pages/IncomingTransactions";
import WithdrawTransactions from "../../pages/WithdrawTransactions";

interface UserTransactionsModalProps {
  open: boolean;
  user?: User;
  type?: "deposits" | "withdrawals";
  onClose: () => void;
}

const UserTransactionsModal: React.FC<UserTransactionsModalProps> = ({
  open,
  user,
  type,
  onClose,
}) => {
  const userLabel = user ? getUserLabel(user) : "";
  const modalTitle =
    type === "deposits" ? `Депозиты ${userLabel}` : `Выводы ${userLabel}`;

  return (
    <Modal
      title={modalTitle}
      onCancel={onClose}
      footer={null}
      width={1200}
      open={open}
    >
      {type === "deposits" && <IncomingTransactions user={user}/>}
      {type === "withdrawals" && <WithdrawTransactions user={user}/>}
    </Modal>
  );
};

export default UserTransactionsModal;
