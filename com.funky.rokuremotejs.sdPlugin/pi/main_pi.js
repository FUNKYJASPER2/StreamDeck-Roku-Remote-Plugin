let websocket = null,
    uuid = null,
    actionInfo = {};

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

        // gets message saying the global settings have been received
        if (jsonObj.event === 'didReceiveGlobalSettings') {
			const payload = jsonObj.payload.settings;

            // sets the ip address in the property inspector from the stream deck global settings
			document.getElementById('ipAddress').value = payload.ipAddress;

            // if undifined, sets it to blank
			if (document.getElementById('ipAddress').value == "undefined") {
				document.getElementById('ipAddress').value = "";
			}
		}
    };

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