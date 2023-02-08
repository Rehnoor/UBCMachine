import * as zip from "jszip";
import * as fs from "fs-extra";

import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError
} from "./IInsightFacade";
import {DataFrame, Section} from "./InsightDataFrame";
import {outputJsonSync} from "fs-extra";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	private readonly dataFrames: DataFrame[];
	constructor() {
		this.dataFrames = [];
		fs.ensureDirSync("./data/");
		fs.readdirSync("./data/").forEach((jsonDataFrame) => {
			// we only write valid json to disk, is it safe to assume that the data read is well formatted?
			let dataFrame: DataFrame = JSON.parse(jsonDataFrame);
			this.dataFrames.push(dataFrame);
		});
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
			this.convertFilesToString(content).then((jsonCourseArray) => {
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
				outputJsonSync("./data/" + id + ".json", newDataFrame);
				resolve(dataFrameIDs);
			}).catch((error) => {
				reject(new InsightError("An error occurred during parsing process"));
			});
		});
	}
	// parses json section data from courseArray and pushes into dataFrame
	private parseStringDataToSections(courseArray: string[], dataFrame: DataFrame) {
		let requiredSectionKeys = ["id", "Course", "Title", "Professor", "Subject",
			"Year", "Avg", "Pass", "Fail", "Audit"];
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
							const newSection = new Section(section.id, section.Course, section.Title,
								section.Professor, section.Subject, section.Year, section.Avg,
								section.Pass, section.Fail, section.Audit);
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
		return zip.loadAsync(content, {base64 : true}).then((zipFile) => {
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

	public performQuery(query: unknown): Promise<InsightResult[]> {
		return Promise.resolve([]);
		// return Promise.reject("Not implemented.");
	}

	public listDatasets(): Promise<InsightDataset[]> {
		let result: InsightDataset[] = [];
		for (let dataSet of this.dataFrames) {
			result.push({
				id: dataSet.getID(),
				kind: dataSet.getKind(),
				numRows: dataSet.getNumRows()
			});
		}
		return Promise.resolve(result);
	}
}
