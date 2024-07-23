import { Serenity } from "@serenityjs/serenity";
import { Plugin } from "@serenityjs/plugins";
import { Player } from "@serenityjs/world";
import { 
    APIActivity, ActivityType, DefaultActivities,
    getSkinURL, getHeadURL, setActivity, clearActivity,
} from "@presence-man/serenity";

function onStartup(serenity: Serenity, plugin: Plugin): void{
    if (!serenity.plugins.entries.has("Presence-Man")) throw "Presence-Man client not found, this plugin depends on it!";
    const PresenceMan = serenity.plugins.entries.get("Presence-Man")!.module;
    // @ts-ignore
    var player: Player = new Player(null, null, null, null, null);

    // NOTE: Update activity
    // Also works: const activity_oop = new APIActivity();
    const activity_default = DefaultActivities.activity();
    const activity_ends_in_15mins = DefaultActivities.ends_in(Date.now() +(1000 *60 *15), activity_default);
    const activity_players_left = DefaultActivities.players_left(9, 16, activity_ends_in_15mins);
    setActivity(player, activity_players_left); // update
    clearActivity(player); // clear
    
    // NOTE: Get skin/head url
    const gray = false;
    const size = 128; // 128x128
    getSkinURL(player.xuid, gray);
    getHeadURL(player.xuid, !gray, size);
}
