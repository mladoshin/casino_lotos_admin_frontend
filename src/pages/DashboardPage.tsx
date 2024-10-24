import React, { useEffect, useState } from "react";
import { api, withCredentials } from "../services/api";
import moment from "moment";
import { Button, Card, Col, DatePicker, Row, Space } from "antd";
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
  usersWithDeposits: {
    oldCount: number;
    newCount: number;
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
          <Row gutter={[16, 16]} style={{ maxWidth: "100vw" }}>
            <Col span={12} xs={{ span: 24 }}>
              <Card
                style={{ width: "100%" }}
                title={`Посетители: ${
                  userMetrics.visitorsData.unauthorizedVisitorsCount +
                  userMetrics.visitorsData.authorizedVisitorsCount
                }`}
              >
                <div>
                  <b>Незарегистрированных: </b>
                  <span>
                    {userMetrics.visitorsData.unauthorizedVisitorsCount}
                  </span>
                </div>
                <div>
                  <b>Зарегистрированных: </b>
                  <span>
                    {userMetrics.visitorsData.authorizedVisitorsCount}
                  </span>
                </div>
              </Card>
            </Col>
            <Col span={12} xs={{ span: 24 }}>
              <Card
                style={{ width: "100%" }}
                title={`Игроки: ${
                  userMetrics.playersData.newPlayersCount +
                  userMetrics.playersData.oldPlayersCount
                }`}
              >
                <div>
                  <b>Новых: </b>
                  <span>{userMetrics.playersData.newPlayersCount}</span>
                </div>

                <div>
                  <b>Не новых: </b>
                  <span>{userMetrics.playersData.oldPlayersCount}</span>
                </div>
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 16, maxWidth: "100vw" }}>
            <Col span={12} xs={{ span: 24 }}>
              <Card
                style={{ width: "100%" }}
                title={`Пользователи с депозитами: ${
                  userMetrics.usersWithDeposits.oldCount +
                  userMetrics.usersWithDeposits.newCount
                }`}
              >
                <div>
                  <b>Новых: </b>
                  <span>{userMetrics.usersWithDeposits.newCount}</span>
                </div>

                <div>
                  <b>Не новых: </b>
                  <span>{userMetrics.usersWithDeposits.oldCount}</span>
                </div>
              </Card>
            </Col>
            <Col span={12} xs={{ span: 24 }}>
              <Card title={`Пополнения и снятия`} style={{ width: "100%" }}>
                <div>
                  <b>Пополнения: </b>
                  <span>
                    {CurrencyFormatter.format(
                      userMetrics.incomeExpenseData.income
                    )}
                  </span>
                </div>

                <div>
                  <b>Снятия: </b>
                  <span>
                    {CurrencyFormatter.format(
                      userMetrics.incomeExpenseData.expense
                    )}
                  </span>
                </div>

                <div>
                  <b>Доход: </b>
                  <span>
                    {CurrencyFormatter.format(
                      userMetrics.incomeExpenseData.profit
                    )}
                  </span>
                </div>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
}

export default DashboardPage;
