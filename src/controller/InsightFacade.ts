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
import {LogicNode, MathNode, Node, StringNode, SMH} from "./InsightNode";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	private readonly dataFrames: DataFrame[];
	private readonly bro: SMH;
	constructor() {
		// TODO: we cannot make ANY assumptions about the contents of the data directory
		// 		 --> make sure that we only create new dataframes from good objects (that have all keys)
		//		 --> must be changed if we store anything other than datasets in the data directory
		this.dataFrames = [];
		this.bro = new SMH();
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
					// console.log("jsonData length =", jsonCourseArray.length);
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
								section.id,
								section.Course,
								section.Title,
								section.Professor,
								section.Subject,
								section.Year,
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
	private doSomething(query: object): boolean {
		console.log(Object.entries(query));
		console.log(Object.keys(query));
		console.log(Object.values(query));
		console.log("__________");
		let k = Object.keys(query);
		let v = Object.values(query);
		let whereIndex = k.indexOf("WHERE");
		let whereVal = v[whereIndex];
		console.log(whereIndex);
		console.log(whereVal);
		console.log("__________");
		let and = Object.keys(whereVal)[0];
		let andArgs = Object.values(whereVal);
		console.log("Only one key: " + and);
		console.log("Values corresponding to AND: ");
		console.log(andArgs);
		console.log(andArgs[0]); // array
		let wdwd: any = andArgs[0];
		for (let x in wdwd) {
			console.log(wdwd[x]);
			console.log(Object.keys(wdwd[x]));
			console.log(Object.values(wdwd[x]));
			let y: any = Object.values(wdwd[x])[0];
			console.log(y);
			console.log(Object.keys(y));
			console.log(Object.values(y));
		}
		return false;
	}
	public performQuery(query: unknown): Promise<InsightResult[]> {
		if (query === null) {
			return Promise.resolve([]);
		} else if (typeof query === "object") {
			console.log("query is an object so we good");
			if (Object.keys(query).includes("WHERE") && Object.keys(query).includes("OPTIONS")) {
				let x = Object.keys(query).indexOf("WHERE");
				if (Object.values(query)[x].length === 0) {
					return Promise.resolve([]); // return all objects and format according to OPTIONS
				}
				let topLevelKeys = Object.keys(query);
				let topLevelVals = Object.values(query);
				let whereIndex = topLevelKeys.indexOf("WHERE");
				let whereVal: any = topLevelVals[whereIndex];
				this.bro.buildWhereTree(whereVal);
			}
		}
		return Promise.resolve([]);
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
