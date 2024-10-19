import { Button, Form, Input, Space } from "antd";
import React, { useEffect, useState } from "react";

interface ReferralInvitationFormProps {
  initialValue?: any;
  open?: boolean;
  loading?: boolean;
  onSubmit: (name: string) => Promise<void>;
  onClose: () => void;
}

function ReferralInvitationForm({
  initialValue,
  open,
  loading,
  onSubmit,
  onClose,
}: ReferralInvitationFormProps) {
  const isEdit = !!initialValue;
  const [referralInvitationName, setReferralInvitationName] =
    useState<string>("");

  const isFormValid = referralInvitationName.length > 0;

  //reset form state, if modal with form is closed
  useEffect(() => {
    if (!open) {
      //reset value
      console.log("reset value");
      setReferralInvitationName("");
    } else {
      //set initial state
      setReferralInvitationName(initialValue?.name || "");
    }
  }, [open, initialValue]);

  return (
    <Form layout="vertical">
      <Form.Item label="Название (источник трафика)">
        <Input
          placeholder="Название"
          disabled={loading}
          value={referralInvitationName}
          onChange={(e) => setReferralInvitationName(e.target.value)}
        />
      </Form.Item>

      <Space
        direction="horizontal"
        style={{ width: "100%", justifyContent: "flex-end" }}
        align="center"
      >
        <Button key="back" onClick={onClose}>
          Отменить
        </Button>
        <Button
          disabled={!isFormValid}
          type="primary"
          loading={loading}
          onClick={() => onSubmit(referralInvitationName)}
        >
          {isEdit ? "Сохранить" : "Создать"}
        </Button>
      </Space>
    </Form>
  );
}

export default ReferralInvitationForm;
