import {
  Button,
  Checkbox,
  Form,
  Input,
  Select,
  Space,
  Spin,
  Switch,
} from "antd";
import React, { useEffect, useState } from "react";
import { api, withCredentials } from "../services/api";

const depositModeOptions = [
  { label: "Ручной", value: "manual" },
  { label: "Автоматический", value: "auto" },
];

type ConfigForm = {
  depositMode?: "manual" | "auto";
  deleteExpiredDepositSessions?: boolean;
  depositSessionDuration?: number;
};

function CasinoConfig() {
  const [form, setForm] = useState<ConfigForm>({});
  const [loading, setLoading] = useState(true);
  const [loadingSave, setLoadingSave] = useState(false);

  const handleChangeFormField = <T extends keyof ConfigForm>(
    field: T,
    value: ConfigForm[T]
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  useEffect(() => {
    handleFetchConfig();
  }, []);

  async function handleFetchConfig() {
    try {
      setLoading(true);
      const resp = await withCredentials((headers) =>
        api.get("/admin/app-config", headers)
      );
      setForm(resp.data);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  }

  async function handleSaveConfig() {
    try {
      setLoadingSave(true);
      const resp = await withCredentials((headers) =>
        api.post("/admin/app-config", form, headers)
      );
      setForm(resp.data);
    } catch (err) {
      console.log(err);
    }

    setLoadingSave(false);
  }

  if (loading) {
    return <Spin />;
  }

  return (
    <div>
      <h2>Конфигурация сервиса</h2>
      <Form
        name="basic"
        layout="vertical"
        initialValues={{ remember: true }}
        //onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item
          label="Тип пополнений"
          name="depositMode"
          initialValue={form.depositMode}
        >
          <Select
            options={depositModeOptions}
            onSelect={(val) => handleChangeFormField("depositMode", val)}
          />
        </Form.Item>

        <Form.Item
          label="Удалять просроченные сессии пополнений"
          name="deleteExpiredDepositSessions"
        >
          <Switch
            checked={form.deleteExpiredDepositSessions}
            onChange={(checked) =>
              handleChangeFormField("deleteExpiredDepositSessions", checked)
            }
          />
        </Form.Item>

        <Form.Item
          label="Длительность сесии пополнения (мин)"
          name="depositSessionDuration"
          initialValue={form.depositSessionDuration}
        >
          <Input
            type="number"
            min={1}
            onChange={(e) =>
              handleChangeFormField("depositSessionDuration", +e.target.value)
            }
          />
        </Form.Item>
      </Form>

      <Space
        style={{ width: "100%", justifyContent: "flex-end", marginTop: 50 }}
      >
        <Button onClick={handleFetchConfig}>Отменить</Button>
        <Button type="primary" onClick={handleSaveConfig} loading={loadingSave}>
          Сохранить изменения
        </Button>
      </Space>
    </div>
  );
}

export default CasinoConfig;
