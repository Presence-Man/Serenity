import { Serenity } from "@serenityjs/serenity";
import { Player } from "@serenityjs/world";
import { Plugin } from "@serenityjs/plugins";
import { APIActivity, DefaultActivities } from "./src/xxAROX/Presence-Man/SerenityJS/entity/APIActivity";
import { ActivityType } from "./src/xxAROX/Presence-Man/SerenityJS/entity/ActivityType";
import PresenceMan from "./src/xxAROX/Presence-Man/SerenityJS/PresenceMan";
new PresenceMan();

//#region Functions:
function getSkinURL(xuid: string, gray: boolean = false): string{
    return PresenceMan.static.getSkinURL(xuid, gray);
}
function getHeadURL(xuid: string, gray: boolean = false, size: number = 64): string{
    return PresenceMan.static.getHeadURL(xuid, gray, size);
}
async function setActivity(player: Player, activity: APIActivity): Promise<void>{
    await PresenceMan.static.setActivity(player, activity);
}
async function clearActivity(player: Player): Promise<void>{
    await PresenceMan.static.clearActivity(player);
}
//#endregion

//#region Exposed-API
// NOTE: This is the API that developers can work with:
export {
    // Classes:
    APIActivity,
    DefaultActivities,

    // Enums:
    ActivityType,

    // Functions:
    getSkinURL,
    getHeadURL,
    setActivity,
    clearActivity
};

export function onInitialize(serenity: Serenity, plugin: Plugin) {PresenceMan.static.onLoad(serenity, plugin);}
export function onStartup() {PresenceMan.static.onEnable();}
export function onShutdown() {PresenceMan.static.onDisable();}
export interface PluginModuleType {
    APIActivity: APIActivity,
    ActivityType: ActivityType,
    DefaultActivities: DefaultActivities,
    getSkinURL: (xuid: string, gray: boolean|false) => string;
    getHeadURL: (xuid: string, gray: boolean|false, size: number|64) => string;
    setActivity: (player: Player, activity: APIActivity) => Promise<void>;
    clearActivity: (player: Player) => Promise<void>;
}
//#endregion
