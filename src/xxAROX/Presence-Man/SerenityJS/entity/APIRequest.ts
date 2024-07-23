import { WebUtils } from "../utils";
import { Gateway } from "./Gateway";
import PresenceMan from "../PresenceMan";

export class APIRequest {
    public static readonly URI_UPDATE_PRESENCE = "/api/v1/servers/update_presence";
    public static readonly URI_UPDATE_SKIN = "/api/v1/images/skins/update";
    public static readonly URI_UPDATE_OFFLINE = "/api/v1/servers/offline";
    public static readonly URI_GET_SKIN = "/api/v1/images/skins/";
    public static readonly URI_GET_HEAD = "/api/v1/images/heads/";

    private _headers: {[key: string]: string} = {};
    private _body: {[key: string]: string} = {};
    private postMethod: boolean;
    private uri: string;

    constructor(uri: string, body: {[key: string]: string}, postMethod: boolean) {
        this.header("Content-Type", "application/json");
        this.uri = uri;
        this._body = body;
        this.postMethod = postMethod;
        this.header("Serversoftware", "BDSX");
        this.header("User-Agent", "Presence-Man BDSX client/"+PresenceMan.static.plugin.config.version)
    }

    getUri(): string{
        return this.uri;
    }

    header(key: string, value: string): APIRequest{
        this._headers[key] = value;
        return this;
    }

    public get headers(): {[key: string]: string}{
        return this._headers;
    }

    body(key: string, value: string): APIRequest{
        this._body[key] = value;
        return this;
    }

    isPostMethod(): boolean{
        return this.postMethod;
    }

    public async request(): Promise<WebUtils.Response>{
        try {
            let response;
            if (this.postMethod) response = await WebUtils.post(Gateway.getUrl() + this.uri, this._body, this.headers);
            else response = await WebUtils.get(Gateway.getUrl() + this.uri, this.headers);

            return response;
        } catch (e) {
            PresenceMan.static.logger.error("Error while API request: ", e);
        }
        return {
            body: JSON.stringify({
                success: false,
                status: 404,
                message: "Not found!"
            }),
            code: 404
        }
    }
}