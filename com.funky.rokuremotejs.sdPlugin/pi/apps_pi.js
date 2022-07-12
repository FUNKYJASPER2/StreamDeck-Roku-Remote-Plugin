let websocket = null,
    uuid = null,
    actionInfo = {};
    getIpaddress = "";
    getAppSelect = "";

function connectElgatoStreamDeckSocket(inPort, inPropertyInspectorUUID, inRegisterEvent, inInfo, inActionInfo) {

    uuid = inPropertyInspectorUUID;
    actionInfo = JSON.parse(inActionInfo);

    websocket = new WebSocket('ws://localhost:' + inPort);

    websocket.onopen = function()
    {
        // WebSocket is connected, register the Property Inspector
        let json = {
            "event": inRegisterEvent,
            "uuid": inPropertyInspectorUUID
        };
        websocket.send(JSON.stringify(json));

        // gets action settings
        json = {
            "event": "getSettings",
            "context": uuid,
        };
        websocket.send(JSON.stringify(json));

        // gets global settings
        json = {
            "event": "getGlobalSettings",
            "context": uuid,
        };
        websocket.send(JSON.stringify(json));
    };

    websocket.onmessage = function (evt) {
        // Received message from Stream Deck
        const jsonObj = JSON.parse(evt.data);

        // gets message saying the action settings have been received
        if (jsonObj.event === 'didReceiveSettings') {
            const payload = jsonObj.payload.settings;

            // sets the app selected in to the varaible
            getAppSelect = payload.appSelect;

            // if undifined, sets it to blank
            if(getAppSelect == "undefined") {
                getAppSelect = "";
            }
        }

        // gets message saying the global settings have been received
        if (jsonObj.event === 'didReceiveGlobalSettings') {
			const payload = jsonObj.payload.settings;

            // sets the ip address in the property inspector from the stream deck global settings
			document.getElementById('ipAddress').value = payload.ipAddress;

            // makes sure onces the ip address has been loaded from global settings, then passes it to the getapps function to query the right tv
            getApps(payload.ipAddress);

            // if undifined, sets it to blank
			if (document.getElementById('ipAddress').value == "undefined") {
				document.getElementById('ipAddress').value = "";
			}
		}
    };

}

// gets the apps and inputs that are available on the roku and adds it to the property inspector selector
function getApps(getIpaddress){

    var appsArray = []
    
    var url = "http://" + getIpaddress + ":8060/query/apps";
        
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", url, false );
    xmlHttp.send( null );
    response = xmlHttp.responseText.toString();

    // new xml parser
    parser = new DOMParser();
    xmlDoc = parser.parseFromString(response,"text/xml");
    
    // gets all elements from the xml with the tag appp
    x = xmlDoc.getElementsByTagName("app");
    
    // loops through all and appends them to the apps array
    for (i = 0; i< x.length; i++) {
        appsArray.push([x[i].childNodes[0].nodeValue, x[i].getAttribute('id')])
    }

    // gets the select element
    var select = document.getElementById("appSelect");

    // loops through the apps array and appends them to the select element
    for(var i = 0; i < appsArray.length; i++) {
        var opt = appsArray[i];
        var el = document.createElement("option");

        // if it is the app saved in settings, make it the default value in the dropdown
        if (opt[1] == getAppSelect){
            el.setAttribute('selected', true);
        }

        el.textContent = opt[0];
        el.value = opt[1];

        select.add(el);
    }

}

// updates the action settings by getting the assigned app from the property ispector
function updateApp() {
    if (websocket && (websocket.readyState === 1)) {
        let payload = {};
        payload.appSelect = document.getElementById('appSelect').value;
        const json = {
            "event": "setSettings",
            "context": uuid,
            "payload": payload
        };
        websocket.send(JSON.stringify(json));
    }    
}

// updates the global settings of the plugin ie. ip address
function updateIpAddress() {
	if (websocket && (websocket.readyState === 1)) {
		let payload = {};

        // gets the ip address entered in the property inspector
		payload.ipAddress = document.getElementById('ipAddress').value;

        // using regex to see if it is a valid ip address, if it is, the global settings are updated, otherwise ignored
		if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(payload.ipAddress)) {

			const json = {
				"event": "setGlobalSettings",
				"context": uuid,
				"payload": payload
			};
			websocket.send(JSON.stringify(json));
		}
	}
}

// tells the stream deck to open a site
function openPage(site) {
    if (websocket && (websocket.readyState === 1)) {
        const json = {
            'event': 'openUrl',
            'payload': {
                'url': 'https://' + site
            }
        };
        websocket.send(JSON.stringify(json));
    }
}