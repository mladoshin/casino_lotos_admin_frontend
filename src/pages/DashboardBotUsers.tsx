import { User } from "@customTypes/entity/User";
import { getUserLabel } from "@utils/user";
import { Button, Dropdown, MenuProps, Space } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import InlineText from "../components/InlineText";
import UserSelect from "../components/UserSelect/UserSelect";
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, withCredentials } from "../services/api";
import Swal from "sweetalert2";
import DashboardBotCreateUserModal from "components/DashboardBotCreateUserModal/DashboardBotCreateUserModal";

function DashboardBotUsers() {
  const navigate = useNavigate();
  const flag = useRef(false);
  const [botUsers, setBotUsers] = useState([]);
  const [allBotUsers, setAllBotUsers] = useState([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState({
    fetch: false,
    create: false,
    delete: false,
  });
  const [filter, setFilter] = useState<any>({
    userId: null,
  });

  useEffect(() => {
    handleFetchBotUsers();
  }, []);

  async function handleFetchBotUsers(userId?: string) {
    setLoading((s) => ({ ...s, fetch: true }));
    try {
      const params = { userId };
      const resp = await withCredentials((headers) =>
        api.get(`/dashboard-statistics-bot/users`, { ...headers, params })
      );
      setBotUsers(resp.data);
      //only set allBotUsers on first fetch
      if (!flag.current) {
        setAllBotUsers(resp.data?.map((item) => item.user));
      }
      flag.current = true;
    } catch (err) {
      console.log(err);
      Swal.fire("Error", err.message, "error");
    }
    setLoading((s) => ({ ...s, fetch: false }));
  }

  async function handleDeleteBotUser(userId: string) {
    setLoading((s) => ({ ...s, delete: true }));
    try {
      await withCredentials((headers) =>
        api.delete(`/dashboard-statistics-bot/users/${userId}`, headers)
      );
      await handleFetchBotUsers()
    } catch (err) {
      console.log(err);
      Swal.fire("Error", err.message, "error");
    }
    setLoading((s) => ({ ...s, delete: false }));
  }

  async function handleCreateBotUser(userId: string) {
    setLoading((s) => ({ ...s, create: true }));
    try {
      await withCredentials((headers) =>
        api.post(`/dashboard-statistics-bot/users`, { userId }, headers)
      );
      setModalOpen(false)
      await handleFetchBotUsers()
    } catch (err) {
      console.log(err);
      const errorMessage = `<p>${err.message}</p><p>${err.response?.data?.message}</p>`
      Swal.fire("Error", errorMessage, "error");
    }
    setLoading((s) => ({ ...s, create: false }));
  }

  const dropdownActionMenuItems = (user: User): MenuProps["items"] => {
    return [
      {
        key: "0",
        label: "Профиль",
        onClick: () => navigate(`/users/${user.id}`),
      },
      {
        key: "6",
        label: "Удалить",
        danger: true,
        onClick: () => handleDeleteBotUser(user.id),
      },
    ];
  };

  const columns: ColumnsType<any> = [
    {
      title: "Пользователь",
      key: "name",
      width: 100,
      render: (_: any, item: any) => (
        <Link style={{ whiteSpace: "nowrap" }} to={`/users/${item.user.id}`}>
          {getUserLabel(item.user)}
        </Link>
      ),
    },
    {
      title: "ID чата",
      dataIndex: "chatId",
      key: "chatId",
      width: 100,
      render: (text) => (
        <InlineText style={{ whiteSpace: "nowrap" }}>{text}</InlineText>
      ),
    },
    {
      title: "",
      key: "action",
      fixed: "right",
      align: "right",
      render: (_, item) => (
        <Dropdown menu={{ items: dropdownActionMenuItems(item.user) }}>
          <Button onClick={(e) => e.preventDefault()}>Опции</Button>
        </Dropdown>
      ),
    },
  ];

  return (
    <div>
      <Space direction="horizontal" style={{ marginBottom: 16 }}>
        <div style={{ minWidth: 200 }}>
          <UserSelect
            users={allBotUsers}
            //loading={loading.fetch}
            onChange={(val) => setFilter((f) => ({ ...f, userId: val }))}
          />
        </div>
        <Button
          type="primary"
          onClick={() => handleFetchBotUsers(filter.userId)}
          loading={loading.fetch}
          disabled={loading.fetch}
        >
          Поиск
        </Button>
      </Space>
      <Table
        loading={loading.fetch}
        columns={columns}
        dataSource={botUsers}
        rowKey={(user) => user.id}
        scroll={{ x: "max-content", y: 500 }}
      />

      <Button style={{ marginTop: 16 }} onClick={() => setModalOpen(true)}>
        Добавить пользователя
      </Button>

      <DashboardBotCreateUserModal
        open={modalOpen}
        onCreate={(userId) => handleCreateBotUser(userId)}
        loading={loading.create}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}

export default DashboardBotUsers;
