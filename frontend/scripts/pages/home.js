import { ourFrame } from "../../../framework/dom.js";
import { router } from "../main.js";
import { ws, setWs } from "../main.js";

const Home = () => {
  if (!ws) {
    setWs(new WebSocket(`ws://localhost:8000`));
  }
  const HandleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get("name");
    if (name.trim().length > 0) {
      console.log(ws.playerId);
      if (!ws.playerId) {
        ws.send(JSON.stringify({ type: "username", name: name }));
      }
      e.target.reset();
    } else if (name.length > 0) {
      e.target.reset();
    }
  };
  ws.addEventListener("open", (e) => {
    console.log("connection opened");
  });
  ws.onmessage = (e) => {

    const data = JSON.parse(e.data);
    if (data.type === "player_added") {
      ws.playerId = data.playerId
      router.navigate("/attend")
    }
  }
  // ws.addEventListener("message", ws.handleMessage);

  return ourFrame.createElement(
    "main",
    {
      class: "main",
    },
    ourFrame.createElement("div", { class: "title" },
      ourFrame.createElement("h1", { class: "title1" }, "BOMBERMAN-DOM"),
      ourFrame.createElement("img", {
        src: "/frontend/assets/bomb.png",
        class: "bomb-logo"
      }),
    ),
    ourFrame.createElement(
      "div",
      {
        class: "card",
      },
      ourFrame.createElement(
        "form",
        { method: "POST", onSubmit: HandleSubmit },
        ourFrame.createElement(
          "label",
          { for: "nameInput", class: "label-name" },
          "Create Your Name:"
        ),
        ourFrame.createElement("input", {
          type: "text",
          name: "name",
          class: "input-name",
          placeholder: "what's your name?",
          autocomplete: "off",
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
