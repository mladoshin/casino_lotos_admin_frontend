import { Button, Layout, Menu, Space, Spin, notification, theme } from "antd";
import { useNavigate } from "react-router-dom";

import { menuItems } from "../constants/menuItems";
import { useEffect, useState } from "react";
import { createSocket } from "../services/socketService";
import { api } from "../services/api";

type Props = {
  children: React.ReactNode;
};

const { Content, Footer, Sider } = Layout;

const PrivateLayout = ({ children }: Props) => {
  const socket = createSocket(sessionStorage.getItem("accessToken"));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const onClick = (item: any) => {
    console.log(item);
    navigate(item.key);
  };

  const [notificationApi, contextHolder] = notification.useNotification();

  useEffect(() => {
    // check if user is authenticated
    validateUser();

    socket.on("connect", () => console.log("Connected"));
    socket.on("disconnect", () => console.log("Disconnected"));
    socket.on("admin-message", handleReceiveMessage);
    socket.on("payment.crypto.pending", handleReceiveMessage);
    socket.on("payment.crypto.success", handleReceiveMessage);
    socket.on("payment.bank.pending", handleReceiveMessage);
    socket.on("payment.bank.waiting-confirmation", handleReceiveMessage);
    socket.on("payment.bank.success", handleReceiveMessage);
    socket.on("withdraw.pending", handleReceiveMessage);
    socket.on("withdraw.cancelled", handleReceiveMessage);
    socket.on("withdraw.success", handleReceiveMessage);

    return () => {
      socket.off("connect", () => console.log("Connected"));
      socket.off("disconnect", () => console.log("Disconnected"));
      socket.off("admin-message", handleReceiveMessage);
      socket.off("payment.crypto.pending", handleReceiveMessage);
      socket.off("payment.crypto.success", handleReceiveMessage);
      socket.off("payment.bank.pending", handleReceiveMessage);
      socket.off("payment.bank.waiting-confirmation", handleReceiveMessage);
      socket.off("payment.bank.success", handleReceiveMessage);
      socket.off("withdraw.pending", handleReceiveMessage);
      socket.off("withdraw.cancelled", handleReceiveMessage);
      socket.off("withdraw.success", handleReceiveMessage);
    };
  }, []);

  async function validateUser() {
    const accessToken = localStorage.getItem("accessToken");
    let error = false;

    if (!accessToken) {
      error = true;
    }

    try {
      await api.get("user/profile", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      setLoading(false);
    } catch (err) {
      console.log(err);
      error = true;
    }

    if (error) {
      navigate("login");
    }
  }

  function handleReceiveMessage(message: string | { msg: string; data: any }) {
    let msg = message as string;
    if (typeof message !== "string") {
      msg = message.msg;
    }
    notificationApi.info({ message: msg, placement: "bottomRight" });
  }

  function handleLogout() {
    sessionStorage.removeItem("refreshToken");
    localStorage.removeItem("accessToken");
    navigate("/login");
  }

  if (loading) {
    return (
      <Space style={{ justifyContent: "center" }}>
        <Spin size="large" />
      </Space>
    );
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Content style={{ padding: "48px" }}>
        <Layout
          style={{
            padding: "24px 0",
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Sider style={{ background: colorBgContainer }} width={250}>
            <Menu
              mode="inline"
              defaultSelectedKeys={["1"]}
              defaultOpenKeys={["sub1"]}
              style={{ height: "100%" }}
              items={menuItems}
              onClick={onClick}
            />
          </Sider>
          <Content style={{ padding: "0 24px", minHeight: 280 }}>
            {contextHolder}
            {children}
          </Content>
        </Layout>
      </Content>
      <Footer style={{ textAlign: "center" }}>
        <Button onClick={handleLogout}>Выйти</Button>
      </Footer>
    </Layout>
  );
};

export default PrivateLayout;
