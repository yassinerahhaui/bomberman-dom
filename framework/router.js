import { patch } from "../framework/dom.js";
import { reset } from "../framework/state.js";
export class Router {
  constructor(paths) {
    this.paths = paths;
    this.oldDom = null;
    this.currentPath = window.location.pathname;
    this.init();
  }
  init() {
    this.navigate(this.currentPath, false);
    window.addEventListener("popstate", () => {
      this.navigate(window.location.pathname, false);
    });
    window.addEventListener("click", (e) => {
      if (e.target.tagName === "A") {
        e.preventDefault();
        const href = e.target.getAttribute("href");
        this.navigate(href, true);
      }
    });
  }
  navigate(pathName, pushState = true) {
    if (!this.paths.hasOwnProperty(pathName)) pathName = "/404page";

    if (pushState) {
      window.history.pushState(null, null, pathName);
    }
    this.currentPath = pathName;
    this.rerender();
  }
  rerender() {
    reset();
    const main = document.querySelector("#main");
    const vdom = this.paths[this.currentPath](); // Always get fresh vdom with latest state
    patch(main, this.oldDom, vdom);
    this.oldDom = vdom;
  }
}
