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
			for (let item of retVal) {
				let matchesAllFields: boolean = true;
				for (const g in groups) {
					matchesAllFields = this.matching(item[0], g, newData) && matchesAllFields;
				}
				if (matchesAllFields) {
					item.push(newData);
					break;
				}
			}
			retVal.push([newData]);
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
		groupList.forEach((item) => {
			let x: InsightResult = {};
			for (let key in columns) {
				if (key.includes("_")) {
					let dataKey = key.split("_", 2)[1];
					x[key] = (item[0] as any)[dataKey];
				} else {
					for (const y in applyVal) {
						if (Object.keys(y).includes(key)) {
							let applyBody: any = Object.values(y[0]);
							let applyToken: any = Object.keys(applyBody)[0];
							let keyToApplyTo: any = Object.values(applyBody)[0];
							let r: any = this.handleApply(applyToken, keyToApplyTo, item);
							x[key] = r;
						}
					}
				}
			}
			result.push(x);
		});
		return result;
	}

	private handleApply(applyToken: any, keyToApplyTo: any, group: Row[]): number {
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
