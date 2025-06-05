import { Router } from "../../framework/Router.js";
import Home from "./pages/home.js";
import PageNotFound from "./pages/notfound.js";

const router = new Router({
  "/": Home,
  "/404": PageNotFound
});

export { router };
