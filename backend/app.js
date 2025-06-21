import { createServer } from "node:http";
import { handlePlayer } from "./src/players.js";
import { WebSocketServer } from "ws";
import { Level } from "./src/game.js";
import { map } from "./src/maps.js";

const hostname = "localhost";
const port = 8000;
const level = new Level(map)
const server = createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Allow all origins
  // res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS"); // Allowed methods
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
// let users = {
//   rooms: [],
//   // room: []
// }
let game = {
  rooms: [[]]
}
wss.on("connection", (ws) => {
  /* 
    Conn : conn + type + room_id + data
  */

  // var player;
  ws.on("message", (message) => {
    const buffer = new Uint8Array(message);
    const jsonData = new TextDecoder().decode(buffer);
    const msg = JSON.parse(jsonData);
    switch (msg.type) {
      case "username":
        console.log(msg);

        handlePlayer(msg.name, ws, game)
        console.log(ws.player);

        break;
      case "game":
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
        const idx = room.findIndex(p => p.conn === ws);
        if (idx !== -1) {
          const [removedPlayer] = room.splice(idx, 1);
          // Notify remaining players in the room
          room.forEach(p => {
            p.conn.send(JSON.stringify({
              type: "player_disconnected",
              name: removedPlayer.name
            }));
          });
          broadcastPlayerCount(room);

          // Optionally, remove empty rooms
          // if (room.length === 0) {
          //   delete game.rooms[ws.player.room_id];
          // }
        }
      }
    }
    console.log("Client disconnected");
  });
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
