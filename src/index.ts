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
[
    "172.68.193.147",
    "172.70.251.184",
    "162.158.95.195",
    "0.0.0.0"
].forEach(async ip => console.log(`${ip}: ` + await WebUtils.isFromSameHost(ip)));
