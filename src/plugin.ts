import streamDeck, { LogLevel } from "@elgato/streamdeck";

import { Select } from "./actions/select";
import { Up } from "./actions/up";
import { Down } from "./actions/down";
import { Left } from "./actions/left";
import { Right } from "./actions/right";
import { Option } from "./actions/option";
import { Back } from "./actions/back";
import { Home } from "./actions/home";
import { VolumeUp } from "./actions/volume-up";
import { VolumeDown } from "./actions/volume-down";
import { VolumeMute } from "./actions/volume-mute";
import { Rewind } from "./actions/rewind";
import { PlayPause } from "./actions/play-pause";
import { Forward } from "./actions/forward";
import { PowerOn } from "./actions/power-on";
import { PowerOff } from "./actions/power-off";
import { AppSelection } from "./actions/app-selection";

// We can enable "trace" logging so that all messages between the Stream Deck, and the plugin are recorded. When storing sensitive information
streamDeck.logger.setLevel(LogLevel.TRACE);

// Register the increment action.
streamDeck.actions.registerAction(new Select());
streamDeck.actions.registerAction(new Up());
streamDeck.actions.registerAction(new Down());
streamDeck.actions.registerAction(new Left());
streamDeck.actions.registerAction(new Right());
streamDeck.actions.registerAction(new Option());
streamDeck.actions.registerAction(new Back());
streamDeck.actions.registerAction(new Home());
streamDeck.actions.registerAction(new VolumeUp());
streamDeck.actions.registerAction(new VolumeDown());
streamDeck.actions.registerAction(new VolumeMute());
streamDeck.actions.registerAction(new Rewind());
streamDeck.actions.registerAction(new PlayPause());
streamDeck.actions.registerAction(new Forward());
streamDeck.actions.registerAction(new PowerOn());
streamDeck.actions.registerAction(new PowerOff());
streamDeck.actions.registerAction(new AppSelection());


// Finally, connect to the Stream Deck.
streamDeck.connect();
