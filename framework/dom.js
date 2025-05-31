// this function create a virtual node element
const addNode = (type, props = {}, children = []) => {
  if (typeof type == "function") {
    return type(props, children);
  }
  return { type, props, children };
};

// this function create real dom tree from a virtual dom tree
const createDom = (vdom) => {
  const el = document.createElement(vdom.type);

  if (vdom.props) {
    for (const [key, value] of Object.entries(vdom.props)) {
      if (key.startsWith("on") && typeof value == "function") {
        el[key] = null;
        el[key] = value;
      } else {
        el.setAttribute(key, value);
      }
    }
  }
  if (vdom.children) {
    for (const child of vdom.children) {
      if (typeof child == "number" || typeof child == "string") {
        el.appendChild(document.createTextNode(child));
      } else {
        const childDom = createDom(child);
        el.appendChild(childDom);
      }
    }
  }
  return el;
};

const patch = (parent, oldNode, newNode, index = 0) => {
  if (!oldNode) {
    parent.appendChild(createDom(newNode));
  } else if (
    typeof oldNode == "string" &&
    typeof newNode == "string" &&
    oldNode != newNode
  ) {
    parent.replaceChild(
      document.createTextNode(newNode),
      parent.childNodes[index]
    );
  } else if (!newNode) {
    parent.removeChild(parent.childNodes[index]);
  } else if (oldNode.type != newNode.type) {
    parent.replaceChild(createDom(newNode), parent.childNodes[index]);
  } else if (JSON.stringify(oldNode.props) !== JSON.stringify(newNode.props)) {
    parent.replaceChild(createDom(newNode), parent.childNodes[index]);
  } else if (newNode.type) {
    const oldLen = oldNode.children.length;
    const newLen = newNode.children.length;

    for (let i = 0; i < oldLen || i < newLen; i++) {
      if (parent.childNodes[index]) {
        patch(
          parent.childNodes[index],
          oldNode.children[i],
          newNode.children[i],
          i
        );
      }
    }
  }
};

const setElClass = (id, classes) =>
  (document.querySelector(id).classList = classes);
const selectEl = (tag) => document.querySelector(tag);

export { addNode, createDom, patch, setElClass, selectEl };
