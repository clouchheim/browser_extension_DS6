console.log("Testing.js")

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.action == "triggerFunction") {
      // Execute the function
      console.log("Success")
      let result = findAndReplace(request.selectedText, request.simplifiedText);
      sendResponse({result: result}); // Send a response back to popup.js (optional)
    }
  }
);
  
function findAndReplace(selectedText, simplifiedText) {
  // Function logic
  console.log(selectedText);
  
  var pTags = document.getElementsByTagName("p");
  var searchText = selectedText;
  var found;
  var found_text;
  
  for (var i = 0; i < pTags.length; i++) {
    text_content = pTags[i].textContent
    console.log(text_content);
      if (text_content.includes(searchText)) {
          console.log("Found");
          found = pTags[i];
          found_text = found.textContent
          break;
      }
  }

  found_text_start = found_text.slice(0, found_text.indexOf(searchText))
  found_text_end = found_text.slice(found_text.indexOf(searchText) + searchText.length, found_text.length)

  const new_div = document.createElement('div');
  
  const p1 = document.createElement('p');
  p1.textContent = found_text_start;
  new_div.appendChild(p1);

  const p2 = document.createElement('p');
  const mark = document.createElement('mark');
  if (simplifiedText.includes("•")) {
    console.log("bullets");
  }
  simplifiedText = simplifiedText.replaceAll("•", "<br/> •")
  mark.innerHTML = simplifiedText;
  p2.appendChild(mark);
  new_div.appendChild(p2);

  const p3 = document.createElement('p');
  p3.textContent = found_text_end;
  new_div.appendChild(p3);
  
  found.replaceWith(new_div);
  
  return false
}