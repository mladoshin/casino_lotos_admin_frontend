import { DeleteOutlined, DragOutlined } from "@ant-design/icons";
import {
  Avatar,
  Button,
  Input,
  Modal,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { GameCategories, GameCategory } from "../constants/common";
import { api, withCredentials } from "../services/api";
import dragula from "dragula";
import AddGamesToCategoryModal from "../components/AddGamesToCategoryModal";
const { Text } = Typography;

const getIndexInParent = (el) => Array.from(el.parentNode.children).indexOf(el);

function GamePlacement() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<GameCategory>(GameCategory.TOP);
  const [isAddGameModalOpen, setIsAddGameModalOpen] = useState(false);
  const [gameId, setGameId] = useState("");
  const [order, setOrder] = useState(0);

  useEffect(() => {
    if (category === GameCategory.ALL) return;
    let start;
    let end;
    const container = document.querySelector(".ant-table-tbody");
    const drake = dragula([container], {
      moves: (el) => {
        start = getIndexInParent(el);
        return true;
      },
      ignoreInputTextSelection: false,
    });

    drake.on("drop", (el) => {
      end = getIndexInParent(el);
      handleReorder(start, end);
    });

    return () => drake.destroy();
  }, [category]);

  useEffect(() => {
    fetchData(category);
  }, [category]);

  const handleReorder = (dragIndex, draggedIndex) => {
    setGames((games) => {
      const tmpGames = [...games];
      const item = tmpGames.splice(dragIndex, 1)[0];
      tmpGames.splice(draggedIndex, 0, item);

      console.log("Reorder", tmpGames);
      try {
        withCredentials((headers) =>
          api.patch(
            "/admin/save-games-placement",
            {
              category,
              games: tmpGames.map((g, id) => ({
                game_placement_id: g.placement_id,
                order: id,
              })),
            },
            headers
          )
        );
      } catch (error) {
        console.log(error);
      }
      return tmpGames;
    });
  };

  async function handleModalClose() {
    setIsAddGameModalOpen(false);
    setGameId("");
    setOrder(0);
  }

  async function fetchData(category: GameCategory) {
    try {
      setLoading(true);
      const resp = await withCredentials((headers) =>
        api.get(`games/${category}`, headers)
      );
      setGames(resp.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteGame(gamePlacementId: string) {
    try {
      await withCredentials((headers) =>
        api.delete(
          `admin/delete-game-from-category/${gamePlacementId}`,
          headers
        )
      );
      await fetchData(category);
    } catch (error) {
      console.log(error);
    }
  }

  const columns: ColumnsType<any> = [
    {
      title: "",
      key: "handle",
      render: () => {
        if (category !== GameCategory.ALL) {
          return <DragOutlined style={{ cursor: "grab" }} />;
        }
        return null;
      },
    },
    {
      title: "Идентификатор",
      dataIndex: "id",
      key: "id",
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: "Название",
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
      title: "Категории",
      key: "categories",
      dataIndex: "categories",
      render: (_, { categories }) => <Tag color={"green"}>{categories}</Tag>,
    },
    {
      title: "Действия",
      key: "action",
      render: (_, item) => {
        if (category === GameCategory.ALL) return null;
        return (
          <Space
            style={{
              width: "100%",
              marginLeft: 20,
              justifyContent: "flex-end",
              padding: "0px 30px",
            }}
          >
            <Button
              icon={<DeleteOutlined />}
              danger
              onClick={() => handleDeleteGame(item.placement_id)}
            />
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 30 }}>
        {GameCategories.map((cat) => (
          <Button
            key={cat.value}
            type={cat.value === category ? "primary" : "default"}
            onClick={() => setCategory(cat.value)}
          >
            {cat.label}
          </Button>
        ))}
      </Space>

      <Table
        columns={columns}
        dataSource={games}
        rowKey={(game) => game.id}
        loading={loading}
      />
      {category !== GameCategory.ALL && (
        <Button type="primary" onClick={() => setIsAddGameModalOpen(true)}>
          Добавить игру
        </Button>
      )}

      <AddGamesToCategoryModal
        open={isAddGameModalOpen}
        onClose={handleModalClose}
        category={category}
        refetchData={() => fetchData(category)}
      />
    </div>
  );
}

export default GamePlacement;
