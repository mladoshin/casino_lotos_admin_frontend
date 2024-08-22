import { Button, Form, Input, Space, Typography } from "antd";
import { useEffect, useState } from "react";
import { api, withCredentials } from "../services/api";

const { Text } = Typography;

function AccountPage() {
  const [profileData, setProfileData] = useState<null | Record<string, any>>(
    null
  );
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingSave, setLoadingSave] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>("");

  useEffect(() => {
    handleFetchProfileData();
  }, []);

  async function handleFetchProfileData() {
    try {
      const resp = await withCredentials((headers) =>
        api.get("user/profile", headers)
      );
      setProfileData(resp.data);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleResetForm() {
    setPassword("");
    setConfirmPassword("");
    await handleFetchProfileData();
  }

  async function handleChangePassword() {
    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    try {
      setError("");
      setLoadingSave(true);
      await withCredentials((headers) =>
        api.post("user/change-password", { password: password }, headers)
      );
    } catch (error) {
      setError(error.response.data?.message);
    }

    setLoadingSave(false);
  }

  return (
    <div>
      <h2>Аккаунт</h2>
      <Form name="basic" layout="horizontal">
        <Form.Item label="Имя" name="name">
          <Text>{profileData?.name || "N/A"}</Text>
        </Form.Item>

        <Form.Item label="Фамилия" name="surname">
          <Text>{profileData?.surname || "N/A"}</Text>
        </Form.Item>

        <Form.Item label="Почта" name="email">
          <Text>{profileData?.email || "N/A"}</Text>
        </Form.Item>

        <Form.Item label="Телефон" name="phone">
          <Text>{profileData?.phone || "N/A"}</Text>
        </Form.Item>

        <Form.Item label="Телеграм" name="tg">
          <Text>{profileData?.telegram_username || "N/A"}</Text>
        </Form.Item>

        <h3>Смена пароля</h3>

        <Form.Item label="Новый пароль" name="password">
          <Input.Password
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Item>
        <Form.Item label="Повторите пароль" name="confirmPassword">
          <Input.Password
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </Form.Item>

        <Text style={{ color: "red" }}>{error}</Text>
      </Form>

      <Space
        style={{ width: "100%", justifyContent: "flex-end", marginTop: 50 }}
      >
        <Button onClick={handleResetForm}>Отменить</Button>
        <Button
          type="primary"
          onClick={handleChangePassword}
          loading={loadingSave}
        >
          Сохранить изменения
        </Button>
      </Space>
    </div>
  );
}

export default AccountPage;
