// This file replaces the default `console.log` API in order to send log
// messages to a "console" view that will stay alive across evented background
// context (event page, service worker) restarts.

const bgConsoleChannel = new BroadcastChannel("bg-console");
/**
 * A logging utility that logs messages to both the browser's console and to the
 * extension's custom console page. To use this function, call the function much
 * like you would a standard `console.log` call, but add an extra pair of
 * parentheses after.
 *
 * The "double execution" pattern seen here is a little unusual. We use it to
 * ensures that statements logged to the browser's console have the file and
 * line numbers that a developer would expect from a logging function. The
 * alternative would be to have the `log()` function directly call
 * `console.log()` itself, but doing so would cause the logged statement to be
 * attributed that call inside `log()` function itself rather than the place
 * where `log()` is called in other files.
 *
 * @example
 * console.log("test");
 * // is equivalent to
 * log("test")();
 */
const log = (...args) => {
  bgConsoleChannel.postMessage({
    type: "log",
    timestamp: Date.now(),
    args: structuredClone(args),
  });

  return console.log.bind(console, ...args);
}

const HEARTBEAT_PERIOD = 1000;
let heartbeatIntervalId;

let startHeartbeatTime;
function startHeartbeat() {
  stopHeartbeat();
  startHeartbeatTime = Date.now();
  sendHeartbeat();
  heartbeatIntervalId = setInterval(sendHeartbeat, HEARTBEAT_PERIOD)
}

function stopHeartbeat() {
  startHeartbeat = 0;
  if (heartbeatIntervalId) {
    clearInterval(heartbeatIntervalId);
  }
}

function sendHeartbeat() {
  const now = Date.now();
  bgConsoleChannel.postMessage({
    type: "heartbeat",
    startTimestamp: startHeartbeat,
    timestamp: now,
    uptime: now - startHeartbeatTime,
  });
}
