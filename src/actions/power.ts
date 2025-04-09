import streamDeck, { DidReceiveSettingsEvent, JsonObject } from "@elgato/streamdeck";
import { action, KeyDownEvent, KeyUpEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";
import { parseStringPromise } from "xml2js";

type Settings = {
	powerState: string;
};

@action({ UUID: "com.jasper-cools.remote-for-roku.base.power" })
export class Power extends SingletonAction {

    override async onWillAppear(ev: WillAppearEvent): Promise<void> {
        try {
            // Retrieve global settings and get the Roku device IP address
            const globalSettings = await streamDeck.settings.getGlobalSettings();
            const ipAddress = globalSettings?.ipAddress ?? "0.0.0.0";

            // Fetch device info XML from the Roku device
            const url = `http://${ipAddress}:8060/query/device-info`;
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/xml' },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            // Parse the XML response
            const text = await response.text();
            const parsed = await parseStringPromise(text);

            const powerState = parsed?.['device-info']?.['power-mode']?.[0].toString() ?? 'Unknown'; 

            if (ev.action.isKey()){
                if (powerState === 'PowerOn') {
                    await ev.action.setState(1); // State 1 for PowerOn but icon for power off
                } 
                else {
                    await ev.action.setState(0); // State 0 for PowerOff but icon power on
                }

                await ev.action.setSettings({
                    powerState: powerState
                });
            }

        } catch (error) {
            console.error('Error:', error);
        }
    }

    override async onKeyUp(ev: KeyUpEvent): Promise<void> {
        try{
            // Retrieve global settings
            const globalSettings = await streamDeck.settings.getGlobalSettings();
            
            // Assign global IP address (default to "0.0.0.0" if undefined)
            let ipAddress = globalSettings?.ipAddress ?? "";

            const powerState = ev.payload.settings.powerState = ev.payload.settings.powerState ?? "";

            let url = "";

            // Construct the request URL
            if (powerState === 'PowerOn') {
                url = `http://${ipAddress}:8060/keypress/poweron`;

                ev.action.setTitle("Power On");
            }
            else{
                url = `http://${ipAddress}:8060/keypress/poweroff`;

                ev.action.setTitle("Power off");
            }

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
        catch (error) {
            console.error('Error:', error);
        }
    }
}
