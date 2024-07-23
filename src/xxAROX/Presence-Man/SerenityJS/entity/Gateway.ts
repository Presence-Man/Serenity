import { WebUtils } from "../utils";
import { ReconnectingTask } from "../tasks/ReconnectingTask";
import PresenceMan from "../PresenceMan";

export class Gateway {
    public static protocol: string = "http://";
    public static address: string = "127.0.0.1";
    public static port: number | null = null;
    public static broken: boolean = false;

    public static async fetchGatewayInformation(): Promise<void>{
        try {
            const url = "https://raw.githubusercontent.com/Presence-Man/Gateway/main/gateway.json";
            const response = await WebUtils.get(url);
            if (response.code != 200) PresenceMan.static.logger.warn("Couldn't fetch gateway information!");
            else {
                const json = JSON.parse(response.body);
                this.protocol = json.protocol;
                this.address = json.address;
                this.port = !json.port ? null : json.port;
                Gateway.ping_backend((success) => {
                    if (!success) PresenceMan.static.logger.error("Error while connecting to backend-server!")
                });
            }
        } catch (e) {
            PresenceMan.static.logger.error("Error while fetching gateway information: ", e);
        }
    }

    public static ping_backend(callback?: (success: boolean) => void): void{
        if (ReconnectingTask.active) return;
        const res = WebUtils.get(Gateway.getUrl()).then((res) => {
            if (res.code != 200) {
                Gateway.broken = true;
                ReconnectingTask.activate();
            } else {
                ReconnectingTask.deactivate();
                PresenceMan.static.logger.info("This server will be displayed as '" + PresenceMan.static.getConfig().server + "' in presences!");
            }
            if (callback) callback(res.code === 200);
        });
    }

    public static getUrl(): string {
        if (this.broken) {
            throw new Error("Presence-Man Backend server is not reachable");
        }
        return `${this.protocol}${this.address}${this.port !== null ? `:${this.port}` : ''}`;
    }
}
