//// @ts-check

// Default to using "browser" as our global namespace
// @ts-ignore
globalThis.browser ??= chrome;

startHeartbeat();

browser.action.onClicked.addListener(() => {
  log("browser.action.onClicked event")();
  focusOrCreateConsolePage();
});

async function getOpenConsolePage() {
  return browser.tabs.query({
    url: getConsolePageURL(),
  });
}

function getConsolePageURL() {
  return browser.runtime.getURL("console/index.html");
}

async function focusOrCreateConsolePage() {
  const [consoleTab] = await getOpenConsolePage();

  if (!consoleTab) {
    // The console page isn't already open, let's open it
    return browser.tabs.create({ url: getConsolePageURL() });
  } else {
    // At least one logger page is open; switch the focus & active state to the
    // first matching tab.
    return Promise.all([
      browser.windows.update(consoleTab.windowId, { focused: true }),
      browser.tabs.update(consoleTab.id, { active: true }),
    ]).then(() => consoleTab);
  }
}
