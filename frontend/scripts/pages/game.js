import { ourFrame } from "../../../framework/dom.js";
import { state } from "../../../framework/state.js";
import { ws } from "../main.js";

let scale = 50;
let isMoving = false;

let animationFrameId = null;
function Game() {
  if (!ws) {
    return ourFrame.createElement(null, null, null);
  }
  const [gameMap, setGameMap] = state.useState(null);
  const [players, setPlayers] = state.useState([]); // For player positions from backend
  const [bombs, setBombs] = state.useState([]);
  const [explosions, setExplosions] = state.useState([]);
  const [powerUp, setPowerUp] = state.useState([]);
  const [playersInfo, setPlayersInfo] = state.useState([]);

  function fetchMap() {
    ws.send(JSON.stringify({ type: "map" }));
  }

  // Listen for player updates from backend
  ws.onmessage = (e) => {
    const data = JSON.parse(e.data);

    if (data.type === "game_state") {
      setPlayers(data.players); // Assume backend sends all player positions
    } else if (data.type == "players_info") {
      console.log(data.info);
      setPlayersInfo(data.info);
    } else if (data.type === "map") {
      setGameMap(data.level);
      ws.send(JSON.stringify({ type: "game", action: "start" }));
    } else if (data.type === "bomb_placed") {
      setBombs((bombs) => [
        ...bombs,
        {
          x: data.bomb.x,
          y: data.bomb.y,
          placedAt: data.bomb.placedAt || Date.now(),
        },
      ]);
    } else if (data.type === "explosion") {
      // Add explosion to state for animation
      data.affected.forEach((pos) => {
        setExplosions((explosions) => [
          ...explosions,
          {
            x: pos.x,
            y: pos.y,
            start: Date.now(),
            flameLength: data.flameLength,
          },
        ]);
        // Remove this explosion after 400ms
        setTimeout(() => {
          setExplosions((explosions) =>
            explosions.filter((e) => !(e.x === pos.x && e.y === pos.y))
          );
        }, 400);
      });
      // Optionally remove bomb from bombs state
      setBombs((bombs) =>
        bombs.filter((b) => !(b.x === data.bomb.x && b.y === data.bomb.y))
      );
    } else if (data.type === "powerup_spawned") {
      setPowerUp((powerUps) => [...powerUps, data.powerup]);
    } else if (data.type === "powerup_taken") {
      setPowerUp((powerUps) =>
        powerUps.filter((pu) => !(pu.x === data.x && pu.y === data.y))
      );
    }
  };

  // Game loop using requestAnimationFrame
  function gameLoop() {
    animationFrameId = requestAnimationFrame(gameLoop);
  }
  // Start the loop when component mounts
  if (!animationFrameId) {
    renderMap();
    animationFrameId = requestAnimationFrame(gameLoop);
  }

  function renderCell(cellType, x, y) {
    const children = [];

    // Explosion (drawn below everything)
    const explosion = explosions.find((e) => e.x === x && e.y === y);

    if (explosion) {
      children.push(
        ourFrame.createElement("img", {
          class: "bomb-img",
          src: "/frontend/assets/explotion.png",
          style: `
          width: 50px;
          height: 50px;
          object-fit: contain;
          object-position: 0px 0px;
          position: absolute;
          z-index: 1;
        `,
        })
      );
    }

    // Bomb (drawn above explosion, below player)
    const bomb = bombs.find((b) => b.x === x && b.y === y);
    if (bomb) {
      children.push(
        ourFrame.createElement("img", {
          class: "bomb-img",
          src: "/frontend/assets/bomb.png",
          style: `
          width: 50px;
          height: 50px;
          object-fit: contain;
          position: absolute;
          z-index: 2;
        `,
        })
      );
    }
    // Power-up (drawn above bomb/explosion, below player)
    const powerup = powerUp.find((p) => p.x === x && p.y === y);
    if (powerup) {
      // let src = "";
      let className = "powerup";
      if (powerup.type === "bombs") {
        // src = "/frontend/assets/powerup-bomb.png";
        className += " powerup-bombs";
      } else if (powerup.type === "flames") {
        // src = "/frontend/assets/powerup-flame.png";
        className += " powerup-flames";
      } else if (powerup.type === "speed") {
        // src = "/frontend/assets/powerup-speed.png";
        className += " powerup-speed";
      }
      children.push(
        ourFrame.createElement("div", {
          class: className,
          // src,
          style: `
          width: 40px;
          height: 40px;
          position: absolute;
          left: 5px;
          top: 5px;
          z-index: 3;
        `,
        })
      );
    }
    return ourFrame.createElement(
      "td",
      {
        class: `cell ${cellType}`,
      },
      ...children
    );
  }

  function renderLives(lives) {
    let res = [];
    for (let i = 1; i <= lives; i++) {
      res.push(
        ourFrame.createElement("img", { class: "player-info-live", src: "frontend/assets/heart.png" })
      );
    }
    return res
  }

  function renderMap() {
    if (!gameMap) {
      fetchMap();
      return ourFrame.createElement("div", null, "Loading...");
    }

    return ourFrame.createElement(
      "div",
      { class: "game" },
      ourFrame.createElement(
        "div",
        { class: "game-info" },
        ...playersInfo.map((pl, idx) =>
          ourFrame.createElement(
            "div",
            { style: `display: flex` },
            ourFrame.createElement(
              "div",
              {
                class: "player-info-img-box",
                style: `width: ${scale}px; height: ${scale}px`,
              },
              ourFrame.createElement("img", {
                src: "frontend/assets/players.png",
                class: "player-info-img",
                style: `width: ${scale * 12}px;top: 0;left: -${
                  scale * (idx * 3)
                }px;`,
              })
            ),
            ourFrame.createElement(
              "div",
              { class: "player-info" },
              ourFrame.createElement(
                "p",
                { class: "player-info-username" },
                `${pl.username}`
              ),
              ...renderLives(pl.lives)
            )
          )
        )
      ),
      ourFrame.createElement(
        "table",
        {
          class: "game-map",
          style: `width: ${scale * gameMap.width}px; position: relative;`,
        },
        ...gameMap.rows.map((row, y) =>
          ourFrame.createElement(
            "tr",
            { class: "row", style: `height: ${scale}px` },
            ...row.map((cell, x) => renderCell(cell, x, y))
          )
        ),
        ...renderPlayers()
      )
    );
  }

  function renderPlayers() {
    return players.map((player, idx) =>
      ourFrame.createElement(
        "div",
        {
          class: "player-box",
          style: `
        width: ${scale}px;
        height: ${scale}px;
        object-fit: contain;
        transform: translate(${player.pos.x * scale}px, -${
            (gameMap.height - player.pos.y - 1) * scale
          }px);
        transition: transform 0.3s linear; /* Smooth movement */
        z-index: 10;
      `,
        },
        ourFrame.createElement("img", {
          class: "player-img",
          src: "/frontend/assets/players.png",
          style: `width: ${scale * 12}px;left: -${scale * (idx * 3)}px;top: 0;`,
        })
      )
    );
  }

  function handleKeyDown(e) {
    let action = null;
    console.log(e.key);
    switch (e.key) {
      case "ArrowUp":
        if (isMoving) return;
        isMoving = true; // Lock movement
        action = "up";
        break;
      case "ArrowDown":
        if (isMoving) return;
        isMoving = true; // Lock movement
        action = "down";
        break;
      case "ArrowLeft":
        if (isMoving) return;
        isMoving = true; // Lock movement
        action = "left";
        break;
      case "ArrowRight":
        if (isMoving) return;
        isMoving = true; // Lock movement
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
      setTimeout(() => {
        isMoving = false;
      }, 300);
    }
  }

  return ourFrame.createElement(
    "div",
    {
      class: "game-container",
      // style: `position: relative;`,
      tabIndex: "0",
      onkeydown: handleKeyDown,
    },
    renderMap()
  );
}

export default Game;
