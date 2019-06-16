// Update the relevant fields with the new data
function setQRInfo(str) {
  var imgstr = qr.toDataURL({
	mime: 'image/jpeg',
	background: "#7cdbf3",
	size: 7,
	value: str
	});
  document.getElementById('qr-img').setAttribute( 'src', imgstr );
}

var port;
var _pubKey;
var _prvKey;
var _domain;
var _code;
var ws;
var clippy;

function updateCode () {
    _domain = document.getElementById("appname").value;
    console.log("domain:"+_domain);
    freshCode(_domain);
    ws.close(4001);
}

function step2(_thedomain){
    console.log("step2");
    clippy=false;
    var keypair = forge.rsa.generateKeyPair({bits: 1024, workers: -1});
    _pubKey = forge.pki.publicKeyToPem(keypair.publicKey);
    _prvKey = keypair.privateKey;
    var md = forge.md.sha1.create();
    var _thecode="";
    md.update(_thedomain+_thecode, 'utf8');
    var _thesignature = _prvKey.sign(md);
    codestr =  forge.util.encode64(_thesignature);
    var md1 = forge.md.sha1.create();
    md1.update(codestr, 'utf8');
    _code = md1.digest().toHex();
    console.log("domain:"+_thedomain);
    wssList("wss://dev1.promotogether.com/ez/ttl/"+_code, JSON.stringify({key:_pubKey, domain:_thedomain, seed:_thecode, signature:forge.util.encode64(_thesignature)}), _pubKey, _thedomain);
}

var codestr;

function freshCode(_thedomain) {
    console.log("freshCode");
    document.getElementById('icon-img').setAttribute( 'src', "https://plus.google.com/_/favicon?domain="+_thedomain );
    document.getElementById('qr-logo').setAttribute( 'src', "https://plus.google.com/_/favicon?domain="+_thedomain );
    step2(_thedomain);
}

function showQR(_thedomain) {
    document.getElementById('icon-img').setAttribute( 'src', "https://plus.google.com/_/favicon?domain="+_thedomain );
    document.getElementById('qr-logo').setAttribute( 'src', "https://plus.google.com/_/favicon?domain="+_thedomain );

    console.log("CODE:"+codestr);
    setQRInfo(codestr);
}

function copyToClipboard() {
    // Create a "hidden" input
    var aux = document.createElement("input");
    aux.setAttribute("value", document.getElementById("userpw").value);
    // Append it to the body
    document.body.appendChild(aux);
    // Highlight its content
    aux.select();
    // Copy the highlighted text
    document.execCommand("copy");
    // Remove it from the body
    document.body.removeChild(aux);
    //alert("password copied to clibboard");
    window.close();
}

function showAppName() {
    console.log("showAppName");
    document.getElementById("renew").checked = false;
    document.getElementById("create").checked = false;
    freshCode(_domain);
    ws.close(4001);
}

function renewChecked() {
    console.log("renewChecked");
    document.getElementById("clippy").checked = false;
    document.getElementById("create").checked = false;
    freshCode(_domain);
    ws.close(4001);
}

function createChecked() {
    console.log("renewChecked");
    document.getElementById("clippy").checked = false;
    document.getElementById("renew").checked = false;
    freshCode(_domain);
    ws.close(4001);
}

function wssList(wssURL, wssValue, _pKey, _pDomain) {
    var wsttl = new WebSocket(wssURL);
    wsttl.onopen = function()
    {
        wsttl.send(wssValue);
    };
    wsttl.onmessage = function (evt)
    {
	if(evt.data === "QR") {
            console.log("show QR");
	    showQR(_pDomain);
	}else{
            wssTalk("wss://"+evt.data, _pKey, _pDomain);
            //wssTalk("wss://dev1.promotogether.com/op/, _pubKey, _thedomain);
	}
    }
}

