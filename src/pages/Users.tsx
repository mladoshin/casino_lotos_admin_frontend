import { Button, Tag, Typography, Table, App, notification } from 'antd'
import { useEffect, useState } from 'react';
const { Text } = Typography;
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios'


const Users = () => {
  const [appState, setAppState] = useState();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const apiUrl = 'http://95.213.173.58:3000/user';
    axios.get(apiUrl).then((resp) => {
      const allPersons = resp.data;
      setAppState(allPersons);
    });
  }, []);



  const columns: ColumnsType<any> = [
    {
      title: 'ФИО',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: 'Баланс',
      dataIndex: 'balance',
      key: 'balance',
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: 'Заработано',
      dataIndex: 'earned',
      key: 'earned',
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: 'Номер телефона',
      dataIndex: 'phone',
      key: 'phone',
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: 'Почта',
      dataIndex: 'email',
      key: 'email',
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: 'TG',
      dataIndex: 'telegram_id',
      key: 'telegram_id',
      render: (text) => <Text>{text}</Text>,
    },
  ];

  return (
    <>
      <Table columns={columns} dataSource={appState} rowKey={meditation => meditation.id} />
    </>
  )
}

export default Users