# Serenity
> [!IMPORTANT]
> This plugin is not finished yet.



<details>
<summary>API for developers:</summary>

```ts
import { Plugin } from "@serenityjs/plugins";
import { Player } from "@serenityjs/world";
import { Logger } from "@serenityjs/logger";
import {
    APIActivity, ActivityType, DefaultActivities,
    getSkinURL, getHeadURL, setActivity
}, * as PresenceMan from "./index";

// NOTE: Update activity
// Also works: const activity_oop = new APIActivity();
const activity_default = PresenceMan.DefaultActivities.activity();
const activity_ends_in_15mins = PresenceMan.DefaultActivities.ends_in(Date.now() +(1000 *60 *15), activity_default);
const activity_players_left = PresenceMan.DefaultActivities.players_left(9, 16, activity_ends_in_15mins);
PresenceMan.setActivity(player, activity_players_left); // update
PresenceMan.setActivity(player, null); // clear

// NOTE: Get skin/head url
const gray = false;
const size = 128; // 128x128
PresenceMan.getSkinURL(player, gray);
PresenceMan.getHeadURL(player, !gray, scale);
```

</details>
