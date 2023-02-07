import * as zip from "jszip";
import * as fs from "fs-extra";

import {IInsightFacade, InsightDataset, InsightDatasetKind, InsightError, InsightResult} from "./IInsightFacade";
import {DataFrame, Section} from "./InsightDataFrame";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	private dataFrames: DataFrame[];
	constructor() {
		// TODO: read all datasets from data directory
		this.dataFrames = [];
	}

	public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		if (!this.validateID(id) || kind === InsightDatasetKind.Rooms) {
			return Promise.reject(new InsightError("Invalid ID / kind parameter"));
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
				fs.ensureDirSync("./data");
				fs.writeJsonSync("./data/" + id + ".json", newDataFrame);
				resolve(dataFrameIDs);
			}).catch((error) => {
				reject(new InsightError("An error occurred during parsing process"));
			});
		});
	}
	// parses json section data from courseArray into dataFrame
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
		for (let dataSet of this.dataFrames) {
			if (dataSet.getID() === id) {
				return false;
			}
		}
		return hasCharacters;
	}

	public removeDataset(id: string): Promise<string> {
		return Promise.reject("Not implemented.");
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		return Promise.resolve([]);
		// return Promise.reject("Not implemented.");
	}

	public listDatasets(): Promise<InsightDataset[]> {
		return Promise.reject("Not implemented.");
	}
}
