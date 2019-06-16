// this tab should have a page-action
chrome.runtime.sendMessage({
  from:    'content',
  subject: 'showPageAction'
});

var portMsg="";
var startURL="";

document.onmousedown = function(evt) {
if (!evt.target && evt.target.tagName==="input") evt.target=evt.srcElement; // extend target property for IE
{
   portMsg = portMsg + "{typ:"+evt.target.type + ", val:"+evt.target.value+"}";
}
}

// Listen for messages from the popup
chrome.runtime.onConnect.addListener(function(port) {
  console.assert(port.name == "raven");
  port.onMessage.addListener(function(msg) {
    document.onmousedown = null;
    if (msg.msg === "Knock knock") {
      startURL = window.location.search.split('startURL=')[1] ? window.location.search.split('startURL=')[1] : '';
      startURL = decodeURIComponent(startURL);
      //console.log("startURL: "+startURL);
      port.postMessage({msg: "whoami", domain: document.domain.toString().toLowerCase(), starturl: startURL });
    } else if (msg.msg === "Madame"){
	var filled = 0;
	document.onmousedown = function(evt) {
	    //alert("clicked");
	    //var evt=window.event || evt; // window.event for IE
	    if (!evt.target && evt.target.tagName==="input") evt.target=evt.srcElement; // extend target property for IE
	    {
		//alert(evt.target.id);
		//evt.target.attributes["autocomplete"].value="on";
		//evt.target.focus();

		if(filled === 0 ){
		    if(evt.target.type !== "password"){
	                evt.target.value = msg.id;
		    } else {
			evt.target.value = msg.pw;
			document.onmousedown = null;
		    }
		    filled = 1;
		}else{
		    if(evt.target.type === "password")
	            	evt.target.value = msg.pw;
		    document.onmousedown = null;
		}
	    }
	}
    } else if (msg.msg === "SAML"){
	    console.log("SAML Reponse: "+msg.saml);
            var myform = document.createElement("form");
            myform.action = msg.target;
            myform.method = "post";
            var product = document.createElement("input");
            product.value = msg.saml;
            product.type = "hidden";
            product.name = "SAMLResponse";
            myform.appendChild(product);
	    if(startURL != "") {
                var relayState = document.createElement("input");
                relayState.value = startURL;
                relayState.type = "hidden";
                relayState.name = "RelayState";
                myform.appendChild(relayState);
	    }
            var button = document.createElement("input");
            button.type = "submit";
            myform.appendChild(button);
            myform.style.display = "none";
            document.body.appendChild(myform);
            myform.submit();
	    console.log("myform submitted");
	    startURL = "";
    } else if (msg.msg === "get"){
      port.postMessage({msg: "get", val: portMsg});
    } else if (msg.msg === "logout"){
      alert("logout");
    }
  });
});
