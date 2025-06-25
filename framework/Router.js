// Router.js

import { ourFrame } from "./dom.js";
import { injectRerender, state } from "./state.js";

export class Router {
  constructor(routes, rootElement) {
    this.routes = routes;
    this.rootElement = rootElement || document.getElementById("root");
    this.currentPath = window.location.pathname;
    this.currentApp = null; // Track current VDOM
    this.init();
  }

  init() {
    // Listen to navigation events
    window.addEventListener("click", (e) => {
      if (e.target.tagName === "A") {
        e.preventDefault();
        let pathName = e.target.getAttribute("href");
        this.navigate(`${pathName}`);
        this.rerender();
      }
    });
    injectRerender(this.rerender.bind(this));
    window.addEventListener("popstate", () => this.handleNavigation());
    window.addEventListener("navigation", () => this.handleNavigation());
    this.handleNavigation();
  }

  handleNavigation() {
    this.currentPath = window.location.pathname;
    const route = this.matchRoute(this.currentPath);

    if (route) {
      this.render(route.component);
    } else {
      // Redirect to 404 if route doesn't exist
      this.navigate("/404", true); // `replace: true` to avoid history entry
    }
  }

  matchRoute(path) {
    // Check exact matches first
    if (this.routes[path]) {
      return { component: this.routes[path] };
    }

    return null; // No match
  }

  render(component) {
    const newApp = component();
    // console.log(newApp);
    state.resetCursor();
    if (this.currentApp) {
      ourFrame.patch(this.rootElement, this.currentApp, newApp);
    } else {
      ourFrame.render(newApp, this.rootElement);
    }

    this.currentApp = newApp;
  }

  rerender() {
    this.handleNavigation();
  }

  navigate(to, replace = false) {
    if (this.currentPath === to) return;

    if (replace) {
      window.history.replaceState(null, "", to);
    } else {
      window.history.pushState(null, "", to);
    }
    state.clearStates()
    // Trigger navigation event
    window.dispatchEvent(new CustomEvent("navigation"));
  }
}
