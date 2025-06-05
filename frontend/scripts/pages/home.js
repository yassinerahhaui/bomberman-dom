import { ourFrame } from "../../../framework/dom.js";

const Home = () => {
  const HandleSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const name = formData.get('name')
    if (name.trim().length > 0) {
      console.log(name)
      e.target.reset()
    } else if (name.length > 0) {
      e.target.reset()
    }
  };
  
  return ourFrame.createElement(
    "main",
    {
      class: "main",
    },
    ourFrame.createElement("h1", { class: "title1" }, "BOMBERMAN-DOM"),
    ourFrame.createElement(
      "div",
      {
        class: "card",
      },
      ourFrame.createElement(
        "form",
        { method: "POST", onSubmit: HandleSubmit },
        ourFrame.createElement("label", { for: "nameInput" }, "Name"),
        ourFrame.createElement("input", {
          type: "text",
          name:'name',
          placeholder: "what's your name?",
          id: "nameInput",
        }),
        ourFrame.createElement(
          "button",
          { type: "submit", class: "submit-btn" },
          "submit"
        )
      )
    )
  );
};

export default Home;
