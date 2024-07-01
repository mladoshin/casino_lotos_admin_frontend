import { Button, Input, List, Space } from "antd";
import React, { useEffect, useState } from "react";
import { api, withCredentials } from "../services/api";
import { DeleteOutlined } from "@ant-design/icons";
import { PaymentDetailType } from "../@types/enum/PaymentDetailType";
function PaymentDetails() {
  const [data, setData] = useState<any[]>([]);
  const visibleData = data.filter((el) => !el.id.includes("del-"));

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const resp = await withCredentials((headers) =>
      api.get("/admin/payment-details", headers)
    );
    setData(resp.data);
  }

  function addItem(type: PaymentDetailType) {
    const tmp = JSON.parse(JSON.stringify(data));
    tmp.push({
      bank: "",
      data: "",
      priority: 1,
      type,
      id: `new-${Date.now()}`,
    });
    setData(tmp);
  }

  function deleteItem(id: string) {
    const index = data.findIndex((el) => el.id === id);
    if (index !== -1) {
      const tmp = [...data];
      if (tmp[index].id.includes("new-")) {
        tmp.splice(index, 1);
      } else {
        tmp[index].id = `del-${id}`;
      }
      setData(tmp);
    }
  }

  function handleChangeField(
    id: string,
    field: "data" | "priority" | "bank",
    value: string | number
  ) {
    const index = data.findIndex((el) => el.id === id);
    if (index !== -1) {
      const tmp = [...data];
      tmp[index][field] = value;
      setData(tmp);
    }
  }

  async function savePaymentDetails() {
    // console.log(data);
    // return;
    try {
      await withCredentials((headers) =>
        api.post("admin/payment-details", { data }, headers)
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
        dataSource={visibleData?.filter(
          (dataItem) => dataItem.type === PaymentDetailType.CARD
        )}
        footer={
          <Button onClick={() => addItem(PaymentDetailType.CARD)}>
            Добавить карту
          </Button>
        }
        renderItem={(item: any, index) => (
          <List.Item>
            <Input
              value={item.bank}
              onChange={(e) =>
                handleChangeField(item.id, "bank", e.target.value)
              }
            />

            <Input
              style={{ marginLeft: 20 }}
              value={item.data}
              onChange={(e) =>
                handleChangeField(item.id, "data", e.target.value)
              }
            />

            <Input
              placeholder="Приоритет"
              type="number"
              max={10}
              min={0}
              style={{ marginLeft: 20 }}
              value={item.priority}
              onChange={(e) =>
                handleChangeField(item.id, "priority", +e.target.value)
              }
            />

            <div style={{ marginLeft: 20 }}>
              <Button
                icon={<DeleteOutlined />}
                danger
                onClick={() => deleteItem(item.id)}
              />
            </div>
          </List.Item>
        )}
      />

      <List
        style={{ marginTop: 50 }}
        size="large"
        header={<h3>СБП</h3>}
        footer={
          <Button onClick={() => addItem(PaymentDetailType.SBP)}>
            Добавить СБП
          </Button>
        }
        bordered
        dataSource={visibleData?.filter(
          (dataItem) => dataItem.type === PaymentDetailType.SBP
        )}
        renderItem={(item: any, index) => (
          <List.Item>
            <Input
              value={item.bank}
              onChange={(e) =>
                handleChangeField(item.id, "bank", e.target.value)
              }
            />

            <Input
              style={{ marginLeft: 20 }}
              value={item.data}
              onChange={(e) =>
                handleChangeField(item.id, "data", e.target.value)
              }
            />

            <Input
              placeholder="Приоритет"
              type="number"
              max={10}
              min={0}
              style={{ marginLeft: 20 }}
              value={item.priority}
              onChange={(e) =>
                handleChangeField(item.id, "priority", +e.target.value)
              }
            />

            <div style={{ marginLeft: 20 }}>
              <Button
                icon={<DeleteOutlined />}
                danger
                onClick={() => deleteItem(item.id)}
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
