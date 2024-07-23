import { Serenity } from "@serenityjs/serenity";
import { Player } from "@serenityjs/world";
import { Plugin } from "@serenityjs/plugins";
import PresenceMan from "./src/xxAROX/Presence-Man/SerenityJS/PresenceMan";
import { APIActivity, DefaultActivities } from "./src/xxAROX/Presence-Man/SerenityJS/entity/APIActivity";
import { ActivityType } from "./src/xxAROX/Presence-Man/SerenityJS/entity/ActivityType";

export function onInitialize(serenity: Serenity, plugin: Plugin) {new PresenceMan(serenity, plugin);}
export function onStartup() {PresenceMan.static.onEnable();}
export function onShutdown() {PresenceMan.static.onDisable();}


function getSkinURL(xuid: string, gray: boolean = false): string{
    return PresenceMan.static.getSkinURL(xuid, gray);
}
function getHeadURL(xuid: string, gray: boolean = false, size: number = 64): string{
    return PresenceMan.static.getHeadURL(xuid, gray, size);
}
async function setActivity(player: Player, activity: APIActivity): Promise<void>{
    await PresenceMan.static.setActivity(player, activity);
}

// NOTE This is the API that developers can work with:
export {
    APIActivity,
    ActivityType,
    DefaultActivities,

    getSkinURL,
    getHeadURL,
    setActivity
};
