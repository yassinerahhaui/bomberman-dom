import { createServer } from "node:http";
import { handlePlayer } from "./src/players.js";
import { WebSocketServer } from "ws";
import { Level } from "./src/game.js";
import { map as mapString } from "./src/maps.js";
import { map } from "./src/maps.js";
import { affectCell, explodeBomb, handleBombPlacement, sendMapToRoom } from "./src/utils.js";
import { isCellEmpty, movePlayer, getNewPosition, handlePowerUpPickup, broadcastGameState } from "./moving.js";

const hostname = "localhost";
const port = 8000;

const server = createServer((req, res) => {

  if (req.method === "GET" && req.url === "/api/maps") {
    res.setHeader("Content-Type", "application/json");
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
      bombs: [],
      powerUp: []
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
        if (!ws.player || typeof ws.player.room_id !== "number") break;
        const room = game.rooms[ws.player.room_id];
        if (!room) break;

        const player = room.players.find(pl => pl.player_id === ws.player.playerId);
        if (!player) break;

        // Calculate intended new position
        const { newX, newY } = getNewPosition(player.pos, msg.action);

        // Move player if possible
        if (isCellEmpty(room, newX, newY)) {
          movePlayer(room, player, newX, newY);
          handlePowerUpPickup(room, player, newX, newY);
        }

        // Handle bomb placement
        if (msg.action === "bomb") {
          handleBombPlacement(room, player);
        }

        // Broadcast updated game state
        broadcastGameState(room);
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
