const collected = [];
const windowIDS = [];
const final = [];

const scrapeData = () => {
  const mainTextElements = document.querySelectorAll(
    "p, h1, h2, h3, h4, h5, h6"
  );
  const mainText = Array.from(mainTextElements)
    .map((element) => element.textContent)
    .join("\n");

  const chunks = mainText.split(/\n{2,}|\r{2,}|\r\n{2,}/);
  let largestChunk = "";
  let chunk = "";

  for (let i = 0; i < chunks.length; i++) {
    chunk = chunks[i].trim();
    if (chunk.length > largestChunk.length) {
      largestChunk = chunk;
    }
  }

  let inter = largestChunk;
  let newString = inter.replace(/['"]/g, "");
  return newString;
};

/*

[
{id, tabs: [Tab]}
]

Tab: {
	id, content, title
}


*/

chrome.tabs.query({}, (tabs) => {
  tabs.forEach((tab) => {
    if (!windowIDS.includes(tab.windowId)) {
      windowIDS.push(tab.windowId);
    }

    chrome.scripting
      .executeScript({
        target: { tabId: tab.id },
        function: scrapeData,
      })
      .then((res) => {
        const smoothWebsiteText = res[0].result.replace(/[\n\r]/g, "");
        collected.push({
          id: tab.id,
          content: smoothWebsiteText,
          title: tab.title,
          windowID: tab.windowId,
        });
      });
  });

  windowIDS.forEach((windowID) => {
    final.push({ id: windowID, tabs: [] });
  });

  console.log("final", JSON.stringify(final));

  console.log("jsoncollected", JSON.stringify(collected));

  console.log("collected", collected);
});

/*

  final.map((window) => {
    console.log("windowid", window.id);
    collected.forEach((tab) => {
      console.log("tabWindowID", tab.windowiD);
      console.log("inboth");
      if (tab.windowID == window.id) {
        window.tabs.push({
          id: tab.id,
          content: tab.content,
          title: tab.title,
        });
      }
    });

    return window;
  });

*/
