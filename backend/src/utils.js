
const isNameTaken = (users, name) => {
  // Check in waiting room
  if (users.room.some(pl => pl.name === name)) return true;
  // Check in all rooms
  for (const roomId in users.rooms) {
    if (users.rooms[roomId].some(pl => pl.name === name)) return true;
  }
  return false;
};