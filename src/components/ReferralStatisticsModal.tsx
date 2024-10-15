import React, { useEffect, useState } from "react";
import { Modal, Typography, Table, Select, Space } from "antd";
import { api, withCredentials } from "../services/api";
import { getUserLabel } from "@utils/user";
import InlineText from "./InlineText";
import { User } from "@customTypes/entity/User";
import { CurrencyFormatter } from "@utils/common";

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
  const [filter, setFilter] = useState("week");

  useEffect(() => {
    if (userId) {
      fetchReferralStatistics();
      fetchAllReferrals();
    }
  }, [userId]);

  function getUserRtp(user: any) {
    if (!user.totalLoss) return "N/A";
    const percentage = (user.totalEarned / user.totalLoss) * 100;
    return `${percentage.toFixed(0)}%`;
  }

  async function fetchReferralStatistics() {
    try {
      const resp = await withCredentials((headers) =>
        api.get(`/user/${userId}/referrals`, {
          ...headers,
          params: { userId, referralStatsType: filter },
        })
      );

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
      title: "Пользователь",
      key: "email",
      render: (_: any, item: any) => (
        <InlineText>{getUserLabel(item)}</InlineText>
      ),
    },
    {
      title: "Кэшбэк",
      dataIndex: "cashback",
      key: "cashback",
      align: "right",
      render: (_: any, item: any) => (
        <InlineText>{CurrencyFormatter.format(+item.cashback)}</InlineText>
      ),
    },
    {
      title: "Уровень реферала",
      dataIndex: "level",
      key: "level",
      render: (level: number) => <InlineText>{`Уровень ${level}`}</InlineText>,
    },
    {
      title: "RTP",
      key: "earningPercentage",
      render: (_: any, record: any) => getUserRtp(record),
    },
    {
      title: "Сумма проигрышей",
      key: "lostAmount",
      align: "right",
      render: (_: any, record: any) => (
        <InlineText>{CurrencyFormatter.format(record.totalLoss)}</InlineText>
      ),
    },
    {
      title: "Сумма выигрышей",
      key: "earned",
      align: "right",
      render: (_: any, record: any) => (
        <InlineText>{CurrencyFormatter.format(record.totalEarned)}</InlineText>
      ),
    },
  ];

  const allReferralsTableColumns = [
    {
      title: "Пользователь",
      key: "user",
      render: (_: any, item: any) => (
        <InlineText>{getUserLabel(item.referral || {})}</InlineText>
      ),
    },
    {
      title: "Уровень реферала",
      dataIndex: "level",
      key: "level",
      render: (level: number) => <InlineText>{`Уровень ${level}`}</InlineText>,
    },
    {
      title: "RTP",
      key: "earningPercentage",
      render: (_: any, item: any) => getUserRtp(item),
    },
    {
      title: "Сумма проигрышей",
      key: "lostAmount",
      align: "right",
      render: (_: any, item: any) => (
        <InlineText>
          {CurrencyFormatter.format(item.referral.totalLoss)}
        </InlineText>
      ),
    },
    {
      title: "Сумма выигрышей",
      key: "earned",
      align: "right",
      render: (_: any, item: any) => (
        <InlineText>
          {CurrencyFormatter.format(item.referral.totalEarned)}
        </InlineText>
      ),
    },
  ];

  return (
    <Modal
      title="Рефералы"
      onCancel={onClose}
      footer={null}
      width={800}
      open={open}
    >
      <Space
        direction="horizontal"
        style={{ justifyContent: "space-between", width: "100%" }}
      >
        <h2>Рефералы с кэшбэком</h2>

        <Select
          defaultValue={filter}
          style={{ width: 150 }}
          disabled
          //onChange={(val) => setFilter(val)}
          options={[
            { value: "all", label: "За всё время" },
            { value: "week", label: "За неделю" },
          ]}
        />
      </Space>
      {referralData ? (
        <div>
          <p>
            <span>Количество рефералов:</span>{" "}
            <b>{referralData.stats.userQuantity || 0}</b>
          </p>
          <p>
            <span>Всего проиграно рефералами:</span>{" "}
            <b>{CurrencyFormatter.format(referralData.stats.lostAmount)}</b>
          </p>
          <p>
            <span>Всего заработано с рефералов:</span>{" "}
            <b>{CurrencyFormatter.format(referralData.stats.wonAmount)}</b>
          </p>

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
      <Table
        columns={allReferralsTableColumns}
        dataSource={allReferrals}
        scroll={{ x: "max-content" }}
      />
    </Modal>
  );
};

export default ReferralStatisticsModal;
