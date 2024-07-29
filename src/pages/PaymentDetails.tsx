import { Button, Input, List, Select, Space } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { api, withCredentials } from "../services/api";
import { DeleteOutlined } from "@ant-design/icons";
import { PaymentDetailType } from "../types/enum/PaymentDetailType";
import Table, { ColumnsType } from "antd/es/table";
import { depositModeOptions } from "../constants/common";
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
      mode: "manual",
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
    field: "data" | "priority" | "bank" | "mode",
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

  const getColumns = (type: "card" | "sbp"): ColumnsType<any> => {
    const dataLabel = type === "card" ? "Номер карты" : "Номер телефона";
    const columns = [
      {
        title: "Название банка",
        dataIndex: "bank",
        key: "bank",
        render: (_text, item) => (
          <Input
            value={item.bank}
            onChange={(e) => handleChangeField(item.id, "bank", e.target.value)}
          />
        ),
      },
      {
        title: dataLabel,
        dataIndex: "data",
        key: "data",
        render: (_text, item) => (
          <Input
            value={item.data}
            onChange={(e) => handleChangeField(item.id, "data", e.target.value)}
          />
        ),
      },
      {
        title: "Метод оплаты",
        dataIndex: "mode",
        key: "mode",
        render: (_text, item) => (
          <Select
            value={item.mode}
            style={{ width: "200px" }}
            options={depositModeOptions}
            onSelect={(val) => handleChangeField(item.id, "mode", val)}
          />
        ),
      },
      {
        title: "Приоритет",
        dataIndex: "priority",
        key: "priority",
        render: (_text, item) => (
          <Input
            placeholder="Приоритет"
            type="number"
            max={10}
            min={0}
            value={item.priority}
            onChange={(e) =>
              handleChangeField(item.id, "priority", +e.target.value)
            }
          />
        ),
      },
      {
        title: "",
        key: "action",
        render: (_, item) => (
          <div>
            <Button
              icon={<DeleteOutlined />}
              danger
              onClick={() => deleteItem(item.id)}
            />
          </div>
        ),
      },
    ];

    if (type === "sbp") {
      columns.splice(2, 1);
    }

    return columns;
  };

  return (
    <div>
      <div>
        <h2>Банковские карты</h2>
        <Table
          style={{ maxWidth: 1000 }}
          columns={getColumns("card")}
          dataSource={visibleData?.filter(
            (dataItem) => dataItem.type === PaymentDetailType.CARD
          )}
          rowKey={(item) => item.id}
          pagination={false}
          footer={() => (
            <Button onClick={() => addItem(PaymentDetailType.CARD)}>
              Добавить карту
            </Button>
          )}
        />
      </div>

      <div style={{ marginTop: 44 }}>
        <h2>СБП</h2>
        <Table
          style={{ maxWidth: 1000 }}
          columns={getColumns("sbp")}
          dataSource={visibleData?.filter(
            (dataItem) => dataItem.type === PaymentDetailType.SBP
          )}
          rowKey={(item) => item.id}
          pagination={false}
          footer={() => (
            <Button onClick={() => addItem(PaymentDetailType.SBP)}>
              Добавить СБП
            </Button>
          )}
        />
      </div>

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
