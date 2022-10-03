const { exec } = require("child_process");

/**
 * function: traversal all inner dom nodes
 * @param _dom
 * @param domCallback
 * @returns {[]}
 */
function traversal(_dom, domCallback) {
  const result = [];
  const dom = _dom.children;
  (function _inner(dom) {
    const len = dom.length;
    let d = null;
    for (let i = 0; i < len; i++) {
      d = dom[i];
      result.push(d);
      domCallback && domCallback(d);
      if (d.children) {
        _inner(d.children);
      }
    }
  })(dom);
  return result;
}

/**
 * exec shell commands
 * @param command
 * @returns {Promise<unknown>}
 */
function execCommand(command) {
  return new Promise((resolve, reject) =>
    exec(command, (error, stdout, stderr) => {
      const _error = error || stderr;
      if (_error) {
        console.error(`exec error: ${_error}`);
        reject(_error);
        return;
      }
      console.log(`stdout: ${stdout}`);
      resolve(stdout);
    })
  );
}

function removeIllegalAttributes(dom) {
  let attributes = dom.getAttributeNames();
  for (let i = 0, len = attributes.length; i < len; i++) {
    let attribute = attributes[i];
    if (attribute === '"') {
      dom.removeAttribute(attribute);
    }
  }
}

/**
 * function: remove command from a DOM element
 * @param dom
 */
const removeComment = (dom) => {
  dom.childNodes.forEach((node) => {
    if (node.constructor.name.toLowerCase() === "comment") {
      node.remove();
    }
  });
};

module.exports = { traversal, execCommand, removeComment, removeIllegalAttributes };
