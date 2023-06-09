import Server from "../../src/rest/Server";
import InsightFacade from "../../src/controller/InsightFacade";
import {expect} from "chai";
import request, {Response} from "supertest";
import * as fs from "fs-extra";
import {clearDisk} from "../TestUtil";

describe("Server", () => {

	let SERVER_URL = "http://localhost:4321";
	let facade: InsightFacade;
	let server: Server;

	before(async () => {
		clearDisk();
		facade = new InsightFacade();
		server = new Server(4321);
		// TODO: start server here once and handle errors properly
		await server.start();
	});

	after(async () => {
		// TODO: stop server here once!
		await server.stop();
		clearDisk();
	});

	beforeEach(() => {
		// might want to add some process logging here to keep track of what's going on
	});

	afterEach(() => {
		// might want to add some process logging here to keep track of what's going on
	});

	// Sample on how to format PUT requests
	/*
	it("PUT test for courses dataset", async () => {
		try {
			return request(SERVER_URL)
				.put(ENDPOINT_URL)
				.send(ZIP_FILE_DATA)
				.set("Content-Type", "application/x-zip-compressed")
				.then((res: Response) => {
					expect(res.status).to.be.equal(200);
					// more assertions here
				})
				.catch((err) => {
					// some logging here please!
					expect.fail();
				});
		} catch (err) {
			// and some more logging here!
		}
	});
	 */

	it("PUT test for courses dataset (SUCCESS)", async () => {
		let ENDPOINT_URL = "/dataset/sections/sections";
		let ZIP_FILE_DATA = fs.readFileSync("test/resources/archives/pair.zip");
		// this should be converted to base64 in server
		try {
			return request(SERVER_URL)
				.put(ENDPOINT_URL)
				.send(ZIP_FILE_DATA)
				.set("Content-Type", "application/x-zip-compressed")
				.then((res: Response) => {
					expect(res.status).to.be.equal(200);
					expect(res.body).to.deep.equal({result: ["sections"]});
					// more assertions here
				})
				.catch((err) => {
					// some logging here please!
					console.log("Unexpected response!");
					console.log(err);
					expect.fail();
				});
		} catch (err) {
			// and some more logging here!
			console.log("request failed!");
		}
	});
	it("GET test for  dataset (SUCCESS)", async () => {
		let ENDPOINT_URL = "/datasets";
		// let ZIP_FILE_DATA = fs.readFileSync("test/resources/archives/pair.zip");
		// this should be converted to base64 in server
		try {
			return request(SERVER_URL)
				.get(ENDPOINT_URL)
				.then((res: Response) => {
					expect(res.status).to.be.equal(200);
					expect(res.body).to.deep.equal({result: [{id: "sections", kind: "sections", numRows: 64612}]});
				})
				.catch((err) => {
					// some logging here please!
					console.log("Shouldnt get a fail");
					console.log(err);
					expect.fail();
				});
		} catch (err) {
			// and some more logging here!
			console.log("Shouldnt get a fail");
		}
	});
	it("POST test for sections dataset (SUCCESS)", async () => {
		let ENDPOINT_URL = "/query";
		let queryResult = fs.readFileSync("test/resources/queries/serverTests/BasicQueryResult.json");
		// console.log(JSON.parse());

		// this should be converted to base64 in server
		try {
			return request(SERVER_URL)
				.post(ENDPOINT_URL)
				.send({
					WHERE: {
						EQ: {
							sections_avg: 97
						}
					},
					OPTIONS: {
						COLUMNS: [
							"sections_dept",
							"sections_avg"
						],
						ORDER: "sections_avg"
					}
				})
				.set("Content-Type", "application/json")
				.then((res: Response) => {
					expect(res.status).to.be.equal(200);
					expect(res.body).to.deep.equal({result:[
						{sections_dept:"crwr",sections_avg:97},
						{sections_dept:"epse",sections_avg:97},
						{sections_dept:"psyc",sections_avg:97}]});
					// more assertions here
				})
				.catch((err) => {
					// some logging here please!
					console.log("Unexpected response!");
					console.log(err);
					expect.fail();
				});
		} catch (err) {
			// and some more logging here!
			console.log("request failed!");
		}
	});
	// The other endpoints work similarly. You should be able to find all instructions at the chai-http documentation
});
