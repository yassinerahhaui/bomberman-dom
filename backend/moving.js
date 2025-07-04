function getNewPosition(pos, action) {
  let { x, y } = pos;
  if (action === "up") y -= 1;
  if (action === "down") y += 1;
  if (action === "left") x -= 1;
  if (action === "right") x += 1;
  return { newX: x, newY: y };
}

function isCellEmpty(room, x, y) {
  return room.map.rows[y] && room.map.rows[y][x] === "empty";
}

function movePlayer(room, player, x, y) {
  room.map.rows[player.pos.y][player.pos.x] = "empty";
  room.map.rows[y][x] = "player";
  player.pos.x = x;
  player.pos.y = y;
}

function handlePowerUpPickup(room, player, x, y) {
  const idx = room.powerUp?.findIndex(pu => pu.x === x && pu.y === y);
  console.log(idx, room.powerUp);

  if (idx !== undefined && idx !== -1) {
    const powerUp = room.powerUp[idx];
    applyPowerUp(player, powerUp.type);
    room.powerUp.splice(idx, 1);
    room.players.forEach(pl => {
      pl.conn.send(JSON.stringify({
        type: "powerup_taken",
        x: powerUp.x,
        y: powerUp.y,
        playerId: player.player_id,
        powerType: powerUp.type
      }));
    });
  }
}

function applyPowerUp(player, type) {
  if (type === "bombs") player.bombsAvailable = Math.min(player.bombsAvailable + 1, 3);
  else if (type === "flames") player.flameLength = Math.min(player.flameLength + 1, 3);
  else if (type === "speed") player.speed = Math.min(player.speed + 1, 3);
}

function broadcastGameState(room) {
  room.players.forEach(p => {
    p.conn.send(JSON.stringify({
      type: "game_state",
      players: room.players.map(player => ({
        level: room.map,
        pos: player.pos,
        index: player.idx,
        speed: player.speed,
        id: player.player_id
      })),
    }));
  });
}
export { broadcastGameState, applyPowerUp, handlePowerUpPickup, getNewPosition, isCellEmpty, movePlayer }