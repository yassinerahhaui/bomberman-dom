const levelChars = {
  ".": "empty",
  "#": "wall",
  "+": "break",
  "-": "safe"
};

var Level = class Level {
  /* convert string to slice */
  constructor(map) {
    let rows = map.trim().split("\n").map((line) => [...line]);
    this.height = rows.length;
    this.width = rows[0].length;
    this.startActors = [];
    this.rows = rows.map((row, y) => {
      return row.map((ch, x) => {
        let type = levelChars[ch];
        if (typeof type === "string") return type;
        if (type && typeof type.create === "function") {
          this.startActors.push(type.create(new Vec(x, y), ch));
        }
        return "empty";
      });
    });
    this.addRandomBreaks()
  }

  // Add random breakable blocks, avoiding safe zones
  addRandomBreaks( blockDensity = 0.3) {

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.rows[y][x] === "safe") {
          this.rows[y][x] = "empty";
          continue
        }
        if (
          this.rows[y][x] === "empty" &&
          Math.random() < blockDensity
        ) {
          this.rows[y][x] = "break";
        }
      }
    }
  }
};

var Player = class Player {
  constructor(pos, speed) {
    this.pos = pos;
    this.speed = speed;
    this.size = new Vec(0.5, 0.9);
  }

  get type() {
    return "player";
  }

  static create(pos) {
    return new Player(pos.plus(new Vec(0, 0)), new Vec(0, 0));
  }
};

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
};


export { Level }
