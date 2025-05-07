function sendMessage (selectedText, simplifiedText) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {action: "triggerFunction", selectedText: selectedText, simplifiedText: simplifiedText}, function(response) {
      if (response) {
        // Handle the response from content.js (optional)
        console.log(response.result);
      }
    });
  });
}

document.getElementById("summarizeBtn").addEventListener("click", () => {
  
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        function: getSelectedText
      },
      async (results) => {
        const selectedText = results[0]?.result || "No text selected.";
        document.getElementById("summary").innerText = 'Summarizing...';
        const bodyinfo = {
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          messages: [
            {
              role: "user",
              content: `Give me a two sentence summary of this text, only output the summary:\n\n${selectedText}`
            }
          ],
          temperature: 1,
        };

        const apikey = "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";

        const headers = {
          "Authorization": `Bearer ${apikey}`,
          "Content-Type": "application/json",
        };

        let summarizedText = "Summary could not be generated.";

        try {
          const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: headers,
            body: JSON.stringify(bodyinfo),
          });

          if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
          }

          const data = await response.json();

          summarizedText = data.choices?.[0]?.message?.content || summarizedText;
        } catch (error) {
          console.error("There has been an error: ", error);
          alert("There has been an error. Check console for details");
        }

        sendMessage(selectedText, summarizedText);

        document.getElementById("summary").innerText = summarizedText;
      }
    );
  });
});

function getSelectedText() {
  return window.getSelection().toString();
}