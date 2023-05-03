chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message === "getMainText") {
    const mainText = document.body.innerText;
    sendResponse(mainText);
  }
});
