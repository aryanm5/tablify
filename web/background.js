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

setInterval(() => {
  const final = [];

  chrome.windows.getAll({ populate: false }, (windows) => {
    windows.forEach((window) => {
      final.push({ id: window.id, tabs: [] });
    });
  });

  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      chrome.scripting
        .executeScript({
          target: { tabId: tab.id },
          function: scrapeData,
        })
        .then((res) => {
          const smoothWebsiteText = res[0].result.replace(/[\n\r]/g, "");
          final.forEach((window) => {
            if (tab.windowId == window.id) {
              window.tabs.push({
                id: tab.id,
                content: smoothWebsiteText,
                title: tab.title,
              });
            }
          });
        });
    });

    console.log("final", final);

    fetch("https://api.mittaldev.com/tablify-dev/updateTabs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        windows: final,
      }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Network response was not ok");
        }
      })
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });
}, 5000);

const pushToDB = (final) => {
  console.log("final received", final);
};
