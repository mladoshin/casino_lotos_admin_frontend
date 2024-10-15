import { User } from "@customTypes/entity/User";
import { getUserLabel } from "@utils/user";
import { AutoComplete } from "antd";
import React, { useMemo } from "react";

interface UserSelectProps {
  users: User[];
  loading?: boolean;
  placeholder?: string
  onChange?: (val: string) => void;
}

function UserSelect({ users, loading, placeholder, onChange }: UserSelectProps) {
  const userOptions = useMemo(() => {
    return users.map((user) => ({
      value: getUserLabel(user),
      id: user.id,
      searchStr: [
        user.name,
        user.surname,
        user.username,
        user.email,
        user.telegram_username,
        user.telegram_id,
        user.phone,
      ].join(" "),
    }));
  }, [users]);

  return (
    <AutoComplete
      allowClear
      disabled={loading}
      style={{ width: "100%" }}
      options={userOptions}
      placeholder={placeholder ?? "Выберите пользователя"}
      filterOption={(inputValue, option) =>
        option!.searchStr.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
      }
      onSelect={(_value, option) => {
        //setSelectedUserId(option.id);
        onChange?.(option.id);
      }}
      onClear={() => onChange(null)}
    />
  );
}

export default UserSelect;
