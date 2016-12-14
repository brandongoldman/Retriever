var linksThatAreFiles = [];
var linksOnPage = [];

// once extension is active, begin search for links on page
window.onload = function() 
{
  document.getElementById('selectAllCheckBox').onchange = selectAll;
  document.getElementById('downloadButton').onclick = download;
  chrome.windows.getCurrent(function (currentWindow) 
  {
    chrome.tabs.query({active: true, windowId: currentWindow.id},
    
    // limit extension to current tab
    function(activeTabs) 
    {
    chrome.tabs.executeScript(
        activeTabs[0].id, {file: '/searchForLinks.js', allFrames: true});
    });
  });
};

// Listen to messages from the send_links.js script and write to popout.html
linksOnPage = [];
chrome.extension.onRequest.addListener(function(links) 
{
  for (var index in links) {
    linksOnPage.push(links[index]);
  }
  linksOnPage.sort();

  // check if link is file
  linksThatAreFiles = checkIfFile();
  showLinks();
});


// select all files
function selectAll() 
{
  var checked = document.getElementById('selectAllCheckBox').checked;
  for (var i = 0; i < linksThatAreFiles.length; ++i) 
  {
    document.getElementById('check' + i).checked = checked;
  }
}

// Only return link if link ends with PDF or Word Doc/Docx
function checkIfFile() 
{
  console.log(linksOnPage[0]);
  for (var i =0; i < linksOnPage.length ; i++) 
  {
    if ((linksOnPage[i].substr(linksOnPage[i].length - 4) == '.pdf') ||
        (linksOnPage[i].substr(linksOnPage[i].length - 4) == '.doc') ||
        (linksOnPage[i].substr(linksOnPage[i].length - 5) == '.docx')) {
          linksThatAreFiles.push(linksOnPage[i]);
    }
  }
  return linksThatAreFiles;
}

// Display all visible links in the popup
function showLinks() 
{
  var linksTable = document.getElementById('links');
  while (linksTable.children.length > 1) 
  {
    linksTable.removeChild(linksTable.children[linksTable.children.length - 1])
  }

  for (var i = 0; i < linksThatAreFiles.length; ++i) 
  {
    var row = document.createElement('tr');
    var col0 = document.createElement('td');
    var col1 = document.createElement('td');
    var checkbox = document.createElement('input');
    checkbox.checked = true;
    checkbox.type = 'checkbox';
    checkbox.id = 'check' + i;
    col0.appendChild(checkbox);
    linksTextArray = linksThatAreFiles[i].split("/");
    col1.innerText = linksTextArray[linksTextArray.length - 1];
    col1.style.whiteSpace = 'nowrap';
    col1.onclick = function() 
    {
      checkbox.checked = !checkbox.checked;
    }
    row.appendChild(col0);
    row.appendChild(col1);
    linksTable.appendChild(row);
  }
}

// Download all visible checked links.
function download() 
{
  var numOfDownloads = 0;
  for (var i = 0; i < linksThatAreFiles.length; ++i) 
  {
    if (document.getElementById('check' + i).checked) 
    {
      numOfDownloads = numOfDownloads + 1;

      // call Chrome download function if files exist
      chrome.downloads.download({url: linksThatAreFiles[i]}, function(downloadId) 
      {
        numOfDownloads = numOfDownloads - 1;

        // do not download if no files available
        if (numOfDownloads = 0) 
        {
          window.close()
        }
      });
    }
  }
}