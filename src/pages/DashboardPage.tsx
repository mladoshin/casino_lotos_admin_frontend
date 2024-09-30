import React, { useEffect, useState } from "react";
import { api, withCredentials } from "../services/api";
import moment from "moment";
import { DatePicker } from "antd";

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
      <h1>Дашборд</h1>
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

          <h3>
            Пополнения и снятия:
          </h3>
          <div>
            <b>Пополнения: </b>
            <span>{userMetrics.incomeExpenseData.income} ₽</span>
          </div>

          <div>
            <b>Снятия: </b>
            <span>{userMetrics.incomeExpenseData.expense} ₽</span>
          </div>

          <div>
            <b>Доход: </b>
            <span>{userMetrics.incomeExpenseData.profit} ₽</span>
          </div>
        </>
      )}
    </div>
  );
}

export default DashboardPage;
