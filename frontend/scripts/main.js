import { Router } from "../../framework/Router.js";
import Home from "./pages/home.js";
import PageNotFound from "./pages/notfound.js";
import Game from "./pages/game.js";

const router = new Router({
  "/": Home,
  "/game": Game,
  "/404": PageNotFound
});

export { router };
