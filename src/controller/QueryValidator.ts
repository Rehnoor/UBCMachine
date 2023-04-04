import {InsightError} from "./IInsightFacade";
import {DataSet} from "./InsightDataFrame";
import {QueryEngine} from "./QueryEngine";
import {deflateRaw} from "zlib";

export class QueryValidator {
	private qe: QueryEngine;
	constructor() {
		this.qe = new QueryEngine();
	}

	private dataIDConsistencyCheck(columnList: any): boolean {
		let x: string = columnList[0].split("_", 2)[0];
		for (let y in columnList) {
			if (!columnList[y].includes("_")) {
				return false;
			}
			if (!(columnList[y].split("_", 2)[0] === x)) {
				return false;
			}
		}
		return true;
	}

	private isValidColumns(columnList: any, dataFrames: DataSet[], transformationVal: any, orderVal: any): boolean {
		let col: string = columnList[0];
		let colDataID: string = col.split("_", 2)[0];
		let dataIDFound: boolean = false;
		for (let x in dataFrames) {
			if (dataFrames[x].getID() === colDataID) {
				dataIDFound = true;
			}
		}
		if (!dataIDFound || !this.dataIDConsistencyCheck(columnList)) {
			return false;
		}
		for (let c in columnList) {
			if (!columnList[c].includes("_")) {
				return false;
			}
			let key: string = columnList[c].split("_", 2)[1];
			if (!this.qe.validateSField(key) && !this.qe.validateMField(key)) {
				return false;
			}
		}
		return true;
	}

	private isValidColumnsWOrder(columnList: any, dataFrames: DataSet[], orderVal: any,
		transformationVal: any): boolean {
		let colVerification: boolean = this.isValidColumns(columnList, dataFrames, transformationVal, orderVal);
		let foundMatchingColumn: boolean = false;
		for (let c in columnList) {
			if (orderVal === columnList[c]) {
				foundMatchingColumn = true;
			}
		}
		return foundMatchingColumn && colVerification;
	}

	private validateGrouping(gVal: any, dataFrames: DataSet[]): boolean {
		let l: string[] = gVal;
		if (typeof gVal[0] === "string") {
			let found: boolean = false;
			for (let x of l) {
				let dataID: string = x.split("_", 2)[0]; // dataid
				for (let y in dataFrames) {
					if (dataFrames[y].getID() === dataID) {
						found = true;
					}
				}
				if (!found) {
					return false;
				}
				if (this.qe.validateSField(x.split("_", 2)[1]) ||
					this.qe.validateMField(x.split("_", 2)[1])) {
					return true;
				}
			}
		}
		return false;
	}

	private getCustomCols(tVal: object, dataframes: DataSet[]): string[] {
		if (!Object.keys(tVal).includes("GROUP") && !Object.keys(tVal).includes("APPLY")) {
			throw new InsightError("Transformation block must contain both GROUP and APPLY");
		} else {
			if (!this.validateGrouping(Object.values(tVal)[Object.keys(tVal).indexOf("GROUP")], dataframes)) {
				throw new InsightError("Grouping requirements are invalid");
			}

		}
		return [];
	}

	public validateOptionsAndTransformations(optionsVal: object, columnList: string[], orderVal: any,
											  transformationVal: any, dataFrames: DataSet[]) {
		if (transformationVal === undefined) {
			if (Object.keys(optionsVal).includes("ORDER")) {
				// it is ordered
				if (!this.isValidColumnsWOrder(columnList, dataFrames, orderVal,
					transformationVal)) {
					throw new InsightError("Column or order arguments are invalid");
				}
			} else { // no order
				if (!this.isValidColumns(columnList, dataFrames, transformationVal,
					orderVal)) {
					throw new InsightError("Column arguments are invalid");
				}
			}
		} else {
			let customColumns: string[] = this.getCustomCols(transformationVal, dataFrames);
		}
	}
}
