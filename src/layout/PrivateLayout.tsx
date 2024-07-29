import { Button, Layout, Menu, Space, Spin, notification, theme } from "antd";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { adminMenuItems, managerMenuItems } from "../constants/menuItems";
import { AppContext } from "../context/AppContext";
import { api, withCredentials } from "../services/api";
import { createSocket } from "../services/socketService";
import { User } from "@customTypes/entity/User";
import { UserRole } from "@customTypes/enum/UserRole";

type Props = {
  children: React.ReactNode;
};

const { Content, Footer, Sider } = Layout;

const PrivateLayout = ({ children }: Props) => {
  const [user, setUser] = useState<User | null>(null);
  const socket = useMemo(
    () => createSocket(localStorage.getItem("accessToken")),
    []
  );
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
    socket.on("connect_error", (err) => {
      console.log(`connect_error due to ${err.message}`);
    });
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
      console.log(localStorage.getItem("accessToken"));

      const resp = await withCredentials((headers) =>
        api.get("user/profile", headers)
      );
      setUser(resp.data);
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

  const menuItems = useMemo(() => {
    if (!user) return [];
    const role = user.role;
    let tmpItems = [];
    if (role === UserRole.ADMIN) {
      tmpItems = adminMenuItems;
    } else if (role === UserRole.MANAGER) {
      tmpItems = managerMenuItems;
    }
    return tmpItems;
  }, [user]);

  if (loading) {
    return (
      <Space style={{ justifyContent: "center" }}>
        <Spin size="large" />
      </Space>
    );
  }

  return (
    <AppContext.Provider value={{ user }}>
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
    </AppContext.Provider>
  );
};

export default PrivateLayout;
