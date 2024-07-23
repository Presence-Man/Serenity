/*
 * Copyright (c) Jan Sohn / xxAROX
 * All rights reserved.
 * I don't want anyone to use my source code without permission.
 */

import { ActivityType } from "./ActivityType";
import PresenceMan from "../PresenceMan";

export class APIActivity {
	client_id: null|string;
	type: ActivityType;
	state: string | null;
	details: string | null;
	end: number | null;
	large_icon_key: string | null;
	large_icon_text: string | null;
	party_max_player_count: number | null;
	party_player_count: number | null;

	constructor(
		type?: ActivityType,
		client_id?: null|string,
		state?: null|string,
		details?: null|string,
		end?: null|number,
		large_icon_key?: null|string,
		large_icon_text?: null|string,
		party_max_player_count?: null|number,
		party_player_count?: null|number,
	) {
		this.type = type || ActivityType.PLAYING;
		this.state = state || null;
		this.details = details || null;
		this.end = end || null;
		this.large_icon_key = large_icon_key || null;
		this.large_icon_text = large_icon_text || null;
		this.party_max_player_count = party_max_player_count || null;
		this.party_player_count = party_player_count || null;
		this.client_id = client_id || null;
	}

	serialize(): any {
		return {
			client_id: this.client_id,
			type: this.type,
			state: this.state,
			details: this.details,
			end: this.end,
			large_icon_key: this.large_icon_key,
			large_icon_text: this.large_icon_text,
			party_max_player_count: this.party_max_player_count,
			party_player_count: this.party_player_count,
		};
	}

	static deserialize(json: any): APIActivity {
		const activity = new APIActivity(ActivityType.PLAYING, null, null, null, null, null, null, null, null, );
		activity.client_id = json.client_id;
        // @ts-ignore
		activity.type = json.type ? ActivityType[(json.type || "playing").toUpperCase()] : ActivityType.PLAYING;
		activity.state = json.state ? json.state : json.state || null;
		activity.details = json.details ? json.details : json.details || null;
		activity.end = json.end ? json.end : json.end || null;
		activity.large_icon_key = json.large_icon_key ? json.large_icon_key : json.large_icon_key || null;
		activity.large_icon_text = json.large_icon_text ? json.large_icon_text : json.large_icon_text || null;
		activity.party_max_player_count = json.party_max_player_count ? json.party_max_player_count : json.party_max_player_count || null;
		activity.party_player_count = json.party_player_count ? json.party_player_count : json.party_player_count || null;
		return activity;
	}
}
export type DefaultActivity = DefaultActivities;
export class DefaultActivities {
	public static activity(): APIActivity{
			const cfg = PresenceMan.static.getConfig().default_presence;
		return new APIActivity(
			ActivityType.PLAYING,
			null,
			cfg.state,
			cfg.details,
			null,
			cfg.large_image_key,
			cfg.large_image_text,
			null,
			null
		)
	}
	/**
	 * time = Date.now()
	 */
	public static ends_in(time: number, base: null|APIActivity = null): APIActivity{
		if (!base) base = this.activity();
		base.end = time;
		return base;
	}
	public static players_left(current_players: number, max_players: number, base: null|APIActivity = null): APIActivity{
		if (!base) base = this.activity();
		base.party_player_count = current_players;
		base.party_max_player_count = max_players;
		return base;
	}
}
