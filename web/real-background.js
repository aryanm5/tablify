// https://cdn.jsdelivr.net/npm/readability-js@1.0.7/src/readability.min.js

chrome.windows.getCurrent((window) => {
  const windowId = window.id;
  const uuid = generateUUID();
  console.log(`Window ID: ${windowId}-${uuid}`);
});

const collected = [];

const final = [];

const windows = [];

chrome.tabs.query({}, function (tabs) {
  console.log("tabinfo", tabs);

  const functionToExecute = (id) => {
    //const text = document.body.innerText;

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

  const strings = [];

  for (var i = 0; i < tabs.length; i++) {
    const uuid = generateUUID();
    const id = `${tabs[i].windowId}`;
    const title = tabs[i].title;
    chrome.scripting
      .executeScript({
        target: { tabId: tabs[i].id },
        function: functionToExecute,
        args: [id],
      })
      .then((results) => {
        console.log("thing", results[0].result);
        const strippedString = results[0].result.replace(/[\n\r]/g, "");
        strings.push(strippedString);

        let flag = false;

        for (let j = 0; j < windows.length; j++) {
          if (id.substring(0, 8) === windows[j].substring(0, 8)) {
            flag = true;
          }
        }

        if (!flag) {
          windows.push(id);
        }

        collected.push([strippedString, id, title]);

        console.log(i);
        console.log(tabs.length);

        if (i === tabs.length) {
          console.log("collected", collected);
          windows.forEach(() => console.log("aryan"));
          console.log(JSON.stringify(windows));

          console.log("windowlen", windows.length);
          console.log("windows", windows);

          final.length = 0;

          for (let k = 0; k < windows.length; k++) {
            console.log("wink", JSON.stringify(windows[k]));
            console.log("loop in");
            final.push({ id: windows[k], tabs: [] });
            console.log("final", JSON.stringify(final));
            for (let n = 0; n < tabs.length; n++) {
              console.log("tabinfo", tabs);
              const tabID = tabs[n].id;
              final.map((win) => {
                console.log("from final", win.id.substring(0, 9));
                console.log("from tab", tabs[n].windowId);
                if (win.id.substring(0, 9) == tabs[n].windowId) {
                  //id from final object matches tab id?

                  console.log("yes!");

                  let selectedText = "";
                  let tabTitle = "";

                  collected.forEach((tab) => {
                    if (tab[1] == win.id) {
                      selectedText = tab[0];
                      tabTitle = tab[2];
                    }
                  });

                  const uuid = generateUUID();

                  win.tabs.push({
                    id: tabID,
                    content: selectedText,
                    title: tabTitle,
                  });
                  return win;
                }
              });
            }
            console.log("final", JSON.stringify(final));
          }

          console.log("windowsdownhere", windows);

          setInterval(function () {
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
          }, 5000);

          setInterval(function () {
            fetch(
              `https://api.mittaldev.com/tablify-dev/fetchGroups?windows=${JSON.stringify(
                windows
              )}`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                },
              }
            )
              .then((response) => {
                response.json().then(function (json) {
                  //console.log("JSON: " + JSON.stringify(json));

                  let data = JSON.parse(JSON.stringify(json));
                  data.forEach((window) => {
                    window.groups.forEach((group) => {
                      let tabIds = group.tabs.map((t) => t.id);
                      console.log(`tabIds: ${tabIds}`);
                      console.log(`tabs: ${tabs[0].id}`);
                      chrome.tabs.group(
                        {
                          //groupId: group.id,
                          tabIds: tabIds,
                        },
                        function () {
                          console.log("Tabs moved to new group");
                        }
                      );
                    });
                  });
                });

                if (response.ok) {
                  //return response.json();
                } else {
                  throw new Error("Network response was not ok");
                }
              })
              .then(() => {})
              .catch((error) => {
                console.error("Error:", error);
              });
          }, 6000);
        }
      });
  }
});



