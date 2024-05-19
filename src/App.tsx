import { App, Result } from "antd";
import { Route, Routes } from "react-router-dom";
import Games from "./pages/Games";
import IncomingTransactions from "./pages/IncomingTransactions";
import Notifications from "./pages/Notifications";
import PaymentDetails from "./pages/PaymentDetails";
import UserProfile from "./pages/UserProfile";
import Users from "./pages/Users";
import WithdrawTransactions from "./pages/WithdrawTransactions";
import { PrivateRoute } from "./routes/PrivateRoute";
import Managers from "./pages/Managers";

export default () => {
  return (
    <App style={{ height: "100%" }} notification={{ placement: "topRight" }}>
      <Routes>
        <Route path="/" element={<PrivateRoute />}>
          <Route path="/games" element={<Games />} />
          <Route
            path="/incoming-transactions"
            element={<IncomingTransactions />}
          />
          <Route
            path="/withdraw-transactions"
            element={<WithdrawTransactions />}
          />
          <Route path="/payment-details" element={<PaymentDetails />} />
          <Route path="/notifications" element={<Notifications />} />

          <Route path="/users" element={<Users />} />
          <Route path="/managers" element={<Managers />} />

          <Route path="/users/:id" element={<UserProfile />} />
          <Route path="*" element={<Result status="404" title="404" />} />
        </Route>
      </Routes>
    </App>
  );
};
