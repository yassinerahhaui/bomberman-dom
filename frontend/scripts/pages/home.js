import { ourFrame } from "../../../framework/dom.js";
import { router } from "../main.js";
const Home = () => {
  const HandleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get("name").trim();

    if (!name) {
      e.target.reset();
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/checkname', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ name })
      });

      if (!response.ok) {
        const data = await response.json();
        console.error(data.message || "Name check failed");
        return;
      }

      // If name is OK, create WebSocket and send name
      const ws = new WebSocket(`ws://localhost:8000`);
      ws.addEventListener("open", () => {
        ws.send(JSON.stringify({ type: "username", name }));
      });
      ws.addEventListener("message", (e) => {
        const data = JSON.parse(e.data);
        console.log(data);
        // handle server response here (redirect, show error, etc.)
      });

      // e.target.reset();
      router.navigate("/game")
    } catch (error) {
      console.error('Error checking name:', error);
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
