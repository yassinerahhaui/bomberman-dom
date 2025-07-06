import { ourFrame } from "../../../framework/dom.js"
import { router, ws } from "../main.js"
import { state } from "../../../framework/state.js";


const AttendPage = () => {
    if (!ws) {
        return ourFrame.createElement(null, null, null)
    }
    const [playerCount, setPlayerCount] = state.useState(1);
    const [playerNames, setPlayerNames] = state.useState([]);
    const [mainTimeLeft, setMainTimeLeft] = state.useState(20);
    const [readyTimeLeft, setReadyTimeLeft] = state.useState(10);
    const [mainTimerStarted, setMainTimerStarted] = state.useState(false);
    const [readyTimerStarted, setReadyTimerStarted] = state.useState(false);
    const [gameStarted, setGameStarted] = state.useState(false);

    // Chat state
    const [chatMessages, setChatMessages] = state.useState([]);
    const [chatInput, setChatInput] = state.useState("");

    ws.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (data.type === "room_state") {
            setPlayerCount(data.playerCount);
            setPlayerNames(data.playerNames);
            setMainTimeLeft(data.mainTimeLeft);
            setReadyTimeLeft(data.readyTimeLeft);
            setMainTimerStarted(data.mainTimerStarted);
            setReadyTimerStarted(data.readyTimerStarted);
            setGameStarted(data.gameStarted);

        } else if (data.type === "chat") {
            console.log(data.playerId);
            console.log(ws.playerId);

            if (data.text.length < 255 && data.text.length > 0) {
                setChatMessages(msgs => [...msgs, { name: data.name, playerId: data.playerId, text: data.text }]);
            }
        }
    }

    let statusText = "";
    if (gameStarted) {
        statusText = "Game starting!";
        router.navigate("/game")
    } else if (readyTimerStarted) {
        statusText = `Get ready! Game starts in ${readyTimeLeft}s`;
    } else if (mainTimerStarted) {
        statusText = `Waiting for players: ${playerCount}/4 (${mainTimeLeft}s left)`;
    } else {
        statusText = `Waiting for players: ${playerCount}/4`;
    }

    // Chat input handler
    function handleChatInput(e) {
        setChatInput(e.target.value);
    }

    function handleChatSend(e) {
        e.preventDefault();
        if (chatInput.trim() && ws) {
            ws.send(JSON.stringify({ type: "chat", text: chatInput.trim() }));
            setChatInput("");
        }
    }

    return ourFrame.createElement(
        "main",
        { class: "main" },
        ourFrame.createElement("div", { class: "title" },
            ourFrame.createElement("h1", { class: "title1" }, "Waiting Room"),
            ourFrame.createElement("img", {
                src: "/frontend/assets/bomb.png",
                class: "bomb-logo"
            }),
        ),
        ourFrame.createElement(
            "div",
            { class: "card attend-card" },
            ourFrame.createElement("div", { class: "attend-status" }, statusText),
            ourFrame.createElement(
                "ul",
                { class: "attend-list" },
                ...playerNames.map(name =>
                    ourFrame.createElement("li", { class: "attend-player" }, name)
                )
            ),
            // --- Chat Section ---
            ourFrame.createElement(
                "div",
                { class: "chat-section" },
                ourFrame.createElement("h2", null, "Room Chat"),
                ourFrame.createElement(
                    "div",
                    { class: "chat-messages" },
                    ...chatMessages.map(msg =>
                        ourFrame.createElement(
                            "div",
                            {
                                class: `chat-message ${msg.playerId === ws.playerId ? "sent" : "received"}`

                            },
                            ourFrame.createElement("span", { class: "chat-author" }, msg.playerId === ws.playerId ? "You" : msg.name),
                            ourFrame.createElement("span", { class: "chat-text" }, msg.text)
                        )
                    )
                ),
                ourFrame.createElement(
                    "form",
                    {
                        class: "chat-form",
                        onsubmit: handleChatSend,
                    },
                    ourFrame.createElement("input", {
                        type: "text",
                        value: chatInput,
                        oninput: handleChatInput,
                        placeholder: "Type a message...",
                        class: "chat-input"
                    }),
                    ourFrame.createElement("button", { type: "submit", class: "chat-send-btn" }, "Send")
                )
            )
        )
    );

};

export default AttendPage;