import {RoomDataSet, Section, SectionDataSet} from "./InsightDataFrame";
import * as fs from "fs-extra";
import {InsightDataset, InsightDatasetKind, InsightError, NotFoundError} from "./IInsightFacade";
import * as zip from "jszip";
import {parse} from "parse5";

export default class DataProcessor {

	// TODO: refactor to just have one array of type DataSet
	public readonly sectionDataSets: SectionDataSet[];
	public readonly roomDataSets: RoomDataSet[];
	constructor() {
		// TODO: store rooms and sections in separate subfolders of data directory
		this.sectionDataSets = [];
		this.roomDataSets = [];
		fs.ensureDirSync("./data/");
		let fileNames = fs.readdirSync("./data/");
		for (let fileName of fileNames) {
			if (fileName.includes(".json")) {
				let dataFrame = fs.readJsonSync("./data/" + fileName);
				this.sectionDataSets.push(this.createDataFrameFromObject(dataFrame));
			}
			// NOTE: need to actually create a "new DataFrame" instance or else we can't call DataFrame methods
			//       like getID etc
		}
	}

	// MAKE SURE the object passed to this method has all the fields of a DataFrame
	private createDataFrameFromObject(obj: object): SectionDataSet {
		// This feels a bit hacky
		// must be changed if we store anything else in the data directory other than persisted datasets
		let result = new SectionDataSet("this should be changed", InsightDatasetKind.Rooms);
		return Object.assign(result, obj);
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

	// parses json section data from courseArray and pushes into dataFrame
	private parseStringDataToSections(courseArray: string[], dataFrame: SectionDataSet) {
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
							let yearVal = +section.Year;
							if ("Section" in section) {
								if (section.Section === "overall") {
									yearVal = 1900;
								}
							}
							const newSection = new Section(
								String(section.id),
								section.Course,
								section.Title,
								section.Professor,
								section.Subject,
								yearVal,
								section.Avg,
								section.Pass,
								section.Fail,
								section.Audit
							);
							dataFrame.addRow(newSection);
						}
					}
				}
			} catch (error) {
				// NOTE: we don't want to stop parsing just because we encounter one badly formatted file
				// console.log("encountered a poorly formatted json string in parseStringDataToSections");
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

	private validateTable(htmlNode: any): boolean {
		return false;
	}

	// Recursive function to find a valid table from htmlNode
	// Returns undefined if no valid tables exist
	private findValidTable(htmlNode: any): any {
		if (htmlNode === null || htmlNode === undefined) {
			return undefined;
		}
		if (htmlNode.nodeName === "table") {
			console.log("found a table!");
			// validate this table (does it have all required keys)
			if (this.validateTable(htmlNode)) {
				return htmlNode;
			} else {
				return undefined;
			}
		}
		// check for child nodes
		if (htmlNode.childNodes !== undefined){
			for (let child of htmlNode.childNodes) {
				const childResult = this.findValidTable(child);
				if (childResult !== undefined) {
					return childResult;
				}
			}
		}
	}

	private parseRoomData(id: string, content: string): Promise<string[]> {
		// TODO: this is clearly duplicate of addDataset with sections -> refactor
		for (let dataSet of this.roomDataSets) {
			if (dataSet.getID() === id) {
				return Promise.reject(new InsightError("This ID has already been added"));
			}
		}
		let newDataFrame = new RoomDataSet(id, InsightDatasetKind.Rooms);
		zip.loadAsync(content, {base64: true}).then(async (fileData) => {
			const htmlText = await fileData.file("index.htm")?.async("string");
			if (htmlText === null || htmlText === undefined) {
				return Promise.reject(new InsightError("No index.htm file present"));
			}
			const docTree = parse(htmlText);
			let htmlTree;
			for (let htmlNode of docTree.childNodes) {
				if (htmlNode.nodeName === "html") {
					htmlTree = htmlNode;
					break;
				}
			}
			if (htmlTree === undefined) {
				return Promise.reject(new InsightError("Poorly formatted html"));
			}
			// recursively search this htmlTree for tables -> check if the tables are valid
			const tableNode = this.findValidTable(htmlTree);
			console.log(tableNode);
		});
		return Promise.reject();
	}

	public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		if (!this.validateID(id)) {
			return Promise.reject(new InsightError("Invalid ID parameter"));
		}
		if (kind === InsightDatasetKind.Rooms) {
			return this.parseRoomData(id, content);
		}
		for (let dataSet of this.sectionDataSets) {
			if (dataSet.getID() === id) {
				return Promise.reject(new InsightError("This ID has already been added"));
			}
		}
		let newDataFrame = new SectionDataSet(id, kind);
		return new Promise<string[]>((resolve, reject) => {
			this.convertFilesToString(content)
				.then((jsonCourseArray) => {
					this.parseStringDataToSections(jsonCourseArray, newDataFrame);
					if (newDataFrame.getNumRows() === 0) {
						reject(new InsightError("Zip file contained no valid sections: check formatting"));
					}
					this.sectionDataSets.push(newDataFrame);
					let dataFrameIDs = [];
					for (let df of this.sectionDataSets) {
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

	public removeDataset(id: string): Promise<string> {
		if (!this.validateID(id)) {
			return Promise.reject(new InsightError("Invalid ID format"));
		}
		return new Promise<string>((resolve, reject) => {
			for (let dataSetIndex in this.sectionDataSets) {
				if (this.sectionDataSets[dataSetIndex].getID() === id) {
					this.sectionDataSets.splice(Number(dataSetIndex), 1); // Remove from program memory
					fs.removeSync("./data/" + id + ".json"); // Remove from disk memory
					resolve(id);
				}
			}
			reject(new NotFoundError("A DataSet with given ID was not found"));
		});
	}

	public listDatasets(): Promise<InsightDataset[]> {
		let result: InsightDataset[] = [];
		for (let dataSet of this.sectionDataSets) {
			result.push({
				id: dataSet.getID(),
				kind: dataSet.getKind(),
				numRows: dataSet.getNumRows(),
			});
		}
		return Promise.resolve(result);
	}
}
