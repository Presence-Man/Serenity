import { SerializedSkin } from "@serenityjs/protocol";
import { lookup } from 'node:dns';
import * as https from "node:https";
import * as http from "node:http";
import sharp = require('sharp');

export namespace WebUtils {
	export interface Response {
		code: number
		body: string
	}

	function followRedirect(originalUrl: string, res: http.IncomingMessage, method: string, body: string | null, headers: {[k: string]: string}, resolve: (response: Response) => void, reject: (error: any) => void) {
		const location = res.headers.location;
		if (!location) {
			reject(new Error("Redirect location not found"));
			return;
		}
		const newUrl = new URL(location, originalUrl).toString();
		if (method === 'GET') {
			get(newUrl, headers).then(resolve).catch(reject);
		} else if (method === 'POST') {
			post(newUrl, JSON.parse(body ?? '{}'), headers).then(resolve).catch(reject);
		}
	}

	export function get(url: string, headers: {[k: string]: string} = {}): Promise<Response> {
		return new Promise<Response>(async (resolve, reject) => {
			https
				.request(url, (res) => {
					let data = "";
					res
						.on("data", ch => data += ch)
						.on("error", reject)
						.on("close", () => {
							if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400) {
								followRedirect(url, res, 'GET', null, headers, resolve, reject);
							} else {
								resolve({
									body: data,
									code: res.statusCode ?? 404
								});
							}
						})
					;
				})
				.end()
			;
		});
	}
	
	export function post(url: string, body: {[k: string]: any} = {}, headers: {[k: string]: string} = {}): Promise<Response>{
		return new Promise<Response>(async (resolve, reject) => {
			const bodyData = JSON.stringify(body);
			headers["Content-Type"] = "application/json";
			// @ts-ignore
			headers["Content-Length"] = Buffer.byteLength(bodyData);
			const req = https.request(url, {method:"post", headers:headers,}, (res) => {
				let data = "";
				res
					.on("data", ch => data += ch)
					.on("error", reject)
					.on("close", () => {
						if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400) {
							followRedirect(url, res, 'POST', null, headers, resolve, reject);
						} else {
							resolve({
								body: data,
								code: res.statusCode ?? 404
							});
						}
					})
				;
			});
			req.write(bodyData);
			req.end();
		});
	}

	export function isFromSameHost(ip: string): Promise<boolean> {
		return new Promise((resolve) => {
			lookup(ip, {
				all: true,
				family: "IPv4"
			}, (err, addresses) => {
				if (err) {
					resolve(false);
					return;
				}
				if (!addresses[0]) return;
				const ip = addresses[0].address;
				var parts = ip.split('.');
				const isLocalAddress = parts[0] === "127"
					|| parts[0] === "0"
					|| parts[0] === '10'
					// @ts-ignore
					|| (parts[0] === '172' && (parseInt(parts[1], 10) >= 16 && parseInt(parts[1], 10) <= 31))
					|| (parts[0] === '192' && parts[1] === '168' && (parseInt(parts[1], 10) >= 16 && parseInt(parts[1], 10) <= 31))
				;
				resolve(isLocalAddress);
			});
		});
	}
}

export namespace SkinUtils {
	export function convertSkinToBase64File(skin: SerializedSkin): Promise<string | null> {
        return new Promise(async (resolve, reject) => {
			if (skin.isPersona) {
                resolve(null);
                return;
            }
            const image = fromSkinToImage(skin);
            if (!image) {
                resolve(null);
                return;
            }
            image.toBuffer((err, buffer) => {
                if (err) {
                    console.error('Error converting image to buffer:', err);
                    resolve(null);
                    return;
                }
                resolve(buffer.toString('base64'));
            });
        });
    }

    function fromSkinToImage(skin: SerializedSkin): sharp.Sharp {
        const skinData = skin.skinImage.data;
        let width: number, height: number;

        switch (skinData.length) {
            case 8192: {
                width = 64;
                height = 32;
                break;
            }
            case 16384: {
                width = 64;
                height = 64;
                break;
            }
            case 32768: {
                width = 128;
                height = 64;
                break;
            }
            case 65536: {
                width = 128;
                height = 128;
                break;
            }
            default: {
                throw new Error('Invalid skin data length');
            }
        }
        return sharp(Buffer.from(skinData), { raw: { width, height, channels: 4 } });
    }
}
