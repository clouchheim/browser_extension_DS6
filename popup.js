function sendMessage (selectedText, simplifiedText) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, 
      {
        action: "triggerFunction", 
        selectedText: selectedText, 
        simplifiedText: simplifiedText
      }, 
      function(response) {
        if (response) {

          // can handel the content.js stuff here

          console.log(response.result);
      }
    });
  });
}

document.getElementById("summarizeBtn").addEventListener("click", () => {
  
  document.getElementById("instructions").style.display = "none"; // hide instructions
  const summaryDiv = document.getElementById("summary"); // show summary box
  summaryDiv.style.display = "block";
  summaryDiv.innerText = "Summarizing...";

  const selectedFormat = document.getElementById("summaryFormat").value; // the custom summarization choice

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        function: getSelectedText
      },
      async (results) => {
        const selectedText = results[0]?.result || "No text selected.";

        const config = await fetch(chrome.runtime.getURL("config.json")).then(res => 
          res.json()
        );
        const apikey = config.API_KEY; // make your own config for this, from groq not openai
        
        let prompt = "";
        switch (selectedFormat) {
          case "two_sentences":
            prompt = `Give me a two sentence summary of this text. 
                      Be sure to cover all important information.
                      Do not include the prompt in the output:\n\n${selectedText}`;
            break;
          case "bullets":
            prompt = `Summarize this text into 3 concise bullet points 
                      that cover all key ideas. Do not include the prompt in
                      the output:\n\n${selectedText}`;
            break;
          default:
            prompt = `Give me a two sentence summary of this text. 
            Be sure to cover all important information.
            Do not include the prompt in the output:\n\n${selectedText}`;
        }

        const bodyinfo = {
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 1,
        };

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