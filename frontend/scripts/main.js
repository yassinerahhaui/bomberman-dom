import { Router } from "../../framework/Router.js";
import Home from "./pages/home.js";
import PageNotFound from "./pages/notfound.js";
import Game from "./pages/game.js";
import AttendPage from "./pages/attend.js";

let ws = null;  
function setWs(newWs) {
  ws = newWs;
}

const router = new Router({
  "/": Home,
  "/game": Game,
  "/attend": AttendPage,
  "/404": PageNotFound
});

// if (!ws) {
//   router.navigate("/")
// }
export { router, ws, setWs };
