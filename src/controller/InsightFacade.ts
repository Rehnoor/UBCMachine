import * as zip from "jszip";

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
		console.log("InsightFacadeImpl::init()");
		// TODO: read all datasets from data directory
		//		 do we want to have all added datasets cached in memory? feeling yes...
		this.dataFrames = [];
	}

	public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		// TODO: refactor
		// 		 should be checking for duplicate id
		//		 should be persisting to disk
		if (!this.validateID(id) || kind === InsightDatasetKind.Rooms) {
			return Promise.reject(new InsightError("Invalid ID / kind parameter"));
		}
		let newDataFrame = new DataFrame(id, kind);
		let requiredSectionKeys = ["id", "Course", "Title", "Professor", "Subject",
			"Year", "Avg", "Pass", "Fail", "Audit"];
		return new Promise<string[]>((resolve, reject) => {
			this.convertFilesToString(content).then((jsonCourseArray) => {
				console.log("jsonData length =", jsonCourseArray.length);
				for (let jsonCourse of jsonCourseArray) {
					// NOTE: the jsonCourse is not guaranteed to be in valid json format
					// parse jsonCourse (string) into course (object)
					try {
						const course = JSON.parse(jsonCourse);
						if (course === undefined || !Object.prototype.hasOwnProperty.call(course, "result")) {
							// skip if file does not have a "result" section
						} else {
							for (let section of course.result) {
								const hasAllKeys = requiredSectionKeys.every((k) => k in section);
								if (hasAllKeys) {
									const newSection = new Section(section.id, section.Course, section.Title,
										section.Professor, section.Subject, section.Year, section.Avg,
										section.Pass, section.Fail, section.Audit);
									newDataFrame.addSection(newSection);
								}
							}
						}
					} catch (error) {
							// console.log("Encountered invalid json format while parsing");
						// really don't need to do anything but skip the invalid file
					}
				}
				if (newDataFrame.getNumRows() > 0) {
					this.dataFrames.push(newDataFrame);
					let dataFrameIDs = [];
					for (let df of this.dataFrames) {
						dataFrameIDs.push(df.getID());
					}
						// return dataFrameIDs;
					resolve(dataFrameIDs);
				} else {
					reject(new InsightError("Zip file contained no valid sections: check formatting"));
				}
			}).catch((error) => {
				reject(new InsightError("An error occurred during parsing process"));
			});
		});
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
		// TODO: check for duplicates
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
		return hasCharacters; // && id not in this.dataFrames.reduce(id) or something
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
