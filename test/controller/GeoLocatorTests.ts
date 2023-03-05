import {expect, use} from "chai";
import chaiAsPromised from "chai-as-promised";
import GeoFetcher from "../../src/controller/GeoLocator";
import {InsightError} from "../../src/controller/IInsightFacade";

use(chaiAsPromised);

describe("GeoFetcher", function() {

	let geoFetcher: GeoFetcher;

	before(function () {
		geoFetcher = new GeoFetcher();
	});

	it("should successfully return a georesponse", async function () {
		const addy = "6245 Agronomy Road V6T 1Z4";
		const result = await geoFetcher.getCoordinates(addy);
		expect(result).deep.equal({lat: 49.26125, lon: -123.24807});
	});

	it("should reject invalid address with InsightError", function () {
		const addy = "6245 Agronomy Road V6T 1";
		const result = geoFetcher.getCoordinates(addy);
		expect(result).to.eventually.be.rejectedWith(InsightError);
	});
});
