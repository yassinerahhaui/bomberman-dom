import { randomUUID } from "node:crypto";

let roomId = 0

function broadcastRoomState(room) {
  const state = {
    type: "room_state",
    playerCount: room.players.length,
    playerNames: room.players.map(p => p.name),
    mainTimeLeft: room.mainTimeLeft,
    readyTimeLeft: room.readyTimeLeft,
    mainTimerStarted: room.mainTimerStarted,
    readyTimerStarted: room.readyTimerStarted,
    gameStarted: room.gameStarted,
  };
  room.players.forEach(p => p.conn.send(JSON.stringify(state)));
}

function startMainTimer(room) {
  if (room.mainTimerStarted) return;
  room.mainTimerStarted = true;
  room.mainTimeLeft = 20;
  room.intervalId = setInterval(() => {
    room.mainTimeLeft--;
    broadcastRoomState(room);
    if (room.mainTimeLeft <= 0) {
      if (room.players.length === 1) {
        room.mainTimeLeft = 20
        broadcastRoomState(room);
        return
      }
      clearInterval(room.intervalId);
      room.intervalId = null;
      startReadyTimer(room);
    }
  }, 1000);
}

function startReadyTimer(room) {
  if (room.readyTimerStarted) return;
  room.readyTimerStarted = true;
  room.readyTimeLeft = 10;
  room.intervalId = setInterval(() => {
    room.readyTimeLeft--;
    broadcastRoomState(room);
    if (room.readyTimeLeft <= 0) {
      clearInterval(room.intervalId);
      room.intervalId = null;
      room.gameStarted = true;
      broadcastRoomState(room);
      //trigger game start logic here

    }
  }, 1000);
}


const handlePlayer = (name, ws, game) => {
  let player = {
    conn: ws,
    player_id: null,
    room_id: roomId,
    name: null,
  };

  player.name = name;
  player.player_id = randomUUID()

  ws.send(JSON.stringify({
    type: "player_added",
    playerId: player.player_id
  }))

  if (game.rooms[roomId].players.length < 4) {
    if (!game.rooms[roomId].readyTimerStarted) {
      ws.player = { name: name, room_id: roomId, playerId: player.player_id };
      game.rooms[roomId].players.push(player);
    } else {
      game.rooms.push(
        {
          players: [],
          createdAt: Date.now(),
          mainTimerStarted: false,
          mainTimeLeft: 20,
          readyTimerStarted: false,
          readyTimeLeft: 10,
          intervalId: null,
          gameStarted: false,
        }
      )
      roomId++
      ws.player = { name: name, room_id: roomId, playerId: player.player_id };
      game.rooms[roomId].players.push(player);
    }

    startMainTimer(game.rooms[roomId]);

    if (game.rooms[roomId].players.length === 4) {
      game.rooms.push(
        {
          players: [],
          createdAt: Date.now(),
          mainTimerStarted: false,
          mainTimeLeft: 20,
          readyTimerStarted: false,
          readyTimeLeft: 10,
          intervalId: null,
          gameStarted: false,
        }
      )
      roomId++
    }
  }
};



export { handlePlayer };
