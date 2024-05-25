import { Button, Input, List, Space } from "antd";
import React, { useEffect, useState } from "react";
import { api, withCredentials } from "../services/api";
import { DeleteOutlined } from "@ant-design/icons";
function PaymentDetails() {
  const [data, setData] = useState<any>({});

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const resp = await withCredentials((headers) =>
      api.get("/admin/payment-details", headers)
    );
    setData(resp.data);
  }

  function addItem(field: "card" | "sbp") {
    const f = field === "card" ? "card" : "tel";
    const tmp = JSON.parse(JSON.stringify(data));
    tmp[field].push({ bank: "", [f]: "" });
    setData(tmp);
  }

  function deleteItem(field: "card" | "sbp", index: number) {
    const f = field === "card" ? "card" : "tel";
    const tmp = JSON.parse(JSON.stringify(data));
    tmp[field].splice(index, 1);
    setData(tmp);
  }

  function handleChangeField(
    type: "card" | "sbp",
    index: number,
    field: "bank" | "card" | "tel",
    value: string
  ) {
    const tmp = JSON.parse(JSON.stringify(data));
    tmp[type][index][field] = value;
    setData(tmp);
  }

  async function savePaymentDetails() {
    try {
      await withCredentials((headers) =>
        api.post("admin/payment-details", data, headers)
      );
      await fetchData();
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div>
      <List
        size="large"
        header={<h3>Карты</h3>}
        bordered
        dataSource={data.card}
        footer={<Button onClick={() => addItem("card")}>Добавить карту</Button>}
        renderItem={(item: any, index) => (
          <List.Item>
            <Input
              value={item.bank}
              onChange={(e) =>
                handleChangeField("card", index, "bank", e.target.value)
              }
            />

            <Input
              style={{ marginLeft: 20 }}
              value={item.card}
              onChange={(e) =>
                handleChangeField("card", index, "card", e.target.value)
              }
            />
            <div style={{ marginLeft: 20 }}>
              <Button
                icon={<DeleteOutlined />}
                danger
                onClick={() => deleteItem("card", index)}
              />
            </div>
          </List.Item>
        )}
      />

      <List
        style={{ marginTop: 50 }}
        size="large"
        header={<h3>СБП</h3>}
        footer={<Button onClick={() => addItem("sbp")}>Добавить СБП</Button>}
        bordered
        dataSource={data.sbp}
        renderItem={(item: any, index) => (
          <List.Item>
            <Input
              value={item.bank}
              onChange={(e) =>
                handleChangeField("sbp", index, "bank", e.target.value)
              }
            />

            <Input
              style={{ marginLeft: 20 }}
              value={item.tel}
              onChange={(e) =>
                handleChangeField("sbp", index, "tel", e.target.value)
              }
            />
            <div style={{ marginLeft: 20 }}>
              <Button
                icon={<DeleteOutlined />}
                danger
                onClick={() => deleteItem("sbp", index)}
              />
            </div>
          </List.Item>
        )}
      />

      <Space
        style={{ width: "100%", justifyContent: "flex-end", marginTop: 50 }}
      >
        <Button onClick={fetchData}>Отменить</Button>
        <Button type="primary" onClick={savePaymentDetails}>
          Сохранить изменения
        </Button>
      </Space>
    </div>
  );
}

export default PaymentDetails;
