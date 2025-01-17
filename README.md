# Serenity
> [!IMPORTANT]
> This plugin is not full tested yet.



<details>
<summary>API for developers:</summary>

```ts
import { Serenity } from "@serenityjs/serenity";
import { Plugin } from "@serenityjs/plugins";
import { Player } from "@serenityjs/world";

export function onInitialize(serenity: Serenity, plugin: Plugin): void{
    if (!serenity.plugins.entries.has("Presence-Man")) throw "Presence-Man client not found, this plugin depends on it!";
    // @ts-ignore
    const {
        APIActivity, ActivityType,
        DefaultActivities,
        setActivity, clearActivity, getSkinURL, getHeadURL
    }, PresenceMan = serenity.plugins.import("Presence-Man");
    // @ts-ignore
    var player: Player = new Player(null, null, null, null, null);

    // NOTE: Update activity
    const activity_oop = new APIActivity();
    activity_oop.state = "Playing a game";
    activity_oop.details = "on a Serenity server";
    const activity_default = DefaultActivities.activity();
    const activity_ends_in_15mins = DefaultActivities.ends_in(Date.now() +(1000 *60 *15), activity_default);
    const activity_players_left = DefaultActivities.players_left(9, 16, activity_ends_in_15mins);
    setActivity(player, activity_players_left); // update
    clearActivity(player); // clear
    
    // NOTE: Get skin/head url
    const gray = false;
    const size = 128; // 128x128 pixels
    getSkinURL(player.xuid, gray);
    getHeadURL(player.xuid, !gray, size);
}
export function onStartup() {
    // Your code here
}
export function onShutdown() {
    // Your code here
}
```

</details>
