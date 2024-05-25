import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input, Typography } from "antd";
import { useState } from "react";
import { api, withCredentials } from "../services/api";
import { useNavigate } from "react-router-dom";

const { Text, Title, Link } = Typography;

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onFinish(email: string, password: string) {
    try {
      const resp = await api.post("auth/sign", { email, password });
      const tokens = resp.data.tokens;
      localStorage.setItem("accessToken", tokens.accessToken);
      sessionStorage.setItem("refreshToken", tokens.refreshToken);
      navigate("/games");
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <section
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%",
      }}
    >
      <div style={{ width: 500, margin: "0px auto" }}>
        <div>
          <Title>Вход</Title>
        </div>
        <Form
          name="normal_login"
          initialValues={{
            remember: true,
          }}
          onFinish={() => onFinish(email, password)}
          layout="vertical"
          requiredMark="optional"
        >
          <Form.Item
            name="email"
            rules={[
              {
                type: "email",
                required: true,
                message: "Пожалуйста введите email",
              },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: "Пожалуйста введите пароль!",
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Item>
          <Form.Item>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Запомнить меня</Checkbox>
            </Form.Item>
            {/* <a href="">Забыли пароль?</a> */}
          </Form.Item>
          <Form.Item style={{ marginBottom: "0px" }}>
            <Button block type="primary" htmlType="submit">
              Войти
            </Button>
          </Form.Item>
        </Form>
      </div>
    </section>
  );
}

export default LoginPage;
