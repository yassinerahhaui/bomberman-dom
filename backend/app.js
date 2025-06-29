import { createServer } from "node:http";
import { handlePlayer } from "./src/players.js";
import { WebSocketServer } from "ws";
import { Level } from "./src/game.js";
import { map as mapString } from "./src/maps.js";
import { map } from "./src/maps.js";
import { affectCell, explodeBomb, handleBombPlacement, sendMapToRoom } from "./src/utils.js";

const hostname = "localhost";
const port = 8000;
const level = new Level(map)

const server = createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Allow all origins
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization"); // Allowed headers

  if (req.method === "GET" && req.url === "/api/maps") {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ "level": level }));
    res.statusCode = 200;
  } else {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.end("Hello World");
  }
});

const wss = new WebSocketServer({ server });

let game = {
  rooms: [
    {
      players: [],
      createdAt: Date.now(),
      mainTimerStarted: false,
      mainTimeLeft: 20,
      readyTimerStarted: false,
      readyTimeLeft: 10,
      intervalId: null,
      gameStarted: false,
      map: new Level(mapString),
      bombs: []

    }
  ]
}
wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    const buffer = new Uint8Array(message);
    const jsonData = new TextDecoder().decode(buffer);
    const msg = JSON.parse(jsonData);
    switch (msg.type) {
      case "username":
        handlePlayer(msg.name, ws, game)
        break;
      case "chat":
        // Broadcast chat message to all players in the room
        if (ws.player && typeof ws.player.room_id === "number") {
          const room = game.rooms[ws.player.room_id];
          if (room) {
            room.players.forEach(p => {
              p.conn.send(JSON.stringify({
                type: "chat",
                playerId: ws.player.playerId,
                name: ws.player.name,
                text: msg.text
              }));
            });
          }
        }
        break;
      case "map":
        if (ws.player && typeof ws.player.room_id === "number") {
          const room = game.rooms[ws.player.room_id];
          sendMapToRoom(room);
        }
  
        break
      case "game":
        if (ws.player && typeof ws.player.room_id === "number") {
          const room = game.rooms[ws.player.room_id];
          if (room) {
            // Find the player object in the room
            const p = room.players.find(pl => pl.player_id === ws.player.playerId);
            if (!p) return;

            // Calculate intended new position
            let newX = p.pos.x;
            let newY = p.pos.y;
            if (msg.action === "up") newY -= 1;
            if (msg.action === "down") newY += 1;
            if (msg.action === "left") newX -= 1;
            if (msg.action === "right") newX += 1;

            // Check for wall collision
            if (room.map.rows[newY][newX] === "empty") {
              // valid move, update position
              room.map.rows[p.pos.y][p.pos.x] = "empty"
              room.map.rows[newY][newX] = "player"
              p.pos.x = newX;
              p.pos.y = newY;
            }

            // else: do nothing, stay in place 
            if (msg.action === "bomb") {
              handleBombPlacement(room, p)
            }

            room.players.forEach(p => {
              p.conn.send(JSON.stringify({
                type: "game_state",
                players: room.players.map(player => ({
                  level: room.map,
                  pos: player.pos,
                  spriteRow: player.spriteRow,
                  spriteCol: player.spriteCol
                }))
              }));
            });
          }
        }
        // handle logic
        break;
      default:
        break;
    }
  });

  ws.on("close", () => {
    // removePlayer(users, player)
    if (ws.player && typeof ws.player.room_id === "number") {
      const room = game.rooms[ws.player.room_id];
      if (room) {
        const idx = room.players.findIndex(p => p.conn === ws);
        if (idx !== -1) {
          const [removedPlayer] = room.players.splice(idx, 1);
          // Notify remaining players in the room
          room.players.forEach(p => {
            p.conn.send(JSON.stringify({
              type: "player_disconnected",
              name: removedPlayer.name
            }));
          });

          // Optionally, remove empty rooms
          if (room.length === 0) {
            delete game.rooms[ws.player.room_id];
          }
        }
      }
    }
    console.log("Client disconnected");
  });
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
