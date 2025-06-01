import { Router } from "../../framework/router.js";
import { PageNotFound } from "../../framework/notfound.js";
import { Home } from "./pages/home.js";

const router = new Router({
  "/": Home,
  "/404page": PageNotFound
});

export { router };
