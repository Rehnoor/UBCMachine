import {
	IInsightFacade,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	ResultTooLargeError,
	NotFoundError
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

	before(function () {
		// This block runs once and loads the datasets.
		sections = getContentFromArchives("pair.zip");

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

		describe("addDataset", function() {
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

			it ("should reject add with invalid ID (empty string)", function() {
				const result = facade.addDataset("", sections, InsightDatasetKind.Sections);
				return expect(result).to.eventually.be.rejectedWith(InsightError);
			});

			it ("should reject add with invalid ID (whitespace only)", function() {
				const result = facade.addDataset("  ", sections, InsightDatasetKind.Sections);
				return expect(result).to.eventually.be.rejectedWith(InsightError);
			});

			it ("should reject add with invalid ID (underscore)", function() {
				const result = facade.addDataset("summer_2013", sections, InsightDatasetKind.Sections);
				return expect(result).to.eventually.be.rejectedWith(InsightError);
			});


			it ("should reject add with kind == Rooms (for c0 at least)", function() {
				const result = facade.addDataset("1288", sections, InsightDatasetKind.Rooms);
				return expect(result).to.eventually.be.rejectedWith(InsightError);
			});

			it("should reject add with duplicate ID", function () {
				const result = facade.addDataset("ubc123", sections, InsightDatasetKind.Sections)
					.then(() => facade.addDataset("ubc123", sections, InsightDatasetKind.Sections));
				return expect(result).to.eventually.be.rejectedWith(InsightError);
			});

			it("should add this valid dataset", function() {
				const result = facade.addDataset("ubc-pairdata", sections, InsightDatasetKind.Sections);
				return expect(result).to.eventually.deep.equal(["ubc-pairdata"]);
			});

			it("should add two valid datasets", async function() {
				await facade.addDataset("ubc-pairdata0", sections, InsightDatasetKind.Sections);
				const result = await facade.addDataset("ubc-pairdata1", sections, InsightDatasetKind.Sections);
				expect(result.length).to.deep.equal(2);
				expect(result).to.contain("ubc-pairdata0");
				expect(result).to.contain("ubc-pairdata1");
			});
		});
		describe("removeDataset", function() {
			beforeEach(async function() {
				await facade.addDataset("ubc-pairdata", sections, InsightDatasetKind.Sections);
			});
			it("should reject remove invalid ID (empty string)", function() {
				const result = facade.removeDataset("");
				return expect(result).to.eventually.be.rejectedWith(InsightError);
			});

			it("should reject remove invalid ID (whitespace)", function() {
				const result = facade.removeDataset("  ");
				return expect(result).to.eventually.be.rejectedWith(InsightError);
			});

			it("should reject remove invalid ID (underscore)", function() {
				const result = facade.removeDataset("ubc_pairdata");
				return expect(result).to.eventually.be.rejectedWith(InsightError);
			});

			it("should reject remove valid ID not found", function () {
				const result = facade.removeDataset("1234abacus");
				return expect(result).to.eventually.be.rejectedWith(NotFoundError);
			});

			it("should successfully remove the dataset", function () {
				const result = facade.removeDataset("ubc-pairdata");
				return expect(result).to.eventually.deep.equal("ubc-pairdata");
			});

			it("should remove first dset successfully, fail to remove again", async function() {
				try {
					const result1 = await facade.removeDataset("ubc-pairdata");
					expect(result1).to.deep.equal("ubc-pairdata");
				} catch (e) {
					expect.fail("Should not reject!");
				}

				try {
					const result2 = await facade.removeDataset("ubc-pairdata");
					expect.fail("ubc-pairdata should no longer exist");
				} catch (e) {
					expect(e).to.be.instanceof(NotFoundError);
				}
			});
		});

		describe("listDatasets", function() {
			it("should fulfill list with empty array", function() {
				const result = facade.listDatasets();
				return expect(result).eventually.to.deep.equal([]);
			});

			it("should fulfill list with one added dataset", async function() {
				await facade.addDataset("dset1", sections, InsightDatasetKind.Sections);
				const result = facade.listDatasets();
				return expect(result).eventually.to.deep.equal([{
					id : "dset1",
					kind : InsightDatasetKind.Sections,
					numRows : 64612
				}]);

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
			const loadDatasetPromises = [
				facade.addDataset("sections", sections, InsightDatasetKind.Sections),
			];

			return Promise.all(loadDatasetPromises);
		});

		after(function () {
			console.info(`After: ${this.test?.parent?.title}`);
			clearDisk();
		});

		type PQErrorKind = "ResultTooLargeError" | "InsightError";
		// NOTE: queries/ordered contains tests which 1) throw errors, 2) specify an ordering
		//       queries/unordered just needs to check that result vs expected contain same values
		// 		 TODO: having trouble figuring out how to assert on the ordered results, if tiebreakers happen
		//             arbitrarily: how to check that results are in order based on one field (ie avg or department)
		//			   when the test doesn't have access to the query?
		folderTest<unknown, InsightResult[], PQErrorKind>(
			"Dynamic InsightFacade PerformQuery tests",
			(input) => facade.performQuery(input),
			"./test/resources/queries",
			{
				assertOnResult: (actual, expected) => {
					expect(actual).to.be.instanceOf(Array);
					expect((actual as InsightResult[]).length).to.deep.equal(expected.length);
					const sortedActual = (actual as InsightResult[]).sort();
					const sortedExpected = expected.sort();
					expect(sortedActual).to.deep.equal(sortedExpected);
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
});
