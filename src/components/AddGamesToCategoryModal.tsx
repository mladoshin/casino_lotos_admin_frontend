import {
  Avatar,
  Button,
  Checkbox,
  Input,
  Modal,
  Table,
  Tag,
  Typography,
} from "antd";
import { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import useDebounce from "../hooks/useDebounce";
import { api, withCredentials } from "../services/api";
import { TableRowSelection } from "antd/es/table/interface";
// import Table, { ColumnsType } from "antd/es/table";
const { Search } = Input;
const { Text } = Typography;

interface AddGamesToCategoryModalProps {
  open: boolean;
  category: string;
  onClose: () => void;
  refetchData: () => Promise<void>;
}

function AddGamesToCategoryModal({
  open,
  category,
  onClose,
  refetchData,
}: AddGamesToCategoryModalProps) {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 250);
  const [games, setGames] = useState([]);
  const [filteredGamesByName, setFilteredGamesByName] = useState(games);
  const [isFetchGamesLoading, setIsFetchGamesLoading] = useState(false);
  const [isAddGamesLoading, setIsAddGamesLoading] = useState(false);

  const selectedGamesCount = selectedRowKeys.length;

  const [gameProviders, setGameProviders] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!open) {
      setSelectedRowKeys([]);
      setSearch("");
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      handleSearch(debouncedSearch);
    }
  }, [open, debouncedSearch]);

  async function fetchData() {
    try {
      setIsFetchGamesLoading(true);
      const respGames = await withCredentials((headers) =>
        api.get("games", headers)
      );
      setGames(respGames.data);

      const respProviders = await withCredentials((headers) =>
        api.get("games/providers", headers)
      );
      setGameProviders(respProviders.data);
    } catch (error) {
      console.log(error);
    }
    setIsFetchGamesLoading(false);
  }

  function handleSearch(search: string) {
    console.log("search: ", search);
    const filteredGames = games.filter((game) =>
      game.name.toLowerCase().includes(search.toLowerCase())
    );

    setFilteredGamesByName(filteredGames);
  }

  async function handleAddGames() {
    const games = selectedRowKeys.map((gameId, idx) => ({
      game_id: gameId,
      order: idx,
    }));

    try {
      setIsAddGamesLoading(true);
      await withCredentials((headers) =>
        api.post("admin/games", { category, games }, headers)
      );
      refetchData();
      onClose();
    } catch (error) {
      console.log(error);
    }

    setIsAddGamesLoading(false);
  }

  const columns: ColumnsType<any> = [
    {
      title: "",
      dataIndex: "img",
      key: "img",
      render: (src) => <Avatar src={src} shape="square" size={64} />,
    },
    {
      title: "Название",
      dataIndex: "name",
      key: "name",
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: "Провайдер",
      dataIndex: "label",
      key: "label",
      render: (text) => <Text>{text}</Text>,
      onFilter: (value, record) => record.label === value,
      filters: gameProviders.map((gameProvider) => ({
        text: gameProvider,
        value: gameProvider,
      })),
    },
    {
      title: "Категории",
      key: "categories",
      dataIndex: "categories",
      render: (_, { categories }) => <Tag color={"green"}>{categories}</Tag>,
    },
  ];

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    console.log("selectedRowKeys changed: ", newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection: TableRowSelection<any> = {
    selectedRowKeys,
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
    ],
    onChange: onSelectChange,
  };

  return (
    <Modal
      destroyOnClose
      open={open}
      title={`Добавить игру в категорию ${category}`}
      onCancel={onClose}
      footer={[
        <Button key="back" onClick={onClose}>
          Отменить
        </Button>,
        <Button
          type="primary"
          onClick={handleAddGames}
          loading={isAddGamesLoading}
        >
          Добавить
        </Button>,
      ]}
      width={800}
    >
      <div
        style={{
          marginBottom: 12,
          display: "flex",
          alignItems: "center",
          gap: 24,
        }}
      >
        <Search
          placeholder="Поиск игры по имени"
          onSearch={handleSearch}
          style={{ width: 200 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span>Выбрано {selectedGamesCount} элементов</span>
      </div>
      <Table
      className="min650mobile"
        loading={isFetchGamesLoading}
        columns={columns}
        dataSource={filteredGamesByName}
        scroll={{ y: "60vh" }}
        rowKey={(game) => game.id}
        rowSelection={rowSelection}
      />
    </Modal>
  );
}

export default AddGamesToCategoryModal;
