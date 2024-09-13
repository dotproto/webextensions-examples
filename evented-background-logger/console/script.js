const channel = new BroadcastChannel("bg-console");

const bgConsole = document.querySelector('#console');

const bgStateIndicator = document.getElementById('bg-state');

// Draw the current time to make timestamp comparison easier
const timeEl = document.getElementById("timestamp");
const sharedDateObj = new Date();
function drawTime() {
  sharedDateObj.setTime(Date.now());
  timeEl.firstChild.nodeValue = sharedDateObj.toISOString();
};

let heartbeatUptime = 0;
let heartbeatTimeoutId = 0;
const messageHandlers = {};

messageHandlers.log = (message) => {
  writeToConsole(message.args.join(", "), {
    type: message.type,
    timestamp: message.timestamp,
  });
};


messageHandlers.heartbeat = (data) => {
  heartbeatUptime = data.uptime;

  if (!heartbeatTimeoutId) {
    sharedDateObj.setTime(data.timestamp);
    writeToConsole(`First heartbeat, alive for ${heartbeatUptime / 1000}s`, { type: "info" });
  } else {
    clearTimeout(heartbeatTimeoutId);
  }

  updateRunningState(true);

  heartbeatTimeoutId = setTimeout(() => {
    heartbeatTimeoutId = null;
    writeToConsole(`BG closed, alive for ~${heartbeatUptime / 1000}s`, { type: "info" });
    updateRunningState(false);
  }, 1200);
}


function processMessage(event) {
  if (typeof messageHandlers[event.data.type] === "function") {
    messageHandlers[event.data.type](event.data);
  }
}

channel.addEventListener('message', processMessage);

let previousRunningState = false;
function updateRunningState(runningState) {
  if (runningState) {
    if (!previousRunningState === runningState) {
      bgConsole.style.backgroundColor = "#eee";
      bgStateIndicator.firstChild.nodeValue = "running";
      bgStateIndicator.style.backgroundColor = "green";
    }
  } else {
    bgConsole.style.backgroundColor = "pink";
    bgStateIndicator.firstChild.nodeValue = "stopped";
    bgStateIndicator.style.backgroundColor = "firebrick";
  }
  previousRunningState = runningState;
}

/**
 * @param {object} options
 * @param {string} options.type
 * @param {number} options.timestamp
 * @param {string} options.message
 */
function writeToConsole(message, {type = 'default', timestamp = Date.now()} = {}) {
  sharedDateObj.setTime(timestamp);
  const row = document.createElement("div");
  row.dataset.timestamp = timestamp;
  const logType = `[${type}]`.padEnd(9, " ");
  row.innerText = `${sharedDateObj.toISOString()} ${logType}: ${message}`;

  const insertionPoint = findConsoleInsertionPoint(timestamp);
  if (!insertionPoint) {
    // Either the log is empty or it's populated but there are no messages sent
    // before this one. In either case, the new message will be the first row.
    bgConsole.insertAdjacentElement("afterbegin", row);
  } else {
    insertionPoint.insertAdjacentElement("afterend", row);
  }
}

/** Due to the async nature of message passing, a message may be received after
 * new messages have already been logged. In order to find the correct place to
 * insert, we need to compare this timestamp against the timestamp of previously
 * logged messages. */
function findConsoleInsertionPoint(timestamp) {
  let currentEl = bgConsole.lastChild;
  while (currentEl) {
    if (currentEl?.dataset.timestamp > timestamp) {
      currentEl = currentEl.previousSibling;
    } else {
      return currentEl;
    }
  }
}

drawTime();
setInterval(drawTime, 1000);

updateRunningState(false);
writeToConsole("Console initialized");
