const scrapeData = async (tabURL) => {
  const url = `https://tldr-text-analysis.p.rapidapi.com/summarize/?text=${tabURL}&max_sentences=15`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": "a59c5eb4e0msh3d352fe13ead54bp10bed5jsnb62886024135",
      "X-RapidAPI-Host": "tldr-text-analysis.p.rapidapi.com",
    },
  });

  const data = await response.json();

  console.log("resolvedpromisefinally", data.summary);
  return data.summary;
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
          args: [tabs[i].url],
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
                        if (chrome.runtime.lastError) {
                          tabIds.splice(tab.id, 1);
                        }
                      });
                    }

                    console.log(i, tabIds);

                    if (i === 0) {
                      console.log("i is 0");
                      chrome.tabGroups.query(
                        { title: "History" },
                        (TabGroup) => {
                          console.log(TabGroup);
                          if (JSON.stringify(TabGroup) !== JSON.stringify([])) {
                            chrome.tabs.group({
                              tabIds: tabIds,
                              groupId: TabGroup[0].id,
                            });
                          } else {
                            chrome.tabs.group(
                              {
                                tabIds: tabIds,
                              },
                              (groupId) => {
                                chrome.tabGroups.update(groupId, {
                                  title: "History",
                                  color: "blue",
                                  collapsed: true,
                                });
                              }
                            );
                          }
                        }
                      );
                    }

                    if (i === 1) {
                      console.log("i is 1");
                      chrome.tabGroups.query(
                        { title: "Biology" },
                        (TabGroup) => {
                          console.log(TabGroup);
                          if (JSON.stringify(TabGroup) !== JSON.stringify([])) {
                            chrome.tabs.group({
                              tabIds: tabIds,
                              groupId: TabGroup[0].id,
                            });
                          } else {
                            chrome.tabs.group(
                              {
                                tabIds: tabIds,
                              },
                              (groupId) => {
                                chrome.tabGroups.update(groupId, {
                                  title: "Biology",
                                  color: "red",
                                  collapsed: true,
                                });
                              }
                            );
                          }
                        }
                      );
                    }

                    if (i === 2) {
                      console.log("i is 2");
                      chrome.tabGroups.query(
                        { title: "Computer Science" },
                        (TabGroup) => {
                          console.log(TabGroup);
                          if (JSON.stringify(TabGroup) !== JSON.stringify([])) {
                            chrome.tabs.group({
                              tabIds: tabIds,
                              groupId: TabGroup[0].id,
                            });
                          } else {
                            chrome.tabs.group(
                              {
                                tabIds: tabIds,
                              },
                              (groupId) => {
                                chrome.tabGroups.update(groupId, {
                                  title: "Computer Science",
                                  color: "green",
                                  collapsed: true,
                                });
                              }
                            );
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
