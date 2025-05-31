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

wss.on("connection", (ws) => {
  console.log("new client enter");

  ws.on("message", (message) => {
    console.log(`Received message: ${message}`);
    ws.send(`Echo: ${message}`);
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});