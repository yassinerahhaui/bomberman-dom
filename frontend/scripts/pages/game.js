import { ourFrame } from "../../../framework/dom.js";
import { state } from "../../../framework/state.js";
import { ws } from "../main.js";

let imageWidth = 50 * 12; // cell width * 12
let playerWidth = 600 / 12; // player image width / 12

function Game() {
  // if (!ws) {
  //     return ourFrame.createElement(null, null, null)
  // }
  const [gameMap, setGameMap] = state.useState(null);
  const [left, setLeft] = state.useState(0);
  const [top, setTop] = state.useState(0);
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
      // console.log(data.level);

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
            style: `width: ${imageWidth}px;top: ${top}px;left: ${left}px;`,
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
    {
      class: "game-container",
      tabIndex: "0",
      onkeydown: (e) => {
        switch (e.key) {
          case "ArrowUp":
          case "w":
            setTop(-playerWidth);
            left > -(playerWidth * 2)
              ? setLeft((l) => (l -= playerWidth))
              : setLeft(0);
            break;
          case "ArrowDown":
          case "s":
            setTop(0);
            left > -(playerWidth * 2)
              ? setLeft((l) => (l -= playerWidth))
              : setLeft(0);
            break;
          case "ArrowLeft":
          case "a":
            setTop(-(playerWidth * 2));
            left > -(playerWidth * 2)
              ? setLeft((l) => (l -= playerWidth))
              : setLeft(0);
            break;
          case "ArrowRight":
          case "d":
            setTop(-(playerWidth * 5));
            left > -(playerWidth * 2)
              ? setLeft((l) => (l -= playerWidth))
              : setLeft(0);

            break;
          case " ":
            // bomb logic
            break;
          default:
            break;
        }
      },
      onKeyUp: (e) => {
        setLeft(0);
      },
    },
    renderMap()
  );
}

export default Game;
