let states = [];
let stateCursor = 0;
let rerenderFn = null;
let batchTimeout = null;

function useState(initialValue) {
  const currentIndex = stateCursor;

  if (states[currentIndex] === undefined) {
    states[currentIndex] = initialValue;
  }
  const currentValue = states[currentIndex];

  function setState(newValue) {
    const valueToSet = typeof newValue === "function" ? newValue(states[currentIndex]) : newValue;
    const hasChanged = states[currentIndex] !== valueToSet;

    if (hasChanged) {
      states[currentIndex] = valueToSet;
      if (typeof rerenderFn === "function") {
        if (batchTimeout) clearTimeout(batchTimeout);
        // Schedule rerender for after currenth render completes (batch updates)
        batchTimeout = setTimeout(() => {
          rerenderFn();
        }, 0);
        // }
      } else {
        console.warn("rerender function is not defined");
      }
    }
  }

  stateCursor++; // Move to next state index
  return [currentValue, setState];
}

function resetCursor() {
  stateCursor = 0;
}

export function injectRerender(fn) {
  rerenderFn = fn;
}


export const state = {
  useState,
  resetCursor,
};