import { Button, Input, List, Space } from "antd";
import React, { useEffect, useState } from "react";
import { api } from "../services/api";

function PaymentDetails() {
  const [data, setData] = useState<any>({});

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const resp = await api.get("/admin/payment-details");
    console.log(resp.data);
    setData(resp.data);
  }

  function addItem(field: "card" | "sbp") {
    const f = field === "card" ? "card" : "tel";
    const tmp = JSON.parse(JSON.stringify(data));
    tmp[field].push({ bank: "", [f]: "" });
    setData(tmp);
  }

  function handleCangeField(
    type: "card" | "sbp",
    index: number,
    field: "bank" | "card" | "tel",
    value: string
  ) {
    const tmp = JSON.parse(JSON.stringify(data));
    tmp[type][index][field] = value;
    setData(tmp);
  }

  async function savePaymentDetails(){
    try{
        await api.post('admin/payment-details', data);
        await fetchData()
    }catch(error){
        console.log(error)
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
                handleCangeField("card", index, "bank", e.target.value)
              }
            />

            <Input
              value={item.card}
              onChange={(e) =>
                handleCangeField("card", index, "card", e.target.value)
              }
            />
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
                handleCangeField("sbp", index, "bank", e.target.value)
              }
            />

            <Input
              value={item.tel}
              onChange={(e) =>
                handleCangeField("sbp", index, "tel", e.target.value)
              }
            />
          </List.Item>
        )}
      />

      <Space
        style={{ width: "100%", justifyContent: "flex-end", marginTop: 50 }}
      >
        <Button onClick={fetchData}>Отменить</Button>
        <Button type="primary" onClick={savePaymentDetails}>Сохранить изменения</Button>
      </Space>
    </div>
  );
}

export default PaymentDetails;
