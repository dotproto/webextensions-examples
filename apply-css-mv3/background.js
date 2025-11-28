// Minimal shim to make the browser global work in Chromium
self.browser ??= self.chrome;

const TITLE = {
  off: 'Apply CSS',
  on: 'Remove CSS',
}
const APPLICABLE_PROTOCOLS = [ 'http:', 'https:' ];

/**
 * Toggle CSS: based on the current title, insert or remove the CSS.
 * Update the page action's title and icon to reflect its state.
 */
async function toggleCSS(tab) {
  const tabId = tab.id;
  const title = await browser.pageAction.getTitle({ tabId });

  if (title === TITLE.on) {
    updatePageAction(tabId, 'on');
    browser.scripting.insertCSS({ target: { tabId }, files: ['style.css'] });
  } else {
    updatePageAction(tabId, 'off');
    browser.scripting.removeCSS({ target: { tabId }, files: ['style.css'] });
  }
}

/**
 * Set the page action's icon and title based on it's current state.
 * - 'off' (default): our custom CSS is not currently applied to the page
 * - 'on': our custom CSS is on the page
 */
function updatePageAction(tabId, state = 'off') {
  if (!(state === 'on' || state === 'off') ) {
    throw new Error(`Unexpected state value '${state}'. Must be one of: ${Object.keys(TITLE).join(', ')}`);
  }

  browser.pageAction.setIcon({ tabId, path: `icons/${state}.svg` });
  browser.pageAction.setTitle({ tabId, title: TITLE[state] });
}

/**
 * Returns true only if the URL's protocol is in APPLICABLE_PROTOCOLS.
 * Argument url must be a valid URL string.
 */
function protocolIsApplicable(url) {
  const protocol = new URL(url).protocol;
  return APPLICABLE_PROTOCOLS.includes(protocol);
}

/**
 * Initialize the page action: set icon and title, then show.
 * Only operates on tabs whose URL's protocol is applicable.
 */
function initializePageAction(tab) {
  if (protocolIsApplicable(tab.url)) {
    updatePageAction(tab.id, 'off');
    browser.pageAction.show(tab.id);
  }
}

/**
 * When first loaded, initialize the page action for all tabs.
 */
let gettingAllTabs = browser.tabs.query({});
gettingAllTabs.then((tabs) => {
  for (let tab of tabs) {
    initializePageAction(tab);
  }
});

/**
 * Each time a tab is updated, reset the page action for that tab.
 */
browser.tabs.onUpdated.addListener((_id, _changeInfo, tab) => initializePageAction(tab) );

/**
 * Toggle CSS when the page action is clicked.
 */
browser.pageAction.onClicked.addListener(toggleCSS);
