import { User } from "@customTypes/entity/User";
import { AppContext } from "../context/AppContext";
import { useContext, useEffect, useState } from "react";
import { UserRole } from "../routes/types";
import { api, withCredentials } from "../services/api";

interface UseGetUsersProps {
  fetchOnMount?: boolean;
}

function useGetUsers(props?: UseGetUsersProps) {
  const { user } = useContext(AppContext);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!props?.fetchOnMount) return;
    handleFetchData();
  }, []);

  async function handleFetchData(params?: any) {
    try {
      let url = "";
      if (user?.role === UserRole.ADMIN || user?.role === UserRole.CASHIER) {
        url = "user";
      } else if (user?.role === UserRole.MANAGER) {
        url = "manager/referrals";
      }

      try {
        setLoading(true);
        const resp = await withCredentials((headers) =>
          api.get(url, { ...headers, params })
        );
        setUsers(resp.data);
      } catch (error) {
        console.log(error);
      }
      setLoading(false);
    } catch (error) {}
  }

  return { users, loading, refetch: handleFetchData };
}

export default useGetUsers;
