import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api, withCredentials } from "../services/api";
import { List } from "antd";

function UserProfile() {
  const [userProfile, setUserProfile] = useState();
  const { id } = useParams();

  useEffect(() => {
    fetchData(id);
  }, [id]);

  async function fetchData(id: string) {
    try {
      const resp = await withCredentials((headers) =>
        api.get(`admin/user-profile/${id}`, headers)
      );
      setUserProfile(resp.data);
    } catch (error) {
      console.log(error);
    }
  }

  const userProfileFields = Object.keys(userProfile || {});

  return (
    <div>
      <List
        style={{ marginTop: 50 }}
        size="large"
        header={<h3>Профиль пользователя</h3>}
        bordered
        dataSource={userProfileFields}
        renderItem={(field: string, index) => (
          <List.Item>
            <b>{field}</b>

            <span>{(userProfile || {})[field] || "—"}</span>
          </List.Item>
        )}
      />
    </div>
  );
}

export default UserProfile;
