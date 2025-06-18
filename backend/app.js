import { createServer } from "node:http";
import { handlePlayer, removePlayer } from "./src/players.js";
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
  } else if (req.method === "POST" && req.url === "/api/checkname") {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        const name = data.name;
        console.log(name);
        
        // Now you can use the 'name' variable to check uniqueness, etc.
        // Example response:
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ ok: true }));
      } catch (err) {
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ ok: false, message: "Invalid JSON" }));
      }
    });
    return;
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
        player = handlePlayer(msg, ws, users)
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
