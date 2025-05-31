const ws = new WebSocket('ws://localhost:8000')

ws.addEventListener("open", (e)=> {
    console.log("connection opened!");
})

ws.addEventListener('message',(e)=> {
    console.log(e.data);
})

ws.addEventListener('error',(e)=> {
    console.log("websocket error!");
})

ws.addEventListener('close',(e)=> {
    console.log("websocket closed!");
})