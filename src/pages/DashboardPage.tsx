import React, { useEffect, useState } from "react";
import { api, withCredentials } from "../services/api";
import moment from "moment";
import { Button, DatePicker, Space } from "antd";
import { CurrencyFormatter } from "@utils/common";
import { NotificationOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

type UserMetricsData = {
  visitorsData: {
    unauthorizedVisitorsCount: number;
    authorizedVisitorsCount: number;
  };
  playersData: {
    newPlayersCount: number;
    oldPlayersCount: number;
  };
  incomeExpenseData: {
    expense: number;
    income: number;
    profit: number;
  };
};

function DashboardPage() {
  const [userMetrics, setUserMetrics] = useState<UserMetricsData | null>(null);
  const [date, setDate] = useState(moment());
  const navigate = useNavigate();

  useEffect(() => {
    handleFetchUserMetrics();
  }, []);

  async function handleFetchUserMetrics(date?: Date) {
    const momentDate = moment(date);
    const formattedDate = momentDate.format("YYYY-MM-DD");
    setDate(momentDate);
    try {
      const response = await withCredentials((headers) =>
        api.get(`/admin/user-metrics?date=${formattedDate}`, headers)
      );
      setUserMetrics(response.data);
    } catch (err) {}
  }

  return (
    <div>
      <Space
        direction="horizontal"
        style={{ display: "flex", alignItems: "center" }}
      >
        <h1>Дашборд</h1>
        <Button
          style={{ marginLeft: 16 }}
          size="small"
          icon={<NotificationOutlined />}
          onClick={() => navigate("/dashboard-bot-users")}
        >
          Настройка уведомлений
        </Button>
      </Space>
      <DatePicker onChange={(d) => handleFetchUserMetrics(d?.toDate())} />
      <h2>Статистика от {date.format("DD.MM.YYYY")}</h2>
      {userMetrics && (
        <>
          <h3>
            Посетителей:{" "}
            {userMetrics.visitorsData.unauthorizedVisitorsCount +
              userMetrics.visitorsData.authorizedVisitorsCount}
          </h3>
          <div>
            <b>Незарегистрированных: </b>
            <span>{userMetrics.visitorsData.unauthorizedVisitorsCount}</span>
          </div>
          <div>
            <b>Зарегистрированных: </b>
            <span>{userMetrics.visitorsData.authorizedVisitorsCount}</span>
          </div>

          <h3>
            Игроков:{" "}
            {userMetrics.playersData.newPlayersCount +
              userMetrics.playersData.oldPlayersCount}
          </h3>
          <div>
            <b>Новых: </b>
            <span>{userMetrics.playersData.newPlayersCount}</span>
          </div>

          <div>
            <b>Не новых: </b>
            <span>{userMetrics.playersData.oldPlayersCount}</span>
          </div>

          <h3 style={{ marginTop: 24 }}>Пополнения и снятия</h3>
          <div>
            <b>Пополнения: </b>
            <span>
              {CurrencyFormatter.format(userMetrics.incomeExpenseData.income)}
            </span>
          </div>

          <div>
            <b>Снятия: </b>
            <span>
              {CurrencyFormatter.format(userMetrics.incomeExpenseData.expense)}
            </span>
          </div>

          <div>
            <b>Доход: </b>
            <span>
              {CurrencyFormatter.format(userMetrics.incomeExpenseData.profit)}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

export default DashboardPage;
