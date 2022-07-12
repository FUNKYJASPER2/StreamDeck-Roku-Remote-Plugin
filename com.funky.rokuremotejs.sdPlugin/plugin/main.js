let websocket = null,
    pluginUUID = null;
    ipAddress = "";

function connectElgatoStreamDeckSocket(inPort, inPluginUUID, inRegisterEvent, inInfo)
{
    pluginUUID = inPluginUUID;

    // Open the web socket
    websocket = new WebSocket("ws://localhost:" + inPort);

    websocket.onopen = function()
    {
        // WebSocket is connected, register the plugin
        const json = {
            "event": inRegisterEvent,
            "uuid": inPluginUUID
        };
    
        websocket.send(JSON.stringify(json));
    };

    websocket.onmessage = function (evt)
    {
        // Received message from Stream Deck
        const jsonObj = JSON.parse(evt.data);
        
        // if any stream deck button has been pressed and the key is coming up
        if(jsonObj['event'] == "keyUp")
        {          

            // assigns app select if it exists then it gets it from the payload otherwise blank
            let appSelect = "";
            if(jsonObj.payload.settings != null && jsonObj.payload.settings.hasOwnProperty('appSelect')){
                appSelect = jsonObj.payload.settings["appSelect"];
            }

            // if ip address is blank, the stream deck is told to show error on the button
            if(ipAddress == "") 
            {
                const json = {
                    "event": "showAlert",
                    "context": jsonObj.context,
                };
                websocket.send(JSON.stringify(json));
            } 
            else{
                var action;

                var response;

                // if the action is not selecting app/input
                if (jsonObj['action'] != "com.funky.rokuremotejs.app"){
                    
                    // if statements for which stream deck action has been triggered and assigns the action variable to be used in call to roku
                    if (jsonObj['action'] == "com.funky.rokuremotejs.ok"){
                        action = "select";
                    }
                    else if (jsonObj['action'] == "com.funky.rokuremotejs.up"){
                        action = "up";
                    }
                    else if (jsonObj['action'] == "com.funky.rokuremotejs.down"){
                        action = "down";
                    }
                    else if (jsonObj['action'] == "com.funky.rokuremotejs.left"){
                        action = "left";
                    }
                    else if (jsonObj['action'] == "com.funky.rokuremotejs.right"){
                        action = "right";
                    }
                    else if (jsonObj['action'] == "com.funky.rokuremotejs.back"){
                        action = "back";
                    }
                    else if (jsonObj['action'] == "com.funky.rokuremotejs.home"){
                        action = "home";
                    }
                    else if (jsonObj['action'] == "com.funky.rokuremotejs.volumeup"){
                        action = "volumeup";
                    }
                    else if (jsonObj['action'] == "com.funky.rokuremotejs.volumedown"){
                        action = "volumedown";
                    }
                    else if (jsonObj['action'] == "com.funky.rokuremotejs.volumemute"){
                        action = "volumemute";
                    }
                    else if (jsonObj['action'] == "com.funky.rokuremotejs.rewind"){
                        action = "rev";
                    }
                    else if (jsonObj['action'] == "com.funky.rokuremotejs.playpause"){
                        action = "play";
                    }
                    else if (jsonObj['action'] == "com.funky.rokuremotejs.forward"){
                        action = "fwd";
                    }
                    else if (jsonObj['action'] == "com.funky.rokuremotejs.poweron"){
                        action = "poweron";
                    }
                    else if (jsonObj['action'] == "com.funky.rokuremotejs.poweroff"){
                        action = "poweroff";
                    }
        
                    // prepars the URL with the ip address and action
                    var url = "http://" + ipAddress + ":8060/keypress/" + action;
        
                    var xmlHttp = new XMLHttpRequest();
                    xmlHttp.open( "POST", url, true );

                    // if the response is times out (meaning the tv is not responding or the ip address is wrong) then shows error
                    xmlHttp.ontimeout = () => {
                        const json = {
                            "event": "showAlert",
                            "context": jsonObj.context,
                        };
                        websocket.send(JSON.stringify(json));
                    }

                    xmlHttp.send( null );
                    response = xmlHttp.responseText.toString();

                }
                // if actions is selecting app
                else if (jsonObj['action'] == "com.funky.rokuremotejs.app"){
                    // if the app chosen is blank then shows error
                    if(appSelect == "") 
                        {
                            const json = {
                                "event": "showAlert",
                                "context": jsonObj.context,
                            };
                            websocket.send(JSON.stringify(json));
                        } 
                        else{
                            action = appSelect;
                            
                            // prepars the URL with the ip address and action
                            var url = "http://" + ipAddress + ":8060/launch/" + action;
        
                            var xmlHttp = new XMLHttpRequest();
                            xmlHttp.open( "POST", url, true );

                            // if the response is times out (meaning the tv is not responding or the ip address is wrong) then shows error
                            xmlHttp.ontimeout = () => {
                                const json = {
                                    "event": "showAlert",
                                    "context": jsonObj.context,
                                };
                                websocket.send(JSON.stringify(json));
                            }

                            xmlHttp.send( null );
                            response = xmlHttp.responseText.toString();
                        }
                }
            }

        }
        else if(jsonObj['event'] == "didReceiveGlobalSettings") 
        {
            // gets message saying the global settings have been received
            if(jsonObj.payload.settings != null && jsonObj.payload.settings.hasOwnProperty('ipAddress'))
            {
                // sets the ip address in the property inspector from the stream deck global settings
                ipAddress = jsonObj.payload.settings["ipAddress"];
            }

        } 
        // if key is pressed down the get global settings is trigged
        else if(jsonObj['event'] == "keyDown") 
        {
            const json = {
                "event": "getGlobalSettings",
                "context": pluginUUID
            };
    
            websocket.send(JSON.stringify(json));
        }
    };
};