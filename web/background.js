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
                const promise1 = Promise.resolve(response.json());
                promise1.then((res) => {
                  // 0 history, 1 bio, 2 cs

                  const vals = res[0];

                  console.log("vals", vals);

                  for (let i = 0; i < vals.groups.length; i++) {
                    //console.log("vals.groups[i].tabs", vals.groups[i].tabs);

                    const tabIds = [];

                    vals.groups[i].tabs.forEach((tab) => {
                      tabIds.push(parseInt(tab.id));
                    });

                    for (let j = 0; j < tabIds.length; j++) {
                      chrome.tabs.get(tabIds[j], (tab) => {
                        console.log(tab.id);
                        if (chrome.runtime.lastError) {
                          tabIds.splice(tab.id, 1);
                        }
                      });
                    }

                    console.log(i, tabIds);

                    if (i === 0) {
                      chrome.tabGroups.query({ title: "History" }, (group) => {
                        if (group !== []) {
                          chrome.tabs.group({ tabIds: tabIds });
                        } else {
                          chrome.tabs.group({
                            tabIds: tabIds,
                            groupId: group.id,
                          });
                        }
                      });
                    }

                    if (i === 1) {
                      chrome.tabGroups.query({ title: "Biology" }, (group) => {
                        if (group !== []) {
                          chrome.tabs.group({ tabIds: tabIds });
                        } else {
                          chrome.tabs.group({
                            tabIds: tabIds,
                            groupId: group.id,
                          });
                        }
                      });
                    }

                    if (i === 2) {
                      chrome.tabGroups.query(
                        { title: "Computer Science" },
                        (group) => {
                          if (group !== []) {
                            chrome.tabs.group({ tabIds: tabIds });
                          } else {
                            chrome.tabs.group({
                              tabIds: tabIds,
                              groupId: group.id,
                            });
                          }
                        }
                      );
                    }
                  }
                });

                if (!response.ok) {
                  throw new Error("Network response was not ok");
                }
              })
              .then((res) => {})
              .catch((error) => {
                console.error("Error:", error);
              });
          }
        });
    }

    console.log("final", final);
  });
}, 5000);
