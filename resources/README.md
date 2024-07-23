# Presence-Man SerenityJS plugin configuration

| Key | Type | Description |
|:----:|:----:|:----:|
| token                             | String  | The token you obtain from our discord bot. |
| client_id                         | String  | Discord application id |
| server                            | String  | The name of the server that will be displayed in the presences. |
| update_skin                       | Boolean | *Player's skin will be sent to our backend server to store the head and show it in the presences.* Should only be enabled on lobby servers, otherwise you may get rate-limited for your entire network. |
| default_presence.enabled          | Boolean | Apply the default presence on join. |
| default_presence.state            | String | The default presence state. |
| default_presence.details          | String | The default presence details. |
| default_presence.large_image_text | String | The text above the large image. |
| default_presence.large_image_key  | String | The large image asset-key from discord developer application portal. |
