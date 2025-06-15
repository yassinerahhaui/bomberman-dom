import { createServer } from "node:http";
import { WebSocketServer } from 'ws';

const hostname = 'localhost';
const port = 8000;

const server = createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/api/hello') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message: 'Hello from GET endpoint!' }));
  } else {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello World');
  }
});

const wss = new WebSocketServer({ server });
var conns = []
wss.on("connection", (ws) => {
  /* 
    Conn : conn + type + room_id + data
  */
  conns.push(ws)

  ws.on("message", (msg) => {
    switch (msg.type) {
      case 'username':
        
        break;
    
      default:
        break;
    }
    console.log(`Received message: ${msg}`);
    conns.map(conn => {
      if (conn != ws) {
        conn.send(JSON.stringify(msg))
      }
    })
    // ws.send(`Echo: ${message}`);
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});