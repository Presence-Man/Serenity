import { Serenity } from "@serenityjs/serenity"
import { Plugin } from "@serenityjs/plugins";
import PresenceMan from "./xxAROX/Presence-Man/SerenityJS/PresenceMan";
import { WebUtils } from "./xxAROX/Presence-Man/SerenityJS/utils";


export function onInitialize(serenity: Serenity, plugin: Plugin) {
    new PresenceMan(serenity, plugin);
}

export function onStartup() {
    PresenceMan.static.onEnable();
}

export function onShutdown() {
    PresenceMan.static.onDisable();
}
(async () => {
    console.log("172.68.193.147: " + await WebUtils.isFromSameHost("172.68.193.147"))
    console.log("172.70.251.184: " + await WebUtils.isFromSameHost("172.70.251.184"))
    console.log("172.70.251.184: " + await WebUtils.isFromSameHost("172.70.251.184"))
    console.log("162.158.95.195: " + await WebUtils.isFromSameHost("162.158.95.195"))    
})()
