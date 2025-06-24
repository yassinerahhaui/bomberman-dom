import { ourFrame } from "../../../framework/dom.js";
import { state } from "../../../framework/state.js";


let imageWidth = 50 * 12 // cell width * 12
let playerWidth = 600 / 12 // player image width / 12

function Game() {
  state.resetCursor();
  const [gameMap, setGameMap] = state.useState(null);
  async function fetchMap() {
    try {
      const response = await fetch("http://localhost:8000/api/maps", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data.level);

      setGameMap(data.level);
    } catch (error) {
      console.error("Error fetching map:", error);
    }
  }

  function renderCell(cellType) {
    return ourFrame.createElement(
      "td",
      {
        class: `cell ${cellType}`,
      },
      cellType === "player"
        ? ourFrame.createElement("img", {
            class: "player-img ",
            src: "/frontend/assets/players.png",
            style: `width: ${imageWidth}px;top`
          })
        : null
    );
  }

  function renderMap() {
    if (!gameMap) {
      fetchMap();
      return ourFrame.createElement("div", null, "Loading...");
    }
    console.log(gameMap);

    return ourFrame.createElement(
      "table",
      { class: "game-map" },
      ...gameMap.rows.map((row) =>
        ourFrame.createElement(
          "tr",
          { class: "row" },
          ...row.map((cell) => renderCell(cell))
        )
      )
    );
  }

  return ourFrame.createElement(
    "div",
    { class: "game-container" },
    renderMap()
  );
}

export default Game;
