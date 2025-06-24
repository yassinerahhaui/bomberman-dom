import { ourFrame } from "../../../framework/dom.js"
import { router, ws } from "../main.js"
import { state } from "../../../framework/state.js";


const AttendPage = () => {
    state.resetCursor()
    const [playerCount, setPlayerCount] = state.useState(1);
    const [playerNames, setPlayerNames] = state.useState([]);
    const [mainTimeLeft, setMainTimeLeft] = state.useState(20);
    const [readyTimeLeft, setReadyTimeLeft] = state.useState(10);
    const [mainTimerStarted, setMainTimerStarted] = state.useState(false);
    const [readyTimerStarted, setReadyTimerStarted] = state.useState(false);
    const [gameStarted, setGameStarted] = state.useState(false);

    // Only add the event listener once
    // if (ws.handleMessage) {
    //     ws.removeEventListener("message", ws.handleMessage);
    //     console.log("test");

    // }
    // ws.removeEventListener("message", ws.handleMessage)
    // if (!ws._attendListenerAdded) {
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
        }

    }
    // ws.addEventListener("message", ws.handleMessage);
    // ws._attendListenerAdded = true;
    // }

    let statusText = "";
    if (gameStarted) {
        
        statusText = "Game starting!";
        router.navigate("/game")
        // Optionally redirect to game page here
        // window.location.hash = "#/game";
    } else if (readyTimerStarted) {
        statusText = `Get ready! Game starts in ${readyTimeLeft}s`;
    } else if (mainTimerStarted) {
        statusText = `Waiting for players: ${playerCount}/4 (${mainTimeLeft}s left)`;
    } else {
        statusText = `Waiting for players: ${playerCount}/4`;
    }

    return ourFrame.createElement(
        "main",
        { class: "main" },
        ourFrame.createElement("h1", { class: "title1" }, "Waiting Room"),
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
            )
        )
    );
};

export default AttendPage;