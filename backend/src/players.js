import { randomUUID } from "node:crypto";

const handlePlayer = (msg, ws, users) => {
  let player = {
    conn: ws,
    room_id: null,
    name: null,
  };
  player.name = msg.name;
  // handle username
  if (users.room.length < 4) {
    users.room.push(player);
    if (users.room.length == 4) {
      // if room complated
      let uuid = randomUUID();
      users.rooms[uuid] = users.room.map((pl) => {
        pl.room_id = uuid;
        return pl;
      });
      users.room = [];
      console.log(users.rooms);
    }
    return player
  }
};

const removePlayer = (users, player) => {
    if (player.room_id != null) {
        users.rooms[player.room_id] = users.rooms[player.room_id].filter(pl => pl.conn != player.conn)
        if (users.rooms[player.room_id].length == 0) {
            delete users.rooms[player.room_id];
        }
    } else {
        users.room = users.room.filter(pl=> pl.conn != player.conn)
    }
}

export { handlePlayer, removePlayer };
