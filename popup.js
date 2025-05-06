document.getElementById("summarizeBtn").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          function: getSelectedText
        },
        (results) => {
          const selectedText = results[0]?.result || "No text selected.";
          document.getElementById("summary").innerText = selectedText;
        }
      );
    });
  });
  
  function getSelectedText() {
    return window.getSelection().toString();
  }
  