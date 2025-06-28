import { ourFrame } from "../../../framework/dom.js";
import { state } from "../../../framework/state.js";
import { ws } from "../main.js";

let imageWidth = 50 * 12; // cell width * 12
let playerWidth = 600 / 12; // player image width / 12
let scale = 50;

let animationFrameId = null
function Game() {
  if (!ws) {
    return ourFrame.createElement(null, null, null);
  }
  const [gameMap, setGameMap] = state.useState(null);
  // const [left, setLeft] = state.useState(0);
  // const [top, setTop] = state.useState(0);
  const [players, setPlayers] = state.useState([]); // For player positions from backend


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

  // Listen for player updates from backend
  ws.onmessage = (e) => {
    const data = JSON.parse(e.data);
    console.log(data);

    if (data.type === "game_state") {
      setPlayers(data.players); // Assume backend sends all player positions
    }
  };

  // Game loop using requestAnimationFrame
  function gameLoop() {
    animationFrameId = requestAnimationFrame(gameLoop);
  }

  // Start the loop when component mounts
  if (!animationFrameId) {
    fetchMap();
    animationFrameId = requestAnimationFrame(gameLoop);
  }
  function renderCell(cellType, x, y) {
    // Render player if player is at (x, y)
    console.log(players);

    const player = players.find(p => p.pos.x === x && p.pos.y === y);
    console.log(player);

    return ourFrame.createElement(
      "td",
      {
        class: `cell ${cellType}`,
      },
      // cellType === "player"
      player
        // ? ourFrame.createElement("img", {
        //   class: "player-img ",
        //   src: "/frontend/assets/players.png",
        //   style: `width: ${imageWidth}px;
        //     object-fit: none;
        //     object-position: -${player.spriteCol * 32}px -${player.spriteRow * 32}px;
        //     image-rendering: pixelated;
        //   `,
        // })
        ? ourFrame.createElement("div", {
          class: "player-circle",
          style: `
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: ${player.color || "#3498db"};
            margin: auto;
            border: 2px solid #222;
          `,
        })
        : null
    );
  }

  function renderMap() {
    if (!gameMap) {
      // fetchMap();
      return ourFrame.createElement("div", null, "Loading...");
    }
    console.log(gameMap);

    return ourFrame.createElement(
      "table",
      { class: "game-map", style: `width: ${scale * gameMap.width}px` },
      ...gameMap.rows.map((row, y) =>
        ourFrame.createElement(
          "tr",
          { class: "row", style: `height: ${scale}px` },
          ...row.map((cell, x) => renderCell(cell, x, y))
        )
      )
    );
  }

  function handleKeyDown(e) {
    let action = null;
    console.log(e.key);
    switch (e.key) {

      case "ArrowUp":
      case "w":
      case "z":
        action = "up";
        break;
      case "ArrowDown":
      case "s":
        action = "down";
        break;
      case "ArrowLeft":
      case "a":
      case "q":
        action = "left";
        break;
      case "ArrowRight":
      case "d":
        action = "right";
        break;
      case " ":
        action = "bomb";
        break;
      default:
        break;
    }
    if (action && ws) {
      ws.send(JSON.stringify({ type: "game", action }));
    }
  }

  return ourFrame.createElement(
    "div",
    {
      class: "game-container",
      tabIndex: "0",
      onkeydown: handleKeyDown,
      style: "outline:none;" // Remove focus outline
    },
    renderMap()
  );
  // function goLeft() {
  //   setTop(-(playerWidth * 2));
  //   left > -(playerWidth * 2) ? setLeft((l) => (l -= playerWidth)) : setLeft(0);
  // }
  // function goRight() {
  //   setTop(-(playerWidth * 5));
  //   left > -(playerWidth * 2) ? setLeft((l) => (l -= playerWidth)) : setLeft(0);
  // }
  // function goUp() {
  //   setTop(-playerWidth);
  //   left > -(playerWidth * 2) ? setLeft((l) => (l -= playerWidth)) : setLeft(0);
  // }
  // function goDown() {
  //   setTop(0);
  //   left > -(playerWidth * 2) ? setLeft((l) => (l -= playerWidth)) : setLeft(0);
  // }

  // ws.onmessage = (e) => console.log(e.data);

  // return ourFrame.createElement(
  //   "div",
  //   {
  //     class: "game-container",
  //     tabIndex: "0",
  //     onkeydown: (e) => {
  //       switch (e.key) {
  //         case "ArrowUp":
  //         case "w":
  //         case "z":
  //           goUp();
  //           ws.send(JSON.stringify({ type: "game", action: "ArrowUp" }));
  //           break;
  //         case "ArrowDown":
  //         case "s":
  //           goDown();
  //           ws.send(JSON.stringify({ type: "game", action: "ArrowDown" }));
  //           break;
  //         case "ArrowLeft":
  //         case "a":
  //         case "q":
  //           goLeft();
  //           ws.send(JSON.stringify({ type: "game", action: "ArrowLeft" }));
  //           break;
  //         case "ArrowRight":
  //         case "d":
  //           goRight();
  //           ws.send(JSON.stringify({ type: "game", action: "ArrowRight" }));
  //           break;
  //         case " ":
  //           // bomb logic
  //           break;
  //         default:
  //           break;
  //       }
  //     },
  //     onKeyUp: (e) => {
  //       setLeft(0);
  //     },
  //   },
  //   renderMap()
  // );
}

export default Game;
