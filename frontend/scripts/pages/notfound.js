import { ourFrame } from "../../../framework/dom.js";

const PageNotFound = () => {
  return ourFrame.createElement(
    "div",
    {},
    ourFrame.createElement("h3", {}, "404 Page not found!"),
    ourFrame.createElement("a", { href: "/" }, "BACK TO HOME!")
  );
};

export default PageNotFound;