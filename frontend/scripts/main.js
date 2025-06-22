import { Router } from "../../framework/Router.js";
import Home from "./pages/home.js";
import PageNotFound from "./pages/notfound.js";
import Game from "./pages/game.js";
import AttendPage from "./pages/attend.js";

const ws = new WebSocket(`ws://localhost:8000`);

const router = new Router({
  "/": Home,
  // "/game": Game,
  "/attend": AttendPage,
  "/404": PageNotFound
});

export { router, ws };
