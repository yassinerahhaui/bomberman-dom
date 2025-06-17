import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { WebSocketServer } from "ws";

const hostname = "localhost";
const port = 8000;

const server = createServer((req, res) => {
  if (req.method === "GET" && req.url === "/api/hello") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: "Hello from GET endpoint!" }));
  } else {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.end("Hello World");
  }
});

const wss = new WebSocketServer({ server });
let players = [];
let room = [];
let rooms = {};

wss.on("connection", (ws) => {
  /* 
    Conn : conn + type + room_id + data
  */
  let player = {
    conn: ws,
    room_id: null,
    name: null,
  };

  players.push(player);
  ws.on("message", (message) => {
    const buffer = new Uint8Array(message);
    const jsonData = new TextDecoder().decode(buffer);
    const msg = JSON.parse(jsonData);

    switch (msg.type) {
      case "username":
        for (let pl of players) {
          if (pl.conn == ws) {
            pl.name = msg.name;
            if (room.length < 4) { 
              room.push(pl);
              if (room.length == 4) { // if room complated
                let uuid = randomUUID();
                rooms[uuid] = room.map((pl) => {
                  pl.room_id = uuid;
                  return pl;
                });
                room = [];
                console.log(rooms);
              }
            }
            break;
          }
        }
        break;

      default:
        break;
    }

    players.forEach((pl) => {
      if (pl.conn != ws) {
        pl.conn.send(JSON.stringify(msg));
      }
    });
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
