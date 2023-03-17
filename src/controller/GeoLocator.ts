import * as http from "http";
import {InsightError} from "./IInsightFacade";

export interface GeoResponse {

	lat?: number;
	lon?: number;
	error?: string;

}

export default class GeoFetcher {
	// REQUIRES: address should include postal code
	// THROWS: InsightError
	public getCoordinates(address: string): Promise<GeoResponse>{
		const encodedAddress: string = encodeURI(address);
		const geoHost: string = "http://cs310.students.cs.ubc.ca:11316/api/v1/project_team178/" + encodedAddress;
		return new Promise<GeoResponse>((resolve, reject) => {
			http.get(geoHost, (response) => {
				// not sure in what case this would be undefined???
				if (response.statusCode === undefined || response.statusCode !== 200) {
					return reject(new InsightError("GET request was unsuccessful"));
				}
				let data = "";
				response.on("data", (chunk) => {
					data += chunk;
				});
				response.on("end", () => {
					try {
						let geoResponse = JSON.parse(data);
						resolve(geoResponse);
					} catch (e) {
						reject(new InsightError("Failed to parse geo data to JSON"));
					}
				}).on("error", (e) => {
					reject(new InsightError(e.message));
				});
			});
		});
	}
}
