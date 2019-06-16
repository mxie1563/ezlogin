// this tab should have a page-action
chrome.runtime.sendMessage({
  from:    'content',
  subject: 'showPageAction'
});

var portMsg="";
var startURL="";

document.onmousedown = function(evt) {
if (!evt.target && evt.target.tagName==="INPUT") evt.target=evt.srcElement; // extend target property for IE
{
   portMsg = portMsg + "{type:"+evt.target.type + ", val:"+evt.target.value+"}";
}
}

// Listen for messages from the popup
chrome.runtime.onConnect.addListener(function(port) {
  console.assert(port.name == "raven");
  port.onMessage.addListener(function(msg) {
    document.onmousedown = null;
    if (msg.msg === "FORM"){
	var filled = 0;
	document.onmousedown = function(evt) {
	    //alert("clicked");
	    //var evt=window.event || evt; // window.event for IE
	    //if (!evt.target && evt.target.tagName==="input") evt.target=evt.srcElement; // extend target property for IE
	    var elements = document.elementsFromPoint( evt.clientX, evt.clientY );
	    var i;
	    for(i=0; i<elements.length; i++)
	    {
	      if(elements[i].tagName === "INPUT" )
	      {
		//alert(elements[i].id);
		//elements[i].attributes["autocomplete"].value="on";
		//elements[i].focus();

		if(filled === 0 ){
		    if(elements[i].type !== "password"){
	                elements[i].value = msg.id;
		    } else {
			elements[i].value = msg.pw;
			document.onmousedown = null;
		    }
		    //filled = 1;
		}else{
		    if(elements[i].type === "password")
	            	elements[i].value = msg.pw;
		    document.onmousedown = null;
		}
		i = elements.length;
	    }
	  }
	}
    } else if (msg.msg === "FORMRENEW"){
	var filled = 0;
	document.onmousedown = function(evt) {
	    //if (!evt.target && evt.target.tagName==="input") evt.target=evt.srcElement; // extend target property for IE
	    var elements = document.elementsFromPoint( evt.clientX, evt.clientY );
	    var i;
	    for(i=0; i<elements.length; i++)
	    {
	      if(elements[i].tagName === "INPUT" )
	      {
		if(filled === 0 ){
		    if(elements[i].type === "password"){
			elements[i].value = msg.pw;
		    }
		    filled++;
		}else if(filled === 1 ){
		    if(elements[i].type === "password"){
			elements[i].value = msg.pw1;
		    }
		    filled++;
		}else if(filled === 2 ){
		    if(elements[i].type === "password"){
			elements[i].value = msg.pw1;
		    }
		    filled++;
		    document.onmousedown = null;
		}
		i = elements.length;
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
    }
  });
});
