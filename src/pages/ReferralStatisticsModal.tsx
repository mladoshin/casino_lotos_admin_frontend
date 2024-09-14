import React, { useEffect, useState } from 'react'; 
import { Modal, Typography, Table } from 'antd';
import { api } from '../services/api'; 

const { Text } = Typography;

interface ReferralStatisticsModalProps {
  userId: string;
  onClose: () => void;
}

const ReferralStatisticsModal: React.FC<ReferralStatisticsModalProps> = ({ userId, onClose }) => {
  const [referralData, setReferralData] = useState<any>(null);

  useEffect(() => {
    if (userId) {
      fetchReferralStatistics();
    }
  }, [userId]);

  async function fetchReferralStatistics() {
    try {
      const token = localStorage.getItem("accessToken");
      const headers = { Authorization: `Bearer ${token}` };

      const resp = await api.get(`/user/referrals`, {
         params: { userId },
      });

      setReferralData(resp.data); 
      console.log('Реферальная статистика:', resp.data); 
    } catch (error) {
      console.error('Ошибка загрузки статистики рефералов:', error);
    }
  }

  const calculateEarnings = (totalLoss: number, level: number) => {
    if (!totalLoss) return '0.00'; // Если totalLoss undefined или 0
    if (level === 1) return (totalLoss * 0.1).toFixed(2); // 10% для 1 уровня
    if (level === 2) return (totalLoss * 0.05).toFixed(2); // 5% для 2 уровня
    if (level === 3) return (totalLoss * 0.03).toFixed(2); // 3% для 3 уровня
    return '0.00'; 
  };

  const getEarningPercentage = (level: number) => {
    if (level === 1) return "10%"; // 10% для 1 уровня
    if (level === 2) return "5%";  // 5% для 2 уровня
    if (level === 3) return "3%";  // 3% для 3 уровня
    return "0%";  // Если уровень неизвестен
  };

  // Функции для подсчета итогов
  const totalReferralLoss = () => {
    return referralData?.users.reduce((sum: number, user: any) => sum + (user.totalLoss || 0), 0).toFixed(2);
  };

  const totalReferralEarnings = () => {
    return referralData?.users.reduce((sum: number, user: any) => sum + parseFloat(calculateEarnings(user.totalLoss, user.level)), 0).toFixed(2);
  };

  const columns = [
    {
      title: 'Email',  
      dataIndex: 'email',  
      key: 'email',
      render: (text: string) => text || 'Email не заполнен',
    },
    {
      title: 'Уровень реферала',  
      dataIndex: 'level',
      key: 'level',
      render: (level: number) => `Уровень ${level}`,
    },
    {
      title: 'Процент заработка',  
      key: 'earningPercentage',
      render: (_: any, record: any) => getEarningPercentage(record.level),
    },
    {
      title: 'Проигрыш',
      dataIndex: 'totalLoss',  
      key: 'totalLoss',
      render: (totalLoss: number) => totalLoss ? totalLoss.toFixed(2) : '0.00',
    },
    {
      title: 'Ваш заработок',
      key: 'earned',
      render: (_: any, record: any) => calculateEarnings(record.totalLoss, record.level),
    }
  ];

  return (
    <Modal
      title="Статистика рефералов"
      visible={true}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      {referralData ? (
        <div>
          <Text>Количество рефералов: {referralData.stats.userQuantity || 0}</Text>
          <br />
          <Text>Всего проиграно рефералами: {totalReferralLoss() || '0.00'}</Text>
          <br />
          <Text>Всего заработано с рефералов: {totalReferralEarnings() || '0.00'}</Text>
          <br />
          {referralData.users.length > 0 ? (
            <Table 
              dataSource={referralData.users.map((user: any) => ({
                ...user,
                key: user.id,
              }))}
              columns={columns}
              pagination={false}
            />
          ) : (
            <Text>Рефералов нет</Text>
          )}
        </div>
      ) : (
        <Text>Загрузка данных...</Text>
      )}
    </Modal>
  );
};

export default ReferralStatisticsModal;