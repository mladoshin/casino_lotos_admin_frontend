import { Outlet } from 'react-router-dom';
import PrivateLayout from '../layout/PrivateLayout';
export const PrivateRoute = () => {
  return <PrivateLayout><Outlet /></PrivateLayout>
};
