import { Button, Layout, Menu, Space, Spin, notification, theme } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import React, { useEffect, useMemo, useState } from "react";
import {
  adminMenuItems,
  cashierMenuItems,
  managerMenuItems,
} from "../constants/menuItems";
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
  const [isAsideOpen, setAsideOpen] = useState(true);
  const pathname = useLocation();
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
    if (isAsideOpen) document.body.classList.add("noscroll");
    else document.body.classList.remove("noscroll");
  }, [isAsideOpen]);

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

      if (resp.data.role === UserRole.USER) {
        throw new Error("Forbidden!");
      }
      
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
    } else if (role === UserRole.CASHIER) {
      tmpItems = cashierMenuItems;
    }
    console.log(tmpItems);
    return tmpItems;
  }, [user]);

  const getNameByLocation = () => {
    var temp = [];
    var pn = pathname.pathname;
    if (pn.endsWith("/")) {
      pn = "/" + pn.replace("/", "").replace("/", "");
    }
    for (var i = 0; i < menuItems.length; i++) {
      if (menuItems[i].key.startsWith("sub")) {
        for (var d = 0; d < menuItems[i].children.length; d++) {
          if (menuItems[i].children[d].key == pn)
            return menuItems[i].children[d].label;
        }
      } else if (menuItems[i].key == pn) return menuItems[i].label;
    }
    return "";
  };
  if (loading) {
    return (
      <Space style={{ justifyContent: "center" }}>
        <Spin size="large" />
      </Space>
    );
  }

  return (
    <AppContext.Provider value={{ user }}>
      <Layout
        className={isAsideOpen ? "aside" : ""}
        style={{ minHeight: "100vh" }}
      >
        <Content className="first-m" style={{ display: "none" }}>
          <Layout
            style={{
              display: "flex",
              gap: "12px",
              marginBottom: "24px",
              flexDirection: "row",
              alignItems: "center",
              fontWeight: 700,
              fontSize: "20px",
            }}
          >
            <Button
              onClick={() => {
                setAsideOpen(!isAsideOpen);
              }}
              className="toggle-aside"
              style={{
                padding: "0",
                alignItems: "center",
                justifyContent: "center",
                width: "32px",
                height: "32px",
              }}
            >
              <svg
                width={20}
                height={20}
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <mask
                  id="mask0_186_1718"
                  style={{ maskType: "alpha" }}
                  maskUnits="userSpaceOnUse"
                  x={1}
                  y={2}
                  width={18}
                  height={16}
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M1.66699 3.75C1.66699 3.41848 1.79242 3.10054 2.01567 2.86612C2.23893 2.6317 2.54173 2.5 2.85747 2.5H17.1432C17.4589 2.5 17.7617 2.6317 17.985 2.86612C18.2082 3.10054 18.3337 3.41848 18.3337 3.75C18.3337 4.08152 18.2082 4.39946 17.985 4.63388C17.7617 4.8683 17.4589 5 17.1432 5H2.85747C2.54173 5 2.23893 4.8683 2.01567 4.63388C1.79242 4.39946 1.66699 4.08152 1.66699 3.75ZM1.66699 10C1.66699 9.66848 1.79242 9.35054 2.01567 9.11612C2.23893 8.8817 2.54173 8.75 2.85747 8.75H17.1432C17.4589 8.75 17.7617 8.8817 17.985 9.11612C18.2082 9.35054 18.3337 9.66848 18.3337 10C18.3337 10.3315 18.2082 10.6495 17.985 10.8839C17.7617 11.1183 17.4589 11.25 17.1432 11.25H2.85747C2.54173 11.25 2.23893 11.1183 2.01567 10.8839C1.79242 10.6495 1.66699 10.3315 1.66699 10ZM1.66699 16.25C1.66699 15.9185 1.79242 15.6005 2.01567 15.3661C2.23893 15.1317 2.54173 15 2.85747 15H17.1432C17.4589 15 17.7617 15.1317 17.985 15.3661C18.2082 15.6005 18.3337 15.9185 18.3337 16.25C18.3337 16.5815 18.2082 16.8995 17.985 17.1339C17.7617 17.3683 17.4589 17.5 17.1432 17.5H2.85747C2.54173 17.5 2.23893 17.3683 2.01567 17.1339C1.79242 16.8995 1.66699 16.5815 1.66699 16.25Z"
                    fill="#006FFD"
                  />
                </mask>
                <g mask="url(#mask0_186_1718)">
                  <rect width={20} height={20} fill="#8F9098" />
                </g>
              </svg>
            </Button>
            <p style={{ margin: "0" }}>{getNameByLocation()}</p>
          </Layout>
        </Content>
        <Content className="main-c" style={{ padding: "48px" }}>
          <Layout
            style={{
              padding: "24px 0",
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Sider
              onClick={(e) => {
                if (!(e.target instanceof HTMLElement)) return;
                if (
                  e.target?.nodeName == "LI" ||
                  (e.target != null && e.target.nodeName == "SPAN")
                ) {
                  setAsideOpen(false);
                }
              }}
              className={isAsideOpen ? "aside--open" : ""}
              style={{ background: "red" }}
              width={250}
            >
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
