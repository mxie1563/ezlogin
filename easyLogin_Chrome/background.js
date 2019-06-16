chrome.runtime.onMessage.addListener(function (msg, sender) {
  // First, validate the message's structure
  if ((msg.from === 'content') && (msg.subject === 'showPageAction')) {
    // Enable the page-action for the requesting tab
    chrome.pageAction.show(sender.tab.id);
  }
});

function rotateImages() {
    alert("asdasdasda");
}
//setInterval(rotateImages, 4000);

function tabClose(tab) 
{
    setTimeout(function() {
      chrome.tabs.remove(tab.id);
    },3000);
};

var ws;

function openSocket() {
  ws = new WebSocket("wss://www.promotogether.com:9001/op/websocket");

  ws.onopen = function() {
    //chrome.browserAction.setIcon({ "path": "icon_blue.png" });
    chrome.browserAction.setBadgeText({ "text": "" });
  };

  ws.onmessage = function(e) {
    alert(e.data);
    var data = JSON.parse(e.data)
    chrome.tabs.create({ url: data.url }, tabClose);
    //var notify = new Notification( 
    //"着信",
    //e.data
    //);
    //notify.show();

    //setTimeout(function() {
    //  notify.cancel();
    //},3000);
  };

  ws.onclose = function(e) {
    ws = undefined;

    //chrome.browserAction.setIcon({ "path": "icon_red.png" });
    chrome.browserAction.setBadgeText({ "text": "!" });
  };
}

openSocket();

