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
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 250);
  const [games, setGames] = useState([]);
  const [filteredGamesByName, setFilteredGamesByName] = useState(games);
  const [selectedGameIds, setSelectedGameIds] = useState<
    Record<string, boolean>
  >({});
  const [isFetchGamesLoading, setIsFetchGamesLoading] = useState(false);
  const [isAddGamesLoading, setIsAddGamesLoading] = useState(false);

  const selectedGamesCount = Object.values(selectedGameIds).filter(
    (el) => el
  ).length;

  const [gameProviders, setGameProviders] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!open) {
      setSelectedGameIds({});
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
    const games = Object.keys(selectedGameIds)
      .filter((key) => selectedGameIds[key])
      .map((gameId, idx) => ({ game_id: gameId, order: idx }));

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

  function handleToggleCheck(checked: boolean, gameId: string) {
    setSelectedGameIds((current) => ({ ...current, [gameId]: checked }));
  }

  const columns: ColumnsType<any> = [
    {
      title: "Выбрать",
      key: "action",
      render: (_, item) => (
        <Checkbox
          checked={selectedGameIds[item.id]}
          onChange={(e) => handleToggleCheck(e.target.checked, item.id)}
        />
      ),
    },
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
        loading={isFetchGamesLoading}
        columns={columns}
        dataSource={filteredGamesByName}
        scroll={{ y: "60vh" }}
        rowKey={(game) => game.id}
      />
    </Modal>
  );
}

export default AddGamesToCategoryModal;
