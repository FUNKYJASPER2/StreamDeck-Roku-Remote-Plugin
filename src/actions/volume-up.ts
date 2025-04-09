import streamDeck from "@elgato/streamdeck";
import { action, KeyDownEvent, KeyUpEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";

@action({ UUID: "com.funky.rokuremotejs.volume-up" })
export class VolumeUp extends SingletonAction {

    override onWillAppear(ev: WillAppearEvent): void | Promise<void> {
        
    }

    override async onKeyUp(ev: KeyUpEvent): Promise<void> {
        try{
            // Retrieve global settings
            const globalSettings = await streamDeck.settings.getGlobalSettings();
            
            // Assign global IP address (default to "0.0.0.0" if undefined)
            let ipAddress = globalSettings?.ipAddress ?? "";

            if (!ipAddress || ipAddress == "") {
                ev.action.showAlert();
            }
            else{

                // Construct the request URL
                const url = `http://${ipAddress}:8060/keypress/volumeup`;

                // Send the request
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key1: 'value1', key2: 'value2' }),
                });

                // Handle response
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                console.log('Request successful');
            }
        }
        catch (error) {
            console.error('Error:', error);
        }
    }
}
