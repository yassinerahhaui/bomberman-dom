import { createServer } from "node:http";
import { handlePlayer, removePlayer } from "./src/players.js";
import { WebSocketServer } from "ws";
import { Level } from "./src/game.js";
import { map } from "./src/maps.js";

const hostname = "localhost";
const port = 8000;
const level = new Level(map)
const server = createServer((req, res) => {
  if (req.method === "GET" && req.url === "/api/maps") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({"level": level}));
  } else {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.end("Hello World");
  }
});

const wss = new WebSocketServer({ server });
let users = {
  rooms: {},
  room: []
}
wss.on("connection", (ws) => {
  /* 
    Conn : conn + type + room_id + data
  */

 
 var player;
  ws.on("message", (message) => {
    const buffer = new Uint8Array(message);
    const jsonData = new TextDecoder().decode(buffer);
    const msg = JSON.parse(jsonData);
    switch (msg.type) {
      case "username":
        player = handlePlayer(msg,ws, users)
        break;
      case "game":
        // handle logic
        break;
      default:
        break;
    }
  });

  ws.on("close", () => {
    removePlayer(users, player)
    console.log("Client disconnected");
  });
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
