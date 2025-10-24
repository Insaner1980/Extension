// Background service worker for Chrome Extension

// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('My Rich Note Taker extension installed');
});

// Listen for keyboard shortcuts
chrome.commands.onCommand.addListener(async (command) => {
  console.log('Command received:', command);

  switch (command) {
    case 'open-dashboard':
      await openOrFocusDashboard();
      break;
    default:
      console.log('Unknown command:', command);
  }
});

/**
 * Opens the dashboard in a new tab, or focuses it if already open
 */
async function openOrFocusDashboard(): Promise<void> {
  try {
    const dashboardUrl = chrome.runtime.getURL('dashboard.html');

    // Query all tabs to find if dashboard is already open
    const tabs = await chrome.tabs.query({});

    // Look for an existing dashboard tab
    const existingTab = tabs.find(tab => tab.url === dashboardUrl);

    if (existingTab && existingTab.id) {
      // Dashboard tab exists - focus it
      await chrome.tabs.update(existingTab.id, { active: true });

      // Also focus the window containing this tab
      if (existingTab.windowId) {
        await chrome.windows.update(existingTab.windowId, { focused: true });
      }

      console.log('Focused existing dashboard tab');
    } else {
      // Dashboard tab doesn't exist - create a new one
      await chrome.tabs.create({ url: dashboardUrl });
      console.log('Created new dashboard tab');
    }
  } catch (error) {
    console.error('Error opening dashboard:', error);
  }
}

// Optional: Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log('Message received:', message);

  if (message.action === 'open-dashboard') {
    openOrFocusDashboard().then(() => {
      sendResponse({ success: true });
    });
    return true; // Keep the message channel open for async response
  }

  return false;
});
