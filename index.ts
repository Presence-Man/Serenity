import { Serenity } from "@serenityjs/serenity";
import { Plugin } from "@serenityjs/plugins";
import PresenceMan from "./src/xxAROX/Presence-Man/SerenityJS/PresenceMan";
import { APIActivity, DefaultActivities } from "./src/xxAROX/Presence-Man/SerenityJS/entity/APIActivity";
import { ActivityType } from "./src/xxAROX/Presence-Man/SerenityJS/entity/ActivityType";

const getSkinURL = PresenceMan.static.getSkinURL;
const getHeadURL = PresenceMan.static.getHeadURL;
const setActivity = PresenceMan.static.setActivity;

export function onInitialize(serenity: Serenity, plugin: Plugin) {new PresenceMan(serenity, plugin);}
export function onStartup() {PresenceMan.static.onEnable();}
export function onShutdown() {PresenceMan.static.onDisable();}

// NOTE This is the API that developers can work with:
export {
    APIActivity,
    ActivityType,
    DefaultActivities,

    getSkinURL,
    getHeadURL,
    setActivity
};
