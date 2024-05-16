import { Button, Tag, Typography, Table, Avatar, App } from 'antd'
import { useEffect, useState } from 'react';
const { Text } = Typography;
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios'


const Games = () => {
  const [appState, setAppState] = useState();
  const [loading, setLoading] = useState(false);
  const { notification } = App.useApp();
  const openNotification = () => {
    notification.info({
      message: `Игра недоступна`,
      placement: 'topRight',
    });
  };

  useEffect(() => {
    const apiUrl = 'http://95.213.173.58:3000/games';
    axios.get(apiUrl).then((resp) => {
      const allPersons = resp.data?.content?.gameList;
      setAppState(allPersons);
    });
  }, []);


  const openGame = (id: number) => {
    setLoading(true);
  }

  const columns: ColumnsType<any> = [
    {
      title: 'Название',
      dataIndex: 'img',
      key: 'img',
      render: (src) => <Avatar src={src} shape="square" size={64} />,
    },
    {
      title: 'Название',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: 'Категории',
      key: 'categories',
      dataIndex: 'categories',
      render: (_, { categories }) => (
        <Tag color={'green'}>
          {categories}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, item) => (
        <Button onClick={() => openGame(item.id)} loading={loading}>Запросить ссылку на игру</Button>
      ),
    },
  ];

  return (
    <Table columns={columns} dataSource={appState} rowKey={meditation => meditation.id} />
  )
}

export default Games