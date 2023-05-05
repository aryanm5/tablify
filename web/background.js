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
  let windowIDS = [];

  chrome.windows.getAll({ populate: false }, (windows) => {
    windows.forEach((window) => {
      final.push({ id: window.id.toString(), tabs: [] });
      windowIDS.push(window.id.toString());
    });
  });

  console.log("windowids", windowIDS);

  chrome.tabs.query({}, (tabs) => {
    for (let i = 0; i < tabs.length; i++) {
      chrome.scripting
        .executeScript({
          target: { tabId: tabs[i].id },
          function: scrapeData,
        })
        .then((res) => {
          const smoothWebsiteText = res[0].result.replace(/[\n\r]/g, "");
          final.forEach((window) => {
            if (tabs[i].windowId == window.id) {
              window.tabs.push({
                id: tabs[i].id.toString(),
                content: smoothWebsiteText,
                title: tabs[i].title,
              });
            }
          });
          if (i == tabs.length - 1) {
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
                  console.log(response);
                }
              })
              .then((data) => {
                console.log(data);
              })
              .catch((error) => {
                console.error("Error:", error);
              });

            fetch(
              `https://api.mittaldev.com/tablify-dev/fetchGroups?windows=${JSON.stringify(
                windowIDS
              )}`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                },
              }
            )
              .then((response) => {
                console.log(response.json());
                if (response.ok) {
                  console.log("fetching back from database was good");
                } else {
                  throw new Error("Network response was not ok");
                }
              })
              .then(() => {})
              .catch((error) => {
                console.error("Error:", error);
              });
          }
        });
    }

    console.log("final", final);
  });
}, 5000);
