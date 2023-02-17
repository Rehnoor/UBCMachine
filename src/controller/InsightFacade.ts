import * as zip from "jszip";
import * as fs from "fs-extra";

import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
} from "./IInsightFacade";
import {DataFrame, Section} from "./InsightDataFrame";
import {LogicNode, MathNode, Node, StringNode} from "./InsightNode";
import {QueryEngine} from "./QueryEngine";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	private readonly dataFrames: DataFrame[];
	private readonly queryEngine: QueryEngine;
	constructor() {
		// TODO: we cannot make ANY assumptions about the contents of the data directory
		// 		 --> make sure that we only create new dataframes from good objects (that have all keys)
		//		 --> must be changed if we store anything other than datasets in the data directory
		this.dataFrames = [];
		this.queryEngine = new QueryEngine();
		fs.ensureDirSync("./data/");
		let fileNames = fs.readdirSync("./data/");
		for (let fileName of fileNames) {
			if (fileName.includes(".json")) {
				let dataFrame = fs.readJsonSync("./data/" + fileName);
				this.dataFrames.push(this.createDataFrameFromObject(dataFrame));
			}
			// NOTE: need to actually create a "new DataFrame" instance or else we can't call DataFrame methods
			//       like getID etc
		}
	}
	// MAKE SURE the object passed to this method has all the fields of a DataFrame
	private createDataFrameFromObject(obj: object): DataFrame {
		// This feels a bit hacky
		// must be changed if we store anything else in the data directory other than persisted datasets
		let result = new DataFrame("this should be changed", InsightDatasetKind.Rooms);
		return Object.assign(result, obj);
	}

	public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		if (!this.validateID(id) || kind === InsightDatasetKind.Rooms) {
			return Promise.reject(new InsightError("Invalid ID / kind parameter"));
		}
		for (let dataSet of this.dataFrames) {
			if (dataSet.getID() === id) {
				return Promise.reject(new InsightError("This ID has already been added"));
			}
		}
		let newDataFrame = new DataFrame(id, kind);
		return new Promise<string[]>((resolve, reject) => {
			this.convertFilesToString(content)
				.then((jsonCourseArray) => {
					this.parseStringDataToSections(jsonCourseArray, newDataFrame);
					if (newDataFrame.getNumRows() === 0) {
						reject(new InsightError("Zip file contained no valid sections: check formatting"));
					}
					this.dataFrames.push(newDataFrame);
					let dataFrameIDs = [];
					for (let df of this.dataFrames) {
						dataFrameIDs.push(df.getID());
					}
					// NOTE: should we be doing any error handling with writing to disk...
					fs.outputJsonSync("./data/" + id + ".json", newDataFrame);
					resolve(dataFrameIDs);
				})
				.catch((error) => {
					reject(new InsightError("An error occurred during parsing process"));
				});
		});
	}
	// parses json section data from courseArray and pushes into dataFrame
	private parseStringDataToSections(courseArray: string[], dataFrame: DataFrame) {
		let requiredSectionKeys = [
			"id",
			"Course",
			"Title",
			"Professor",
			"Subject",
			"Year",
			"Avg",
			"Pass",
			"Fail",
			"Audit",
		];
		for (let jsonCourse of courseArray) {
			// NOTE: the jsonCourse is not guaranteed to be in valid json format
			// parse jsonCourse (string) into course (object)
			try {
				const course = JSON.parse(jsonCourse);
				// only proceed if parsed json object has a result key
				if (course !== null && Object.prototype.hasOwnProperty.call(course, "result")) {
					for (let section of course.result) {
						const hasAllKeys = requiredSectionKeys.every((k) => k in section);
						if (hasAllKeys) {
							const newSection = new Section(
								String(section.id),
								section.Course,
								section.Title,
								section.Professor,
								section.Subject,
								+section.Year,
								section.Avg,
								section.Pass,
								section.Fail,
								section.Audit
							);
							dataFrame.addSection(newSection);
						}
					}
				}
			} catch (error) {
				// NOTE: we don't want to stop parsing just because we encounter one badly formatted file
				console.log("encountered a poorly formatted json string in parseStringDataToSections");
			}
		}
	}
	// returns each file contained in "courses" directory of zip file in string format
	// NOTE: returned valued are NOT guaranteed to be in valid JSON format
	private async convertFilesToString(content: string): Promise<string[]> {
		return zip.loadAsync(content, {base64: true}).then((zipFile) => {
			const jsonPromises: Array<Promise<string>> = [];
			zipFile.folder("courses")?.forEach((relativePath, file) => {
				const stringData = zipFile.file(file.name)?.async("string");
				if (stringData !== undefined) {
					jsonPromises.push(stringData);
				}
			});
			return Promise.all(jsonPromises);
		});
	}

	private validateID(id: string): boolean {
		if (id.length === 0) {
			return false;
		}
		let hasCharacters = false;
		for (let c of id) {
			if (c === "_") {
				return false;
			}
			if (c !== " ") {
				hasCharacters = true;
			}
		}
		return hasCharacters;
	}

	public removeDataset(id: string): Promise<string> {
		if (!this.validateID(id)) {
			return Promise.reject(new InsightError("Invalid ID format"));
		}
		return new Promise<string>((resolve, reject) => {
			for (let dataSetIndex in this.dataFrames) {
				if (this.dataFrames[dataSetIndex].getID() === id) {
					this.dataFrames.splice(Number(dataSetIndex), 1); // Remove from program memory
					fs.removeSync("./data/" + id + ".json"); // Remove from disk memory
					resolve(id);
				}
			}
			reject(new NotFoundError("A DataSet with given ID was not found"));
		});
	}
	private getTreeID(tree: Node): string {
		if (tree.getChildren().length === 0) {
			return tree.getdataID();
		} else {
			return this.getTreeID(tree.getChildren()[0]);
		}
	}
	private frameIDMatch(treeID: string): boolean {
		for (let x in this.dataFrames) {
			if (this.dataFrames[x].getID() === treeID) {
				return true;
			}
		}
		return false;
	}
	private dataIDConsistencyCheck(tree: Node, treeID: string): boolean {
		if (tree.getChildren().length === 0) {
			return tree.getdataID() === treeID;
		} else {
			let check: boolean = true;
			for (let x in tree.getChildren()) {
				check = check && this.dataIDConsistencyCheck(tree.getChildren()[x], treeID);
			}
			return check;
		}
	}
	private dataIDisValid(tree: Node): boolean {
		let treeID: string = this.getTreeID(tree);
		if (!this.frameIDMatch(treeID)) {
			throw new InsightError("The dataid referenced in the query does not match any dataset currently added");
		} else {
			if (this.dataIDConsistencyCheck(tree, treeID)) {
				return true;
			} else {
				throw new InsightError("The dataID in this query is not the same for all leaf nodes");
			}
		}
	}
	public performQuery(query: unknown): Promise<InsightResult[]> {
		if (query === null) {
			return Promise.reject(new InsightError("Query can not be null"));
		} else if (typeof query === "object") {
			let invalidBlocks: boolean = Object.keys(query).length !== 2;
			if (Object.keys(query).includes("WHERE") && Object.keys(query).includes("OPTIONS") && !invalidBlocks) {
				let whereBlockIndex = Object.keys(query).indexOf("WHERE");
				let optionsBlockIndex = Object.keys(query).indexOf("OPTIONS");
				let topLevelVals = Object.values(query);
				let optionsVal: any = topLevelVals[optionsBlockIndex];
				// NO COLUMNS BLOCK
				if (!Object.keys(optionsVal).includes("COLUMNS")) {
					return Promise.reject(new InsightError("Valid query must include COLUMNS portion"));
				}
				let columnsIndex: number = Object.keys(optionsVal).indexOf("COLUMNS");
				let columnsVal: any = Object.values(optionsVal)[columnsIndex];
				// COLUMNS IS EMPTY
				if (Object.values(columnsVal).length === 0) {
					return Promise.reject(new InsightError("COLUMNS section must have at least one key"));
				}
				let columnList: string[] = Object.values(columnsVal);
				// ***********OPTIONS STUFF***********
				let orderIndex: number = Object.keys(optionsVal).indexOf("ORDER");
				let orderVal: any = Object.values(optionsVal)[orderIndex];
				this.validateColumnsAndOrder(optionsVal, columnList, orderVal);
				// ***********************************
				// ************WHERE STUFF***********
				// TODO: do this check in runQuery
				if (Object.values(query)[whereBlockIndex].length === 0) {
					return Promise.resolve([]); // perform query, but if number of results is > 5000, reject
				}
				let whereVal: any = topLevelVals[whereBlockIndex];
				try {
					let queryTree: Node = this.queryEngine.buildWhereTree(whereVal);
					if (!this.dataIDisValid(queryTree)) {
						return Promise.reject(new InsightError("Entered dataid is not valid"));
					}
					let dataIDForQuery: string = this.queryEngine.getDataID(queryTree);
					for (let dataFrame of this.dataFrames) {
						if (dataFrame.getID() === dataIDForQuery) {
							// perform query on dataframe
							// return the result
							let result = this.queryEngine.runQuery(dataFrame, queryTree, columnList, orderVal);
							return Promise.resolve(result);
						}
					}
				}  catch (e) {
					return Promise.reject(e);
				}
			} else {
				return Promise.reject(new InsightError("Query must have only WHERE and OPTIONS block"));
			}
		}
		return Promise.reject(new InsightError("query must be of type object"));
	}
	// THROWS: InsightError
	private validateColumnsAndOrder(optionsVal: object, columnList: string[], orderVal: any) {
		if (Object.keys(optionsVal).includes("ORDER")) {
			// it is ordered
			if(!this.queryEngine.isValidColumnsWOrder(columnList, this.dataFrames, orderVal)) {
				throw new InsightError("Column or order arguments are invalid");
			}
		} else { // no order
			if (!this.queryEngine.isValidColumns(columnList, this.dataFrames)) {
				throw new InsightError("Column arguments are invalid");
			}
		}
	}
	public listDatasets(): Promise<InsightDataset[]> {
		let result: InsightDataset[] = [];
		for (let dataSet of this.dataFrames) {
			result.push({
				id: dataSet.getID(),
				kind: dataSet.getKind(),
				numRows: dataSet.getNumRows(),
			});
		}
		return Promise.resolve(result);
	}
}
