/******************** element creation and event handling *****************/
export function diff(oldTree, newTree) {
  return function applyPatches(dom) {
    if (!dom) {
      console.warn("DOM element is null or undefined");
      return;
    }

    if (!oldTree) {
      return dom.appendChild(createElement(newTree));
    }

    if (!newTree) {
      if (dom instanceof Node && dom.parentNode) {
        dom.parentNode.removeChild(dom);
        return null;
      } else {
        console.warn("don't remove it if is note node or doesn't exist blan:", dom);
        return;
      }
    }

    if (oldTree.type !== newTree.type) {
      const newDom = createElement(newTree);
      if (dom.parentNode) {
        dom.parentNode.replaceChild(newDom, dom);
      }
      return newDom;
    }

    if (newTree.type === "TEXT_ELEMENT") {
      if (dom.nodeType === Node.TEXT_NODE &&
        oldTree.props.nodeValue !== newTree.props.nodeValue) {
        dom.nodeValue = newTree.props.nodeValue;
      }
      return dom;
    }

    // update properties
    updateProps(dom, oldTree.props, newTree.props);

    const oldChildren = oldTree.props.children || [];
    const newChildren = newTree.props.children || [];

    const maxLength = Math.max(oldChildren.length, newChildren.length);
    const removedIndices = new Set();

    for (let i = 0; i < maxLength; i++) {
      if (i < oldChildren.length && i < newChildren.length) {
        // Update existing node
        if (i < dom.childNodes.length && !removedIndices.has(i)) {
          diff(oldChildren[i], newChildren[i])(dom.childNodes[i]);
        } else {
          dom.appendChild(createElement(newChildren[i]));
        }
      } else if (i < newChildren.length) {
        dom.appendChild(createElement(newChildren[i]));
      } else if (i < oldChildren.length) {
        // Remove old node if it exists
        const childIndex = i - removedIndices.size;
        if (childIndex < dom.childNodes.length) {
          dom.removeChild(dom.childNodes[childIndex]);
          removedIndices.add(i);
        }
      }
    }
    
    return dom;
  };
}

// Fix 2: Tslih f updateProps function - mochkil dyal events
function updateProps(dom, oldProps, newProps) {
  // Ta3amel m3a dom._listeners li kayna bach njiw events
  if (!dom._listeners) dom._listeners = {};

  // Add or update props
  for (const key in newProps) {
    if (key === "children") continue;

    if (oldProps[key] !== newProps[key]) {
      if (key.startsWith("on") && typeof newProps[key] === "function") {
        const eventType = key.toLowerCase().substring(2);

        // Removiw ay lisneres ila
        if (dom._listeners[eventType]) {
          dom.removeEventListener(eventType, dom._listeners[eventType]);
        }

        // Add new listener
        dom.addEventListener(eventType, newProps[key]);
        dom._listeners[eventType] = newProps[key];
      } else if (key === "value" || key === "checked") {
        dom[key] = newProps[key];
      } else {
        dom.setAttribute(key, newProps[key]);
      }
    }
  }

  // Remove old props
  for (const key in oldProps) {
    if (key === "children") continue;
    if (!(key in newProps)) {
      if (key.startsWith("on") && dom._listeners) {
        const eventType = key.toLowerCase().substring(2);
        if (dom._listeners[eventType]) {
          dom.removeEventListener(eventType, dom._listeners[eventType]);
          delete dom._listeners[eventType];
        }
      } else {
        dom.removeAttribute(key);
      }
    }
  }
}

// Fix 3: Tslih dyal createElement - kaykhasshna nkhedmo b _listeners
export function createElement(vNode) {
  if (!vNode) return null;

  if (vNode.type === "TEXT_ELEMENT") {
    return document.createTextNode(vNode.props.nodeValue);
  }

  const element = document.createElement(vNode.type);
  element._listeners = {}; // Add _listeners object

  // Set properties
  for (const key in vNode.props) {
    if (key === "children") continue;

    const value = vNode.props[key];
    if (key.startsWith("on") && typeof value === "function") {
      const eventType = key.toLowerCase().substring(2);
      element.addEventListener(eventType, value);
      element._listeners[eventType] = value;
    } else if (key === "value" || key === "checked") {
      element[key] = value;
    } else {
      element.setAttribute(key, value);
    }
  }

  // Create and append children
  (vNode.props.children || []).forEach((child) => {
    const childElement = createElement(child);
    if (childElement) {
      element.appendChild(childElement);
    }
  });

  return element;
}


export function patch(container, oldTree, newTree) {
  if (!container) {
    console.warn("container is null or undefined");
    return;
  }
  const patchFn = diff(oldTree, newTree);
  patchFn(container.firstChild || container);
}

// Function to create elements (same as before)
function createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

function createVElement(type, props = {}, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === "object" ? child : createTextElement(child)
      ),
    },
  };
}

/********************* rendering logic **********************/
function render(element, container) {
  const dom = createElement(element);
  container.appendChild(dom);
  return dom;
}

export const ourFrame = {
  createElement: createVElement,
  render,
  patch,
};
