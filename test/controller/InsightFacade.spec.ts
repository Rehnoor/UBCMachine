import {
	IInsightFacade,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
	ResultTooLargeError,
} from "../../src/controller/IInsightFacade";
import InsightFacade from "../../src/controller/InsightFacade";

import {folderTest} from "@ubccpsc310/folder-test";
import {expect, use} from "chai";
import chaiAsPromised from "chai-as-promised";
import {clearDisk, getContentFromArchives} from "../TestUtil";

use(chaiAsPromised);

describe("InsightFacade", function () {
	let facade: IInsightFacade;

	// Declare datasets used in tests. You should add more datasets like this!
	let sections: string;
	let smallDataset: string;
	let rooms: string;

	before(function () {
		// This block runs once and loads the datasets.
		sections = getContentFromArchives("pair.zip");
		smallDataset = getContentFromArchives("smallValidSet.zip");
		rooms = getContentFromArchives("campus.zip");
		// Just in case there is anything hanging around from a previous run of the test suite
		clearDisk();
	});

	describe("Add/Remove/List Dataset", function () {
		before(function () {
			console.info(`Before: ${this.test?.parent?.title}`);
		});

		beforeEach(function () {
			// This section resets the insightFacade instance
			// This runs before each test
			console.info(`BeforeTest: ${this.currentTest?.title}`);
			facade = new InsightFacade();
		});

		after(function () {
			console.info(`After: ${this.test?.parent?.title}`);
		});

		afterEach(function () {
			// This section resets the data directory (removing any cached data)
			// This runs after each test, which should make each test independent of the previous one
			console.info(`AfterTest: ${this.currentTest?.title}`);
			clearDisk();
		});

		describe("addDataset", function () {
			it("should reject add: no valid sections (completely empty json file)", function () {
				let emptyData: string = getContentFromArchives("empty.zip");
				const result = facade.addDataset("tester", emptyData, InsightDatasetKind.Sections);
				return expect(result).to.eventually.be.rejectedWith(InsightError);
			});

			it("should reject add: result field is empty", function () {
				let badContent: string = getContentFromArchives("noSections.zip");
				const result = facade.addDataset("tester", badContent, InsightDatasetKind.Sections);
				return expect(result).to.eventually.be.rejectedWith(InsightError);
			});

			it("should reject add: course not located in courses/ dir", function () {
				let badContent: string = getContentFromArchives("notcourses.zip");
				const result = facade.addDataset("tester", badContent, InsightDatasetKind.Sections);
				return expect(result).to.eventually.be.rejectedWith(InsightError);
			});

			it("should reject add: course missing query key", function () {
				let badContent: string = getContentFromArchives("missingAvgKey.zip");
				const result = facade.addDataset("tester", badContent, InsightDatasetKind.Sections);
				return expect(result).to.eventually.be.rejectedWith(InsightError);
			});

			it("should reject add: valid section is not within 'result' key", function () {
				let badContent: string = getContentFromArchives("notinresult.zip");
				const result = facade.addDataset("tester", badContent, InsightDatasetKind.Sections);
				return expect(result).to.eventually.be.rejectedWith(InsightError);
			});

			it("should reject add with invalid ID (empty string)", function () {
				const result = facade.addDataset("", sections, InsightDatasetKind.Sections);
				return expect(result).to.eventually.be.rejectedWith(InsightError);
			});

			it("should reject add with invalid ID (whitespace only)", function () {
				const result = facade.addDataset("  ", sections, InsightDatasetKind.Sections);
				return expect(result).to.eventually.be.rejectedWith(InsightError);
			});

			it("should reject add with invalid ID (underscore)", function () {
				const result = facade.addDataset("summer_2013", sections, InsightDatasetKind.Sections);
				return expect(result).to.eventually.be.rejectedWith(InsightError);
			});

			it("should reject add with kind == Rooms but type == sections", function () {
				const result = facade.addDataset("1288", sections, InsightDatasetKind.Rooms);
				return expect(result).to.eventually.be.rejectedWith(InsightError);
			});
			it("should reject add with kind == Sections but type == rooms", function() {
				const result = facade.addDataset("notsure", rooms, InsightDatasetKind.Sections);
				return expect(result).to.eventually.be.rejectedWith(InsightError);
			});
			it("should reject add with duplicate ID", function () {
				const result = facade
					.addDataset("ubc123", smallDataset, InsightDatasetKind.Sections)
					.then(() => facade.addDataset("ubc123", smallDataset, InsightDatasetKind.Sections));
				return expect(result).to.eventually.be.rejectedWith(InsightError);
			});

			it("should add this valid dataset (full pair dataset)", function () {
				const result = facade.addDataset("ubc-pairdata", sections, InsightDatasetKind.Sections);
				return expect(result).to.eventually.deep.equal(["ubc-pairdata"]);
			});
			it("should add this small valid dataset", function () {
				const result = facade.addDataset("smallSet", smallDataset, InsightDatasetKind.Sections);
				return expect(result).to.eventually.deep.equal(["smallSet"]);
			});
			it("should add the full rooms dataset", function() {
				const result = facade.addDataset("roomSet", rooms, InsightDatasetKind.Rooms);
				return expect(result).to.eventually.deep.equal(["roomSet"]);
			});

			it("should add two valid datasets", async function () {
				await facade.addDataset("ubc-data0", smallDataset, InsightDatasetKind.Sections);
				const result = await facade.addDataset("ubc-data1", smallDataset, InsightDatasetKind.Sections);
				expect(result.length).to.deep.equal(2);
				expect(result).to.have.members(["ubc-data0", "ubc-data1"]);
			});
			// TODO: ////////////////// START OF NEW TESTS FOR ROOMS DATASETS ///////////////////////////////
			it("should reject Room dset with no index.htm", function() {
				let badZip = getContentFromArchives("ubcBuildings.zip");
				const result = facade.addDataset("rooms", badZip, InsightDatasetKind.Rooms);
				return expect(result).to.eventually.be.rejectedWith(InsightError);
			});
			it("should add dataset with some bad links in index.htm", function () {
				let zip = getContentFromArchives("notAllLinked.zip");
				const result = facade.addDataset("rooms", zip, InsightDatasetKind.Rooms);
				return expect(result).to.eventually.deep.equal(["rooms"]);
			});
			it("should add rooms dataset where index table is not first table", function () {
				let zip = getContentFromArchives("badFirstTable.zip");
				const result = facade.addDataset("rooms", zip, InsightDatasetKind.Rooms);
				return expect(result).to.eventually.deep.equal(["rooms"]);
			});
			it("should reject add rooms dataset where index table missing img column", function () {
				let zip = getContentFromArchives("badIndex.zip");
				const result = facade.addDataset("rooms", zip, InsightDatasetKind.Rooms);
				return expect(result).to.eventually.be.rejectedWith(InsightError);
			});
		});
		describe("removeDataset", function () {
			it("should reject remove invalid ID (empty string)", function () {
				const result = facade.removeDataset("");
				return expect(result).to.eventually.be.rejectedWith(InsightError);
			});

			it("should reject remove invalid ID (whitespace)", function () {
				const result = facade.removeDataset("  ");
				return expect(result).to.eventually.be.rejectedWith(InsightError);
			});

			it("should reject remove invalid ID (underscore)", function () {
				const result = facade.removeDataset("ubc_pairdata");
				return expect(result).to.eventually.be.rejectedWith(InsightError);
			});

			it("should reject remove valid ID not found", async function () {
				await facade.addDataset("smallData", smallDataset, InsightDatasetKind.Sections);
				const result = facade.removeDataset("1234abacus");
				return expect(result).to.eventually.be.rejectedWith(NotFoundError);
			});

			it("should successfully remove the dataset", async function () {
				await facade.addDataset("smallData", smallDataset, InsightDatasetKind.Sections);
				const result = facade.removeDataset("smallData");
				return expect(result).to.eventually.deep.equal("smallData");
			});

			it("should remove first dset successfully, fail to remove again", async function () {
				await facade.addDataset("smallData", smallDataset, InsightDatasetKind.Sections);
				try {
					const result1 = await facade.removeDataset("smallData");
					expect(result1).to.deep.equal("smallData");
				} catch (e) {
					expect.fail("Should not reject!");
				}

				try {
					await facade.removeDataset("smallData");
					expect.fail("smallData should no longer exist");
				} catch (e) {
					expect(e).to.be.instanceof(NotFoundError);
				}
			});
		});

		describe("listDatasets", function () {
			it("should fulfill list with empty array", function () {
				const result = facade.listDatasets();
				return expect(result).eventually.to.deep.equal([]);
			});

			it("should fulfill list with one added dataset", async function () {
				await facade.addDataset("dset1", smallDataset, InsightDatasetKind.Sections);
				const result = facade.listDatasets();
				return expect(result).eventually.to.deep.equal([
					{
						id: "dset1",
						kind: InsightDatasetKind.Sections,
						numRows: 16,
					},
				]);
			});
			it("should fulfill with 2 added datasets of both kinds", async function() {
				await facade.addDataset("dset1", smallDataset, InsightDatasetKind.Sections);
				await facade.addDataset("dset2", rooms, InsightDatasetKind.Rooms);
				const result = facade.listDatasets();
				return expect(result).eventually.to.deep.equal([
					{
						id: "dset1",
						kind: InsightDatasetKind.Sections,
						numRows: 16,
					},
					{
						id: "dset2",
						kind: InsightDatasetKind.Rooms,
						numRows: 364
					},
				]);
			});
		});
	});

	/*
	 * This test suite dynamically generates tests from the JSON files in test/resources/queries.
	 * You should not need to modify it; instead, add additional files to the queries directory.
	 * You can still make tests the normal way, this is just a convenient tool for a majority of queries.
	 */
	describe("PerformQuery", () => {
		before(function () {
			console.info(`Before: ${this.test?.parent?.title}`);

			facade = new InsightFacade();

			// Load the datasets specified in datasetsToQuery and add them to InsightFacade.
			// Will *fail* if there is a problem reading ANY dataset.
			const loadDatasetPromises = [facade.addDataset("sections", sections, InsightDatasetKind.Sections),
				facade.addDataset("smallData", smallDataset, InsightDatasetKind.Sections),
				facade.addDataset("rooms", rooms, InsightDatasetKind.Rooms)];

			return Promise.all(loadDatasetPromises);
		});

		after(function () {
			console.info(`After: ${this.test?.parent?.title}`);
			clearDisk();
		});

		type PQErrorKind = "ResultTooLargeError" | "InsightError";
		// NOTE: queries/ordered contains tests which 1) throw errors, 2) specify an ordering
		//       queries/unordered just needs to check that result vs expected contain same values
		folderTest<unknown, InsightResult[], PQErrorKind>(
			"PerformQuery tests (unordered)",
			(input) => facade.performQuery(input),
			"./test/resources/queries/unordered",
			{
				assertOnResult: (actual, expected) => {
					expect(actual).to.be.instanceOf(Array);
					expect(actual).to.have.lengthOf(expected.length);
					expect(actual).to.have.deep.members(expected);
				},
				errorValidator: (error): error is PQErrorKind =>
					error === "ResultTooLargeError" || error === "InsightError",
				assertOnError: (actual, expected) => {
					if (expected === "InsightError") {
						expect(actual).to.be.instanceof(InsightError);
					} else if (expected === "ResultTooLargeError") {
						expect(actual).to.be.instanceof(ResultTooLargeError);
					} else {
						// this should be unreachable, performQuery does not throw NotFoundError
						expect.fail("UNEXPECTED ERROR");
					}
				},
			}
		);

		// NOTE: these tests only check for ordering of sections_avg
		//		 query must have "sections_avg" in the COLUMNS argument, so we can actually access them
		folderTest<unknown, InsightResult[], PQErrorKind>(
			"PerformQuery tests (ordered)",
			(input) => facade.performQuery(input),
			"./test/resources/queries/ordered",
			{
				assertOnResult: (actual, expected) => {
					expect(actual).to.be.instanceOf(Array);
					expect(actual).to.have.lengthOf(expected.length);
					expect(actual).to.have.deep.members(expected);
					let minAvg = -1;
					for (let result of actual as InsightResult[]) {
						if (minAvg === -1) {
							minAvg = result["sections_avg"] as number; // this is guaranteed to be a number
						} else {
							expect(result["sections_avg"]).to.be.gte(minAvg);
							minAvg = result["sections_avg"] as number;
						}
					}
				},
				errorValidator: (error): error is PQErrorKind =>
					error === "ResultTooLargeError" || error === "InsightError",
				assertOnError: (actual, expected) => {
					if (expected === "InsightError") {
						expect(actual).to.be.instanceof(InsightError);
					} else if (expected === "ResultTooLargeError") {
						expect(actual).to.be.instanceof(ResultTooLargeError);
					} else {
						// this should be unreachable, performQuery does not throw NotFoundError
						expect.fail("UNEXPECTED ERROR");
					}
				},
			}
		);
	});
	describe("SaveToDisk", function () {
		it("should add dataset (just setup for next test)", function () {
			facade = new InsightFacade();
			const result = facade.addDataset("shouldPersist", smallDataset, InsightDatasetKind.Sections);
			return expect(result).to.eventually.deep.equal(["shouldPersist"]);
			// this is where the system "crashes" and we should ensure dataset remains
		});
		it("should add rooms dataset + persist", function () {
			facade = new InsightFacade();
			const result = facade.addDataset("roomSet", rooms, InsightDatasetKind.Rooms);
			return expect(result).to.eventually.deep.equal(["shouldPersist", "roomSet"]);
		});
		// NOTE: for this test to pass, must run the whole SaveToDisk describe at once
		it("should have the previously added dataset", function () {
			facade = new InsightFacade();
			const result = facade.listDatasets();
			return expect(result).to.eventually.deep.equal([
				{
					id: "roomSet",
					kind: InsightDatasetKind.Rooms,
					numRows: 364,
				},
				{
					id: "shouldPersist",
					kind: InsightDatasetKind.Sections,
					numRows: 16,
				},
			]);
		});
	});
	describe("test empty where block", function() {
		before(function() {
			facade = new InsightFacade();
			const dataSetPromises = [facade.addDataset("smallSet", smallDataset, InsightDatasetKind.Sections)];
			return Promise.all(dataSetPromises);
		});
		it("should should query WOOD 491", function() {
			facade.performQuery({
				WHERE: {},
				OPTIONS: {
					COLUMNS: [
						"smallSet_uuid",
						"smallSet_id",
						"smallSet_dept",
						"smallSet_year"
					]
				}
			});
		});
	});
	// TODO: make a new folderTest to accurately test custom orderings
});
