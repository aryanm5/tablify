chrome.tabs.onCreated.addListener(function (tab) {
  console.log("Tab created:", tab.url);
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status === "complete") {
    console.log("Tab updated:", tab.url);
  }
});

chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
  console.log("Tab removed:", removeInfo.url);
});

chrome.tabs.query({}, function (tabs) {
  const functionToExecute = () => {
    return document.body.innerText;
  };
  for (var i = 0; i < tabs.length; i++) {
    chrome.scripting
      .executeScript({
        target: { tabId: tabs[i].id },
        function: functionToExecute,
      })
      .then((results) => {
        console.log(results[0].result);
      })
      .catch((error) => {
        console.error(error);
      });
  }
});

/*
chrome.tabs.onActivated.addListener(moveToFirstPosition);

async function moveToFirstPosition(activeInfo) {
  try {
    await chrome.tabs.move(activeInfo.tabId, { index: 0 });
    console.log("Success.");
  } catch (error) {
    if (
      error ==
      "Error: Tabs cannot be edited right now (user may be dragging a tab)."
    ) {
      setTimeout(() => moveToFirstPosition(activeInfo), 50);
    } else {
      console.error(error);
    }
  }
}
*/

// Listen for messages from the content script

// background.js

/*
// Get the current active tab
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  // Inject the content script into the tab
  const functionToExecute = () => {
    return document.body.innerText;
  };
  chrome.scripting.executeScript(
    {
      target: { tabId: tabs[0].id },
      function: functionToExecute,
    },
    (res) => {
      console.log(res);
    }
  );
});
*/
