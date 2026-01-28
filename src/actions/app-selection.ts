import streamDeck from "@elgato/streamdeck";
import {
    action,
    KeyDownEvent,
    KeyUpEvent,
    SingletonAction,
    WillAppearEvent,
    DidReceiveSettingsEvent,
    SendToPluginEvent
} from "@elgato/streamdeck";
import type { JsonObject, JsonValue } from "@elgato/utils";
import { parseStringPromise } from "xml2js";


// Define the action's settings type.
type Settings = {
	selected_app_ID: string;
};

@action({ UUID: "com.funky.rokuremotejs.app-selection" })
export class AppSelection extends SingletonAction {

    private async setIconFromSettings(ev: WillAppearEvent | DidReceiveSettingsEvent<Settings>): Promise<void> {
        const globalSettings = await streamDeck.settings.getGlobalSettings();
        const ipAddress = globalSettings?.ipAddress ?? "0.0.0.0";
        const appID = ev.payload.settings.selected_app_ID ?? "";

        try {
            const iconResponse = await fetch(`http://${ipAddress}:8060/query/icon/${appID}`, {
                method: 'GET'
            });

            if (!iconResponse.ok) {
                throw new Error(`Failed to fetch icon: ${iconResponse.status}`);
            }

            const arrayBuffer = await iconResponse.arrayBuffer();
            const base64Icon = Buffer.from(arrayBuffer).toString('base64');
            const imageData = `data:image/png;base64,${base64Icon}`;

            // Set the image on the Stream Deck key
            ev.action.setImage(imageData);
        } catch (err) {
            console.error('Error fetching or setting Roku app icon:', err);
        }
    }

    override async onWillAppear(ev: WillAppearEvent): Promise<void> { 
        // Handle the settings changing in the property inspector (UI).
        await this.setIconFromSettings(ev);

    }

    override async onKeyUp(ev: KeyUpEvent): Promise<void> {
        try{
            // Retrieve global settings
            const globalSettings = await streamDeck.settings.getGlobalSettings();

            const appID = ev.payload.settings.selected_app_ID = ev.payload.settings.selected_app_ID ?? "";
            
            // Assign global IP address (default to "0.0.0.0" if undefined)
            let ipAddress = globalSettings?.ipAddress ?? "";

            if (!ipAddress || ipAddress == "") {
                ev.action.showAlert();
            }
            else{

                // Construct the request URL
                const url = `http://${ipAddress}:8060/launch/${appID}`;

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

    override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<Settings>): Promise<void> {
		// Handle the settings changing in the property inspector (UI).
        await this.setIconFromSettings(ev);
	}

    override async onSendToPlugin( ev: SendToPluginEvent<JsonValue & { event: string }, JsonObject>): Promise<void> {
        if (ev.payload.event === 'getApps') {
            const appsArray: { label: string, value: string }[] = [];

            try {
                const globalSettings = await streamDeck.settings.getGlobalSettings();
                const ipAddress = globalSettings?.ipAddress ?? "0.0.0.0";
                const url = `http://${ipAddress}:8060/query/apps`;

                const response = await fetch(url, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/xml' },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const text = await response.text();

                const parsed = await parseStringPromise(text);

                if (parsed && parsed.apps && parsed.apps.app) {
                    parsed.apps.app.forEach((app: any) => {
                        appsArray.push({
                            label: app._,
                            value: app.$.id
                        });
                    });
                }

                console.log('Parsed apps:', JSON.stringify(appsArray, null, 2));

                // Send parsed data to Property Inspector
                streamDeck.ui.sendToPropertyInspector({
                    event: 'getApps',
                    items: appsArray,
                });

            } catch (error) {
                console.error('Error fetching/parsing apps:', error);
            }

            streamDeck.ui.sendToPropertyInspector({
                event: 'getApps',
                items: appsArray
            });
        }
    }
}