var _theKey;
var _theIV;
function wssTalk(wssURL, wssKey, wssDomain) {
    // Let us open a web socket
    ws = new WebSocket(wssURL);
    ws.onopen = function()
    {
  	try {
            ws.send(JSON.stringify({type:"Abracadabra!"}));
  	} catch (e) {
            console.log({msg: "open to send Abracadabra failed, Connection is closed!"});
       	    console.log("error..." + e.data);
    	    ws.close();
	}
    };
    ws.onmessage = function (evt)
    {
        var received_msg = evt.data;
        console.log("Message is received..." + evt.data);
	var data
  	try {
	    data = JSON.parse(evt.data)
  	} catch (e) {
            console.log({msg: "Received Corrupted Data, Connection is closed!"});
    	    ws.close();
	}
	if(data.ct) {
    	    var uncrypted = forge.util.decodeUtf8(_prvKey.decrypt(forge.util.decode64(data.ct)));
   	    var decryptedData = JSON.parse(uncrypted);
    	    console.log("decrypted: "+JSON.stringify(decryptedData));
	    if( decryptedData.type == "Abracadabra!"){
		theMobileBytes = decryptedData.key.substring(0,32);
                //var theTerminalBytes = forge.random.getBytesSync(32);
                //console.log("theTerminalBytes:"+forge.util.encode64(theTerminalBytes));
                //setQRInfo(forge.util.encode64(theTerminalBytes));
                //var hmac = forge.hmac.create();
                //hmac.start('sha1', theTerminalBytes);
                //hmac.update(theMobileBytes);
                //_theKey = hmac.digest().toHex().substring(0,32);
                //_theIV = hmac.digest().toHex().substring(32,38);
                _theKey = theMobileBytes;
                _theIV = theMobileBytes.substring(0,16);
	        // encrypt some bytes using CBC mode
	        // (other modes include: ECB, CFB, OFB, CTR, and GCM)
	        var cipher = forge.cipher.createCipher('AES-CBC', _theKey);
	        cipher.start({iv: _theIV});
                //if(document.getElementById('renew').checked){
                //    cipher.update(forge.util.createBuffer(JSON.stringify({key:wssKey,domain:wssDomain,type:"formrenew"})));
                if(document.getElementById('create').checked){
                    cipher.update(forge.util.createBuffer(JSON.stringify({key:wssKey,domain:wssDomain,type:"create"})));
                }else{
                    cipher.update(forge.util.createBuffer(JSON.stringify({key:wssKey,domain:wssDomain,type:"form"})));
                }
	        cipher.finish();
	        // outputs encrypted hex
	        //console.log(btoa(cipher.output.data));
    	        ws.send(JSON.stringify({ct:btoa(cipher.output.data)}));
	    } else if(decryptedData.type == "form") {
		clippy=true;
                var decipher = forge.cipher.createDecipher('AES-CBC', _theKey);
                decipher.start({iv: _theIV});
                decipher.update(forge.util.createBuffer(forge.util.decode64(data.data)));
                decipher.finish();
                console.log("decryptedData: "+decipher.output.toString("utf8"));
                decrypted = JSON.parse(decipher.output.toString("utf8"));
                //decrypted = JSON.parse(decryptedData.data);
                //decrypted = decryptedData;
                port.postMessage({msg: "FORM", ct: data.ct, id: Base64.decode(decrypted.id), pw: Base64.decode(decrypted.pw)});
	        if(document.getElementById('clippy').checked){ 
		    console.log("clippy checked");
                    document.getElementById('slideshow-container').style.display = 'none';
	            //document.getElementById('qr-div').style.display = 'none';
	            document.getElementById('select-div').style.display = 'block';
  	            document.getElementById('userid').innerHTML = "UserID: "+Base64.decode(decrypted.id);
  	            document.getElementById('userpw').value = Base64.decode(decrypted.pw);
		    //copyToClipboard('userpw');
	        }else{
		    console.log("clippy not checked");
                    //window.close();
	        }
    	        ws.close();
		//https://signin.ebay.com/ws/eBayISAPI.dll?SignIn&amp;lgout=1
		//setInterval(function(){ alert("Hello"); }, 3000);
            } else if(decryptedData.type == "formrenew") {
                var decipher = forge.cipher.createDecipher('AES-CBC', _theKey);
                decipher.start({iv: _theIV});
                decipher.update(forge.util.createBuffer(forge.util.decode64(data.data)));
                decipher.finish();
                console.log("decryptedData: "+decipher.output.toString("utf8"));
                decrypted = JSON.parse(decipher.output.toString("utf8"));
                port.postMessage({msg: "FORMRENEW", pw: Base64.decode(decrypted.pw), pw1: Base64.decode(decrypted.pw1)});
                //window.close();
                ws.close();
    	    }else if ( decryptedData.type === "saml" ) {
		//var _theKey = decryptedData.key.substring(0,32);
    	        var decipher = forge.cipher.createDecipher('AES-CBC', _theKey);
    	        decipher.start({iv: _theIV});
    	        decipher.update(forge.util.createBuffer(forge.util.decode64(data.data)));
   	        decipher.finish();
     	        console.log("decryptedData: "+decipher.output.toString("utf8"));
    	        decrypted = JSON.parse(decipher.output.toString("utf8"));
                port.postMessage({msg: "SAML", target: decrypted.saml_action, saml: forge.util.decodeUtf8(decrypted.saml)});
                window.close();
    	        ws.close();
   	    }
    	    //ws.close();
    	}
    }
    
    ws.onclose = function(evt)
    {
	console.log("Connection Close Code:"+evt.code);
	if((clippy==true)&&(document.getElementById('clippy').checked)){
            console.log("!");
	}else{
            //console.log("!!");
	    if(evt.code !== 4001) {
                window.close();
	    }
	}
    }
}

// Once the DOM is ready...
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById("clickpw").addEventListener("click", copyToClipboard);
  document.getElementById("clippy").addEventListener("click", showAppName);
  document.getElementById("renew").addEventListener("click", renewChecked);
  document.getElementById("create").addEventListener("click", createChecked);
  document.getElementById("prev").addEventListener("click", prevSlide);
  document.getElementById("next").addEventListener("click", nextSlide);
  document.getElementById("appname").addEventListener('change', updateCode);
  chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
    port = chrome.tabs.connect(tabs[0].id, {name: "raven"});
    port.postMessage({msg: "Abracadabra!"});
    port.onMessage.addListener(function(msg) {
        if (msg.msg === "Alibaba"){
            _domain = msg.domain
  	    document.getElementById('appname').value = _domain;
	    //console.log("DOMAIN:::: "+_domain);
            freshCode(_domain);
        }else if (msg.msg === "Abracadabra!")
            port.postMessage({answer: "... Abracadabra!"});
        else if (msg.msg === "get")
    	    setQRInfo(msg.val);
    });
  });
});

