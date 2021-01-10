const net = require("net");

/**
 * function: Determine if the port is occupied
 * @param port
 * @returns {Promise<unknown>}
 */
async function portIsOccupied(port) {
  return new Promise((resolve, reject) => {
    let server = net.createServer().listen(port);
    server.on("listening", function () {
      console.log("The port[" + port + "] is available.");
      server.close();
      resolve(port);
    });
    server.on("error", function (err) {
      if (err.code === "EADDRINUSE") {
        console.log("The port[" + port + "] is occupied, please change other port.");
        reject(err);
      }
    });
  });
}

/**
 * function: use an available port to start an express server
 * @param port
 * @param _portAvailableCallback
 * @returns {Promise<void>}
 */
async function tryUsePort(port = 5001, _portAvailableCallback) {
  try {
    await portIsOccupied(port);
    _portAvailableCallback(port);
  } catch (e) {
    port++;
    await tryUsePort(port, _portAvailableCallback);
  }
}

module.exports = {
  tryUsePort,
};
