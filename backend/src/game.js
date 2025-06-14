const levelChars = {
  ".": "empty",
  "#": "wall",
  "1": "player",
  "2": "player",
  "3": "player",
  "4": "player",
};
var Level = class Level {
  /* convert string to slice */
  constructor(map) {
    let rows = map.trim.split("\n").map((line) => [...line]);
    this.height = rows.length;
    this.width = rows[0].length;
    this.startActors = [];
    this.rows = rows.map((row, y) => {
      return row.map((ch, x) => {
        let type = levelChars[ch];
        if (typeof type === "string") return type;
        this.startActors.push(type.create(new Vec(x, y), ch));
        return "empty"
      });
    });
  }
}

var Player = class Player {
  constructor(pos, speed) {
    this.pos = pos;
    this.speed = speed;
    this.size = new Vec(0.5, 0.9);
  }

  get type() {
    return 'player';
  }

  static create(pos) {
    return new Player(pos.plus(new Vec(0,0)), new Vec(0,0));
  }

}

var Vec = class Vec {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  plus(other) {
    return new Vec(this.x + other.x, this.y + other.y);
  }

  times(factor) {
    return new Vec(this.x * factor, this.y * factor);
  }
}
