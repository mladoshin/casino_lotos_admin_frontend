import React, { useEffect, useState } from "react";
import { Modal, Typography, Table } from "antd";
import { api, withCredentials } from "../services/api";
import { getUserLabel } from "@utils/user";

const { Text } = Typography;

interface ReferralStatisticsModalProps {
  open: boolean;
  userId: string;
  onClose: () => void;
}

const ReferralStatisticsModal: React.FC<ReferralStatisticsModalProps> = ({
  open,
  userId,
  onClose,
}) => {
  const [referralData, setReferralData] = useState<any>(null);
  const [allReferrals, setAllReferrals] = useState<any[]>([]);

  useEffect(() => {
    if (userId) {
      fetchReferralStatistics();
      fetchAllReferrals();
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

  async function fetchAllReferrals() {
    try {
      const resp = await withCredentials((headers) =>
        api.get(`/user/${userId}/referrals?type=all`, headers)
      );

      setAllReferrals(resp.data);
    } catch (error) {
      console.error("Ошибка загрузки рефералов:", error);
    }
  }

  const cashbackReferralsTableColumns = [
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
      render: (_: any, record: any) => record.totalLoss,
    },
    {
      title: "Сумма выигрышей",
      key: "earned",
      render: (_: any, record: any) => record.totalEarned,
    },
  ];

  const allReferralsTableColumns = [
    {
      title: "Пользователь",
      key: "user",
      render: (_: any, item: any) => <Text>{getUserLabel(item.referral)}</Text>,
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
      render: (_: any, item: any) =>
        item.referral.totalLoss
          ? `${((item.referral.totalEarned / item.referral.totalLoss) * 100).toFixed(0)}%`
          : "N/A",
    },
    {
      title: "Сумма проигрышей",
      key: "lostAmount",
      render: (_: any, item: any) => item.referral.totalLoss,
    },
    {
      title: "Сумма выигрышей",
      key: "earned",
      render: (_: any, item: any) => item.referral.totalEarned,
    },
  ];

  return (
    <Modal title="Рефералы" onCancel={onClose} footer={null} width={800} open={open}>
      <h2>Рефералы с кэшбэком</h2>
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
              columns={cashbackReferralsTableColumns}
              pagination={false}
            />
          ) : (
            <Text>Рефералов нет</Text>
          )}
        </div>
      ) : (
        <Text>Загрузка данных...</Text>
      )}

      <h2>Все рефералы</h2>
      <Table columns={allReferralsTableColumns} dataSource={allReferrals} />
    </Modal>
  );
};

export default ReferralStatisticsModal;
