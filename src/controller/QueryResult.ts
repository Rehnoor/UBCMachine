import {InsightError, InsightResult} from "./IInsightFacade";
import {Room, Row, Section} from "./InsightDataFrame";
import Decimal from "decimal.js";
import {QueryResultHelper} from "./QueryResultHelper";

export class QueryResult {
	private qrh: QueryResultHelper;
	constructor() {
		this.qrh = new QueryResultHelper();
	}

	public getInsightResult(insightArray: InsightResult[], transformations: object): InsightResult[] {
		return [];
	}

	public updateGroupList(newData: Row, groupList: Row[][], groups: any): Row[][]{
		let retVal: Row[][];
		if (groupList.length === 0) {
			retVal = [[newData]];
		} else {
			retVal = groupList;
			let foundCol: boolean = false;
			for (let item of retVal) {
				// console.log(item[0]);
				let matchesAllFields: boolean = true;
				// console.log(groups);
				for (let g in groups) {
					matchesAllFields = this.matching(item[0], groups[g], newData) && matchesAllFields;
					// console.log(groups[g]);
					// matchesAllFields = this.matching(item[0], groups[g], newData);
				}
				if (matchesAllFields) {
					item.push(newData);
					foundCol = true;
					break;
				}
			}
			// console.log("yo");
			if (!foundCol) {
				retVal.push([newData]);
			}
		}
		return retVal;
	}

	private matching(item: Row, group: string, data: Row): boolean {
		let field: string = group.split("_", 2)[1];
		if (item instanceof Room && data instanceof Room) {
			if (field === "fullname") {
				return (item.fullname === data.fullname);
			} else if (field === "shortname") {
				return (item.shortname === data.shortname);
			} else if (field === "number") {
				return (item.number === data.number);
			} else if (field === "address") {
				return (item.address === data.address);
			} else if (field === "lat") {
				return (item.lat === data.lat);
			} else if (field === "lon") {
				return (item.lon === data.lon);
			} else if (field === "seats") {
				return (item.seats === data.seats);
			} else if (field === "type") {
				return (item.type === data.type);
			} else if (field === "furniture") {
				return (item.furniture === data.furniture);
			} else if (field === "name") {
				return (item.name === data.name);
			}
			return (item.href === data.href && field === "href");
		} else if (item instanceof Section && data instanceof Section) {
			if (field === "uuid") {
				return (item.uuid === data.uuid);
			} else if (field === "id") {
				return (item.id === data.id);
			} else if (field === "title") {
				return (item.title === data.title);
			} else if (field === "instructor") {
				return (item.instructor === data.instructor);
			} else if (field === "dept") {
				return (item.dept === data.dept);
			} else if (field === "year") {
				return (item.year === data.year);
			} else if (field === "avg") {
				return (item.avg === data.avg);
			} else if (field === "pass") {
				return (item.pass === data.pass);
			} else if (field === "fail") {
				return (item.fail === data.fail);
			}
			return (item.audit === data.audit && field === "audit");
		} else {
			throw new InsightError("breh");
		}
	}

	public applyAndAddColumns(groupList: Row[][], columns: string[], applyVal: any): InsightResult[] {
		// TODO: check that applykey is shown in columns
		let result: InsightResult[] = [];
		for (let item of groupList) {
			// console.log(groupList);
			let x: InsightResult = {};
			for (let key in columns) {
				// console.log(key);
				if (columns[key].includes("_")) {
					let dataKey = columns[key].split("_", 2)[1];
					x[columns[key]] = (item[0] as any)[dataKey];
				} else {
					for (const y in applyVal) {
						// console.log(applyVal); // [ { overallAvg: { AVG: 'sections_avg' } } ]
						if (Object.keys(applyVal[y]).includes(columns[key])) {
							let d: any = applyVal[y];
							// console.log(d); // { overallAvg: { AVG: 'sections_avg' } }
							// console.log(columns[key]); // overallAvg
							let applyBody: any = Object.values(d)[0];
							// console.log(applyBody); // { AVG: 'sections_avg' }
							let applyToken: any = Object.keys(applyBody)[0];
							// console.log(applyToken); // AVG
							let keyToApplyTo: any = Object.values(applyBody)[0];
							// console.log(keyToApplyTo); // sections_avg
							let r: any = this.handleApply(applyToken, keyToApplyTo, item);
							// console.log(r);
							x[columns[key]] = r;
						}
					}
				}
			}
			result.push(x);
		}
		return result;
	}

	private handleApply(applyToken: any, keyToApplyTo: any, group: Row[]): number {
		// console.log(applyToken);
		keyToApplyTo = keyToApplyTo.split("_", 2)[1];
		if (applyToken === "MAX") {
			return this.qrh.handleMax(keyToApplyTo, group);
		} else if (applyToken === "MIN") {
			return this.qrh.handleMin(keyToApplyTo, group);
		} else if (applyToken === "AVG") {
			return this.qrh.handleAvg(keyToApplyTo, group);
		} else if (applyToken === "COUNT") {
			return this.qrh.handleCount(keyToApplyTo, group);
		} else { // assumes token is SUM
			return this.qrh.handleSum(keyToApplyTo, group);
		}
	}

	public handleCustomOrder(order: any, ir: InsightResult[]): InsightResult[] {
		let dir: any = Object.values(order)[Object.keys(order).indexOf("dir")];
		let keyList: any = Object.values(order)[Object.keys(order).indexOf("keys")];
		if (dir === "UP") {
			ir.sort((a, b) => {
				for (let k in keyList) {
					if (a[k] < b[k]) {
						return -1;
					} else if (a[k] > b[k]) {
						return 1;
					}
				}
				return 0;
			});
		} else if (dir === "DOWN") {
			ir.sort((a, b) => {
				for (let k in keyList) {
					if (a[k] > b[k]) {
						return -1;
					} else if (a[k] < b[k]) {
						return 1;
					}
				}
				return 0;
			});
		} else {
			throw new InsightError("Invalid dir field in ORDER");
		}
		return ir;
	}
}
