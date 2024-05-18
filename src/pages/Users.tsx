import { Button, Tag, Typography, Table, App, notification } from "antd";
import { useEffect, useState } from "react";
const { Text } = Typography;
import type { ColumnsType } from "antd/es/table";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

const Users = () => {
  const [appState, setAppState] = useState();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(()=>{
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setLoading(true);
      const resp = await api.get(`user`);
      setAppState(resp.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  const columns: ColumnsType<any> = [
    {
      title: "ФИО",
      dataIndex: "name",
      key: "name",
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: "Баланс",
      dataIndex: "balance",
      key: "balance",
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: "Заработано",
      dataIndex: "earned",
      key: "earned",
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: "Номер телефона",
      dataIndex: "phone",
      key: "phone",
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: "Почта",
      dataIndex: "email",
      key: "email",
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: "TG",
      dataIndex: "telegram_id",
      key: "telegram_id",
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: "",
      key: "action",
      render: (_, item) => (
        <Button onClick={() => navigate(item.id)}>Открыть</Button>
      ),
    },
  ];

  return (
    <>
      <Table
        loading={loading}
        columns={columns}
        dataSource={appState}
        rowKey={(meditation) => meditation.id}
      />
    </>
  );
};

export default Users;
