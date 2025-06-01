import { addNode } from "../../../framework/dom.js";

const Home = () => {
    const HandleSubmit = (e) => {
        e.preventDefault()
        const formData = new FormData(e.target)
    }
  return addNode("main", { class: "main" }, [
    addNode("h1", { class: "home-title" }, ["BOMBERMAN-DOM"]),
    addNode("div", { class: "home-card" }, [
      addNode("h3", { class: "home-card-title" }, ["Enter your name."]),
      addNode("form", { method: "POST", class: "home-card-form", onsubmit: (e)=> HandleSubmit }, [
        addNode('input',{
            type: 'text',
            name: 'name',
            placeholder: 'what\'s your name?'
        }),
        addNode('button', {
            type:'submit',
            class: 'home-submit-btn'
        },['submit'])
      ]),
    ]),
  ]);
};

export { Home };
