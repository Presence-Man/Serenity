import { Plugin } from "@serenityjs/plugins";
import { Player } from "@serenityjs/world";
import { Logger } from "@serenityjs/logger";
import { Packet,SerializedSkin } from "@serenityjs/protocol";

import * as JSON5 from "json5";
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { cwd } from "node:process";
import { Gateway } from "./entity/Gateway";
import { APIActivity, DefaultActivities } from "./entity/APIActivity";
import { UpdateChecker } from "./tasks/UpdateChecker";
import { APIRequest } from "./entity/APIRequest";
import { SkinUtils, WebUtils } from "./utils";
import { Serenity } from "@serenityjs/serenity";

export default class PresenceMan {
    private static _static: PresenceMan;
    public static get static(): PresenceMan{return PresenceMan._static;}

    public readonly plugin: Plugin;
    public readonly serenity: Serenity;
    public readonly logger: Logger;
    // @ts-ignore -> Its only accessable via getConfig()
    private config: PresenceManConfig;

    //#region Plugin Base code
    public constructor(serenity: Serenity, plugin: Plugin) {
        this.plugin = plugin;
        this.serenity = serenity;
        this.logger = this.plugin.logger;
        if (PresenceMan._static) return;
        PresenceMan._static = this;
        if (!existsSync(this.getDataFolder())) mkdirSync(this.getDataFolder(), {recursive: true});
        this.onLoad();
    }

    public getPKG(): any{
        return JSON.parse(readFileSync(join(__dirname, "../../../../", "package.json")).toString());
    }

    public getDataFolder(...args: string[]): string{
        return join(cwd(), "plugin_data", "Presence-Man", ...args);
    }

    public getConfig(reload: boolean = false): PresenceManConfig{
        if (!this.saveResouce("config.jsonc")) writeFileSync(this.getDataFolder("config.jsonc"), "{\n\t\n}");
        if (reload || !this.config) this.config = JSON5.parse(readFileSync(this.getDataFolder("config.jsonc")).toString()) as PresenceManConfig;
        return this.config;
    }

    public async saveResouce(filename: string, overwrite: boolean = false): Promise<boolean>{
        const from = join(__dirname, "../", "../", "../", "resources", filename);
        if (!existsSync(from)) return false;
        if (!existsSync(this.getDataFolder(filename)) || overwrite) await cpSync(from, this.getDataFolder(filename));
        return existsSync(this.getDataFolder(filename));
    }
    //#endregion

    public static readonly presences: Map<String, APIActivity> = new Map();
    public static default_activity: APIActivity;

    private async onLoad(): Promise<void>{
        await this.saveResouce("README.md", true);
        await this.saveResouce("config.jsonc");
        await Gateway.fetchGatewayInformation();
    }

    public async onEnable(): Promise<void>{
        
        if (this.getConfig().default_presence.enabled) {
            this.serenity.on("PlayerJoined", (event) => {
                this.setActivity(event.player, DefaultActivities.activity());
            })
        }
        if (this.getConfig().update_skin) {
            this.serenity.network.on(Packet.PlayerSkin, (event) => {
                const player = this.serenity.getPlayer(event.session);
                if (player) PresenceMan.static.saveSkin(player, event.packet.skin);
            })
        }
        this.serenity.network.on(Packet.Disconnect, (event) => {
            const player = this.serenity.getPlayer(event.session);
            if (!player) return;
            this.offline(player)
        });
        UpdateChecker.start();
    }

    public onDisable(): void{
        UpdateChecker.stop();
    }

    public getHeadURL(xuid: string, gray: boolean = false, size: number = 64): string{
        size = !size ? Math.min(512, Math.max(16, size)) : 64;
        let url = APIRequest.URI_GET_HEAD + xuid;
        if (size !== undefined) url += `?size=${size}`;
        if (gray) url += size !== undefined ? "&gray" : "?gray";
        return Gateway.getUrl() + url;
    }

    public getSkinURL(xuid: string, gray: boolean = false){
        return Gateway.getUrl() + APIRequest.URI_GET_SKIN + xuid + (gray ? "?gray" : "");
    }

    public async setActivity(player: Player, activity: null|APIActivity): Promise<void>{
        if (!(player instanceof Player)) return;
        const xuid = player.xuid;
        const ip = player.session.connection.rinfo.address;
        const gamertag = player.username;
        if (await WebUtils.isFromSameHost(ip)) return;

        const cfg = this.getConfig();
        const request = new APIRequest(APIRequest.URI_UPDATE_PRESENCE, {}, true);
        request.header("Token", cfg.token);

        request.body("ip", ip);
        request.body("xuid", xuid);
        request.body("server", cfg.server);
        activity!.client_id = cfg.client_id;
        request.body("api_activity", activity?.serialize());

        console.log(request.headers);
        

        const response = await request.request();
        if (response.code === 200) {
            if (!activity) PresenceMan.presences.delete(xuid);
            else PresenceMan.presences.set(player.xuid, activity);
        } else PresenceMan.static.logger.warn(`Failed to update presence for ${gamertag}: ${JSON.parse(response.body).message}`);
    }

    /**
     * @internal
     */
    public async offline(player: Player): Promise<void>{
        if (!(player instanceof Player)) return;
        const xuid = player.xuid;
        const ip = player.session.connection.rinfo.address;
        if (await WebUtils.isFromSameHost(ip)) return;

        const cfg = this.getConfig();
        const request = new APIRequest(APIRequest.URI_UPDATE_OFFLINE, {}, true);
        request.header("Token", cfg.token);

        request.body("ip", ip);
        request.body("xuid", xuid);

        await request.request();
        PresenceMan.presences.delete(xuid);
    }
    /**
     * @internal
     */
    public async saveSkin(player: Player, skin?: SerializedSkin) {
        if (!(player instanceof Player)) return;
        if (!skin) skin = player.skin;
        const xuid = player.xuid;
        const ip = player.session.connection.rinfo.address;
        if (await WebUtils.isFromSameHost(ip)) return;
        const gamertag = player.username;
        const base64 = await SkinUtils.convertSkinToBase64File(skin);
        if (!base64)  {
            this.logger.error("Player " + gamertag + " has an invalid skin!");
            return;
        }

        const cfg = this.getConfig();
        const request = new APIRequest(APIRequest.URI_UPDATE_OFFLINE, {}, true);
        request.header("Token", cfg.token);

        request.body("ip", ip);
        request.body("xuid", xuid);
        request.body("gamertag", gamertag);
        request.body("skin", base64);

        await request.request();
    }
}
interface PresenceManConfig {
    token: string
    client_id: string
    server: string
    update_skin: boolean
    
    default_presence: {
        enabled: boolean
        state: null|string
        details: null|string
        large_image_key: null|string
        large_image_text: null|string
    }
}