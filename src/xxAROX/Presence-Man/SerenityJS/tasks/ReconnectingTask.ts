import { Gateway } from "../entity/Gateway";
import PresenceMan from "../PresenceMan";

export class ReconnectingTask {
    public static active: boolean = false;
    private static task: null|NodeJS.Timeout = null;

    public static activate(): void{
        if (this.active) return;
        this.active = true;
        this.task = setInterval(() => ReconnectingTask.onRun, 5000);
    }
    public static deactivate(): void{
        if (!this.active) return;
        if (this.task) clearInterval(this.task);
        this.task = null;
        this.active = false;
    }

    public static onRun(): void{
        Gateway.ping_backend((works) => {
            if (works) {
                PresenceMan.static.plugin.logger.debug("Reconnected!");
                ReconnectingTask.deactivate();
            }
        });
    }
}
