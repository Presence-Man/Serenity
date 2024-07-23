//#region Imports:
import { Plugin } from "@serenityjs/plugins";
import { Player } from "@serenityjs/world";
import { Logger } from "@serenityjs/logger";
import { Packet,SerializedSkin } from "@serenityjs/protocol";
import { Serenity } from "@serenityjs/serenity";
import * as JSON5 from "json5";
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { cwd } from "node:process";
import { Gateway } from "./entity/Gateway";
import { APIActivity, DefaultActivities } from "./entity/APIActivity";
import { UpdateChecker } from "./tasks/UpdateChecker";
import { APIRequest } from "./entity/APIRequest";
import { SkinUtils, WebUtils } from "./utils";
import { ActivityType } from "./entity/ActivityType";
//#endregion

export default class PresenceMan {
    private static _static: PresenceMan;
    public static get static(): PresenceMan{return PresenceMan._static;}

    //#region PluginBase:
    // @ts-ignore
    private _plugin: Plugin;
    // @ts-ignore
    private _serenity: Serenity;
    // @ts-ignore
    private _logger: Logger;
    // @ts-ignore -> Its only accessable via getConfig()
    private config: PresenceManConfig;
    public get plugin(): Plugin{return this._plugin}
    public get serenity(): Serenity{return this._serenity}
    public get logger(): Logger{return this._logger}

    constructor() {
        if (PresenceMan._static) return;
        PresenceMan._static = this;
    }
    public getDataFolder(...args: string[]): string{
        return join(cwd(), "plugin_data", "Presence-Man", ...args);
    }

    public getConfig(reload: boolean = false): PresenceManConfig{
        if (!this.saveResouce("config.jsonc")) writeFileSync(this.getDataFolder("config.jsonc"), "{\n\t\n}");
        if (reload || !this.config) this.config = JSON5.parse(readFileSync(this.getDataFolder("config.jsonc")).toString()) as PresenceManConfig;
        return this.config;
    }

    public saveResouce(filename: string, overwrite: boolean = false): boolean{
        const from = join(__dirname, "../../../../../", "resources", filename);
        if (!existsSync(from)) return false;
        if (!existsSync(this.getDataFolder(filename)) || overwrite) cpSync(from, this.getDataFolder(filename));
        return existsSync(this.getDataFolder(filename));
    }
    //#endregion

    //#region Plugin mechanic:
    public static readonly presences: Map<String, APIActivity> = new Map();
    public static default_activity: APIActivity;

    public async onLoad(serenity: Serenity, plugin: Plugin): Promise<void>{
        this._plugin = plugin;
        this._serenity = serenity;
        this._logger = this.plugin.logger;
        if (!existsSync(this.getDataFolder())) mkdirSync(this.getDataFolder(), {recursive: true});

        this.saveResouce("README.md", true);
        this.saveResouce("config.jsonc");
        Gateway.fetchGatewayInformation();
    }

    public async onEnable(): Promise<void>{
        const config = this.getConfig();
        if (config.default_presence.enabled) {
            this.serenity.on("PlayerJoined", async (event) => this.setActivity(event.player, DefaultActivities.activity()));
        }
        if (config.update_skin) {
            this.serenity.network.on(Packet.PlayerSkin, (event) => {
                const player = this.serenity.getPlayer(event.session);
                if (!player) return;
                PresenceMan.static.saveSkin(player, event.packet.skin);
            });
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
    //#endregion

    //#region API functions:
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

    public async clearActivity(player: Player): Promise<void>{
        const xuid = player.xuid;
        const ip = await WebUtils.getSafeIp(player.session.connection.rinfo.address);
        const gamertag = player.username;

        const cfg = this.getConfig();
        const request = new APIRequest(APIRequest.URI_TEST, {}, true);
        request.header("Token", cfg.token);

        request.body("ip", ip);
        request.body("xuid", xuid);
        request.body("server", cfg.server);
        request.body("api_activity", null);

        if (await WebUtils.isFromSameHost(ip)) {
            this.sendErrorMessage(player);
            return;
        }
        const response = await request.request();
        if (response.code === 200) PresenceMan.presences.delete(xuid);
        else PresenceMan.static.logger.warn(`Failed to clear presence for ${gamertag}: ${JSON.parse(response.body).message}`);
    }
    public async setActivity(player: Player, activity: APIActivity): Promise<void>{
        const xuid = player.xuid;
        const ip = await WebUtils.getSafeIp(player.session.connection.rinfo.address);
        const gamertag = player.username;

        const cfg = this.getConfig();
        const request = new APIRequest(APIRequest.URI_TEST, {}, true);
        request.header("Token", cfg.token);

        request.body("ip", ip);
        request.body("xuid", xuid);
        request.body("server", cfg.server);
        if (activity && !activity.client_id) activity.client_id = cfg.client_id;
        request.body("api_activity", activity?.serialize());

        if (await WebUtils.isFromSameHost(ip)) {
            this.sendErrorMessage(player);
            return;
        }
        const response = await request.request();
        if (response.code === 200) {
            if (!activity) PresenceMan.presences.delete(xuid);
            else PresenceMan.presences.set(player.xuid, activity);
        } else PresenceMan.static.logger.warn(`Failed to update presence for ${gamertag}: ${JSON.parse(response.body).message}`);
    }
    /**
     * @internal
     */
    public async saveSkin(player: Player, skin?: SerializedSkin) {
        if (!skin) skin = player.skin;
        const xuid = player.xuid;
        const ip = await WebUtils.getSafeIp(player.session.connection.rinfo.address);
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

        if (await WebUtils.isFromSameHost(ip)) {
            this.sendErrorMessage(player);
            return;
        }
        await request.request();
    }
    /**
     * @internal
     */
    public async offline(player: Player): Promise<void>{
        const xuid = player.xuid;
        const ip = await WebUtils.getSafeIp(player.session.connection.rinfo.address);

        const cfg = this.getConfig();
        const request = new APIRequest(APIRequest.URI_UPDATE_OFFLINE, {}, true);
        request.header("Token", cfg.token);

        request.body("ip", ip);
        request.body("xuid", xuid);

        if (await WebUtils.isFromSameHost(ip)) {
            this.sendErrorMessage(player);
            return;
        }
        await request.request();
        PresenceMan.presences.delete(xuid);
    }
    //#endregion

    //#region  Other functions:
    private sendErrorMessage(player: Player): void{
        player.sendMessage("§l§c»§r §7Presence-Man wouldn't work on a local server!")
    }
    //#endregion
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
