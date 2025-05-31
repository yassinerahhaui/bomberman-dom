import { router } from "../src/main.js"
let states = [];
let count = 0;

const resetCount = () => count = 0;
const reset = () => {
  resetCount()
}

function useState(initialState) {
  if (typeof states[count] == "undefined") {
    states[count] = initialState;
  }
  const index = count;
  // let state = states[index];

  const setState = (newValue) => {
    if (typeof newValue == "function") {
      states[index] = newValue(states[index])
    } else {
      states[index] = newValue;
    }
        
    router.rerender()
  };
  count++;
  return [states[index], setState];
};



export { useState, reset };
