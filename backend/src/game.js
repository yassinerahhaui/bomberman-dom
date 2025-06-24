const levelChars = {
  ".": "empty",
  "#": "wall",
  "+": "break",
  1: "player",
  2: Player,
  3: Player,
  4: Player,
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

const result = {
  maps: {},
  player1: {
    name: "",
    pos: {
      x: 1,
      y: 3,
    },
    state: {
      status: "playing",
      lives: 3,
      power_ups: {
        bombs: 1,
        speed: 1,
        flames: 1,
      },
    },
  },
  player2: {
    name: "",
    pos: {
      x: 1,
      y: 3,
    },
    state: {
      status: "playing",
      lives: 3,
      power_ups: {
        bombs: 1,
        speed: 1,
        flames: 1,
      },
    },
  },
  player3: {
    name: "",
    pos: {
      x: 1,
      y: 3,
    },
    state: {
      status: "playing",
      lives: 3,
      power_ups: {
        bombs: 1,
        speed: 1,
        flames: 1,
      },
    },
  },
  player4: {
    name: "",
    pos: {
      x: 1,
      y: 3,
    },
    state: {
      status: "playing",
      lives: 3,
      power_ups: {
        bombs: 1,
        speed: 1,
        flames: 1,
      },
    },
  },
};

export {Level}
