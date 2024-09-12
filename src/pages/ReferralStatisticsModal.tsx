import React, { useEffect, useState } from 'react'; 
import { Modal, Typography } from 'antd';
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
        headers, 
        params: { userId },
      });

      setReferralData(resp.data); 
      console.log('Реферальная статистика:', resp.data); 
    } catch (error) {
      console.error('Ошибка загрузки статистики рефералов:', error);
    }
  }

  const calculateEarnings = (loss: number, level: number) => {
    if (level === 1) return (loss * 0.1).toFixed(2); // 10% для 1 уровня
    if (level === 2) return (loss * 0.05).toFixed(2); // 5% для 2 уровня
    if (level === 3) return (loss * 0.03).toFixed(2); // 3% для 3 уровня
    return '0.00'; 
  };

  return (
    <Modal
      title="Статистика рефералов"
      visible={true}
      onCancel={onClose}
      footer={null}
    >
      {referralData ? (
        <div>
          <Text>Количество рефералов: {referralData.stats.userQuantity}</Text>
          <br />
          <Text>Всего проиграно рефералами: {referralData.stats.lostAmount}</Text>
          <br />
          <Text>Всего заработано с рефералов: {referralData.stats.wonAmount}</Text>
          <br />
          {referralData.users.length > 0 ? (
            <div>
              {referralData.users.map((user: any) => (
                <div key={user.id}>
                  <Text>
                    {`ID: ${user.id}, Имя: ${user.name}, Уровень: ${user.level}, Проигрыш: ${user.lostAmount}, Ваш заработок: ${calculateEarnings(user.lostAmount, user.level)}`}
                  </Text>
                </div>
              ))}
            </div>
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