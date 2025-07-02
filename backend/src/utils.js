import { log } from "node:console";

const POWER_UPS = ["bombs", "flames", "speed"];
function explodeBomb(room, bomb) {
  const directions = [
    { dx: 0, dy: -1 }, // up
    { dx: 0, dy: 1 },  // down
    { dx: -1, dy: 0 }, // left
    { dx: 1, dy: 0 },  // right
  ];

  // Collect all affected positions
  const affected = [{ x: bomb.x, y: bomb.y }];


  // Always affect the bomb's own cell
  affectCell(room, bomb.x, bomb.y);

  for (const dir of directions) {
    for (let i = 1; i <= bomb.flameLength; i++) {
      const nx = bomb.x + dir.dx * i;
      const ny = bomb.y + dir.dy * i;
      const cell = room.map.rows[ny][nx];

      if (cell === "wall") break; // Stop at wall

      affected.push({ x: nx, y: ny });
      affectCell(room, nx, ny);

      if (cell === "break") {
        // Destroy breakable and stop flame
        room.map.rows[ny][nx] = "empty";
        if (Math.random() < 0.3) { // 30% chance, adjust as needed
          const type = POWER_UPS[Math.floor(Math.random() * POWER_UPS.length)];
          if (!room.powerUps) room.powerUps = [];
          room.powerUps.push({ x: nx, y: ny, type });
          room.players.forEach(p => {
            p.conn.send(JSON.stringify({
              type: "powerup_spawned",
              powerup: { x: nx, y: ny, type }
            }));
          });
        }
        break;
      }
    }
  }

  // Notify all players about the explosion (for animation)
  room.players.forEach(p => {
    p.conn.send(JSON.stringify({
      type: "explosion",
      bomb: { x: bomb.x, y: bomb.y },
      flameLength: bomb.flameLength,
      affected // send all affected positions

    }));
  });
  sendMapToRoom(room);

}

// Helper: affect cell (damage player, etc.)
function affectCell(room, x, y) {
  // Damage any player in this cell
  room.players.forEach(player => {
    if (player.pos.x === x && player.pos.y === y && player.lives > 0) {
      player.lives--;
      if (player.lives <= 0) {
        console.log("Player died at:", x, y);
        
        player.status = "dead";
        // Optionally remove from map or handle respawn
        room.map.rows[y][x] = "empty";
         room.players.forEach(p => {
          p.conn.send(JSON.stringify({
            type: "player_died",
            id: player.player_id,
            name: player.name,
            x,
            y
          }));
        });
      }
    }
  });
}

function handleBombPlacement(room, p) {
  if (p.bombsAvailable > 0) {
    p.bombsAvailable--;
    const bomb = {
      x: p.pos.x,
      y: p.pos.y,
      owner: p.player_id,
      flameLength: p.flameLength// or get from power-up
    };

    room.bombs.push(bomb);

    // Notify all players about the new bomb
    room.players.forEach(player => {
      player.conn.send(JSON.stringify({
        type: "bomb_placed",
        bomb: { x: bomb.x, y: bomb.y, placedAt: Date.now() }
      }));
    });
    sendMapToRoom(room);

    setTimeout(() => {
      explodeBomb(room, bomb);
      p.bombsAvailable++;
      // Remove bomb from room.bombs
      room.bombs = room.bombs.filter(b => b !== bomb);
    }, 2000);
  }
}
function sendMapToRoom(room) {
  if (!room) return;
  room.players.forEach(p => {
    p.conn.send(JSON.stringify({
      type: "map",
      level: room.map
    }));
  });
}

export { explodeBomb, affectCell, handleBombPlacement, sendMapToRoom }