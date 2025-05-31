import { addNode } from "./dom.js"


export function PageNotFound() {

    return {
        type: "div",
        props: {class: "err-container"},
        children: [
            addNode("div",{class: "content-box"},[
                addNode("h3",{class:"err-msg"},["404 Page Not Found!"]),
                addNode("a",{href: "/", class: "err-link"}, ["back to home!"])
            ])
        ]
    }
}