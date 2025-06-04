import { ourFrame } from "../../../framework/dom.js";

const Home = () => {
  return ourFrame.createElement(
    "main",
    {
      class: "main",
    },
    ourFrame.createElement('h1',{class:'title1'},'BOMBERMAN-DOM'),
    ourFrame.createElement(
      "div",
      {
        class: "card",
      },
      ourFrame.createElement("label",{for:''})
    )
  );
};

export { Home };
