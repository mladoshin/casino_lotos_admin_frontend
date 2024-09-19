import React, { useEffect, useState } from "react";
import { Modal, Typography, Table } from "antd";
import { api } from "../services/api";

const { Text } = Typography;

interface ReferralStatisticsModalProps {
  userId: string;
  onClose: () => void;
}

const ReferralStatisticsModal: React.FC<ReferralStatisticsModalProps> = ({
  userId,
  onClose,
}) => {
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

      const resp = await api.get(`/user/${userId}/referrals`, {
        headers,
        params: { userId },
      });

      setReferralData(resp.data);
      console.log("Реферальная статистика:", resp.data);
    } catch (error) {
      console.error("Ошибка загрузки статистики рефералов:", error);
    }
  }

  const columns = [
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text: string) => text || "Email не заполнен",
    },
    {
      title: "Уровень реферала",
      dataIndex: "level",
      key: "level",
      render: (level: number) => `Уровень ${level}`,
    },
    {
      title: "RTP",
      key: "earningPercentage",
      render: (_: any, record: any) =>
        record.totalLoss
          ? (record.totalEarned / record.totalLoss) * 100
          : "N/A",
    },
    {
      title: "Сумма проигрышей",
      key: "lostAmount",
      render: (_: any, record: any) => record.totalLoss
    },
    {
      title: "Сумма выигрышей",
      key: "earned",
      render: (_: any, record: any) =>
        record.totalEarned
    },
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
          <Text>
            Количество рефералов: {referralData.stats.userQuantity || 0}
          </Text>
          <br />
          <Text>
            Всего проиграно рефералами: {referralData.stats.lostAmount}
          </Text>
          <br />
          <Text>
            Всего заработано с рефералов: {referralData.stats.wonAmount}
          </Text>
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
