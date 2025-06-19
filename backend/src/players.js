import { randomUUID } from "node:crypto";

let roomId = 0
const handlePlayer = (name, ws, game) => {
  let player = {
    conn: ws,
    player_id: null,
    room_id: roomId,
    name: null,
  };
  ws.player = { name: name, room_id: roomId };
  player.name = name;
  player.player_id = randomUUID()
  // handle username
  if (game.rooms[roomId].length < 4) {
    game.rooms[roomId].push(player);
    if (game.rooms[roomId].length === 4) {
      game.rooms.push([])
      roomId++
    }
  }
};

// const removePlayer = (users, player) => {
//   if (player.room_id != null) {
//     users.rooms[player.room_id] = users.rooms[player.room_id].filter(pl => pl.conn != player.conn)
//     if (users.rooms[player.room_id].length == 0) {
//       delete users.rooms[player.room_id];
//     }
//   } else {
//     users.room = users.room.filter(pl => pl.conn != player.conn)
//   }
// }

export { handlePlayer };
