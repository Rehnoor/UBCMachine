import {InsightError, InsightResult} from "./IInsightFacade";
import {Room, Row, Section} from "./InsightDataFrame";
import Decimal from "decimal.js";

export class QueryResult {
	public getInsightResult(insightArray: InsightResult[], transformations: object): InsightResult[] {
		return [];
	}

	public updateGroupList(newData: Row, groupList: Row[][], groups: any): Row[][]{
		let retVal: Row[][];
		if (groupList.length === 0) {
			retVal = [[newData]];
		} else {
			retVal = groupList;
			retVal.forEach((item) => {
				for (const g in groups) {
					if (this.matching(item[0], g, newData)) {
						item.push(newData);
					}
				}
			});
		}
		return retVal;
	}

	private matching(item: Row, group: string, data: Row): boolean {
		if (item instanceof Room && data instanceof Room) {
			let field: string = group.split("_", 2)[1];
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
			} else {
				return (item.href === data.href);
			}
		} else if (item instanceof Section && data instanceof Section) {
			let field: string = group.split("_", 2)[1];
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
			} else {
				return (item.audit === data.audit);
			}
		}
		throw new InsightError("breh");
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
						}
					}
				}
			}
		});
		return [];
	}

	private handleApply(applyToken: any, keyToApplyTo: any, group: Row[]): number {
		if (applyToken === "MAX") {
			return this.handleMax(keyToApplyTo, group);
		} else if (applyToken === "MIN") {
			return this.handleMin(keyToApplyTo, group);
		} else if (applyToken === "AVG") {
			return this.handleAvg(keyToApplyTo, group);
		} else if (applyToken === "COUNT") {
			return this.handleCount(keyToApplyTo, group);
		} else { // assumes token is SUM
			return this.handleSum(keyToApplyTo, group);
		}
	}

	private handleMax(keyToApplyTo: any, group: Row[]): number {
		let maxSoFar: number = -1;
		group.forEach((item) => {
			if (item instanceof Section) {
				if (keyToApplyTo === "year") {
					if (item.year > maxSoFar) {
						maxSoFar = item.year;
					}
				} else if (keyToApplyTo === "avg") {
					if (item.avg > maxSoFar) {
						maxSoFar = item.avg;
					}
				} else if (keyToApplyTo === "pass") {
					if (item.pass > maxSoFar) {
						maxSoFar = item.pass;
					}
				} else if (keyToApplyTo === "fail") {
					if (item.fail > maxSoFar) {
						maxSoFar = item.fail;
					}
				} else {
					if (item.audit > maxSoFar) {
						maxSoFar = item.audit;
					}
				}
			} else if (item instanceof Room) {
				if (keyToApplyTo === "lat") {
					if (item.lat > maxSoFar) {
						maxSoFar = item.lat;
					}
				} else if (keyToApplyTo === "lon") {
					if (item.lon > maxSoFar) {
						maxSoFar = item.lon;
					}
				} else if (keyToApplyTo === "seats") {
					if (item.seats > maxSoFar) {
						maxSoFar = item.seats;
					}
				}
			}
		});
		return maxSoFar;
	}

	private handleMin(keyToApplyTo: any, group: Row[]): number {
		let minSoFar: number = Number.MAX_VALUE;
		group.forEach((item) => {
			if (item instanceof Section) {
				if (keyToApplyTo === "year") {
					if (item.year < minSoFar) {
						minSoFar = item.year;
					}
				} else if (keyToApplyTo === "avg") {
					if (item.avg < minSoFar) {
						minSoFar = item.avg;
					}
				} else if (keyToApplyTo === "pass") {
					if (item.pass < minSoFar) {
						minSoFar = item.pass;
					}
				} else if (keyToApplyTo === "fail") {
					if (item.fail < minSoFar) {
						minSoFar = item.fail;
					}
				} else {
					if (item.audit < minSoFar) {
						minSoFar = item.audit;
					}
				}
			} else if (item instanceof Room) {
				if (keyToApplyTo === "lat") {
					if (item.lat < minSoFar) {
						minSoFar = item.lat;
					}
				} else if (keyToApplyTo === "lon") {
					if (item.lon < minSoFar) {
						minSoFar = item.lon;
					}
				} else if (keyToApplyTo === "seats") {
					if (item.seats < minSoFar) {
						minSoFar = item.seats;
					}
				}
			}
		});
		return minSoFar;
	}

	private handleAvg(keyToApplyTo: any, group: Row[]): number {
		let numRows: number = group.length;
		let total: Decimal = new Decimal(0);
		group.forEach((item) => {
			if (item instanceof Section) {
				if (keyToApplyTo === "year") {
					total.add(item.year);
				} else if (keyToApplyTo === "avg") {
					total.add(item.avg);
				} else if (keyToApplyTo === "pass") {
					total.add(item.pass);
				} else if (keyToApplyTo === "fail") {
					total.add(item.fail);
				} else {
					total.add(item.audit);
				}
			} else if (item instanceof Room) {
				if (keyToApplyTo === "lat") {
					total.add(item.lat);
				} else if (keyToApplyTo === "lon") {
					total.add(item.lon);
				} else if (keyToApplyTo === "seats") {
					total.add(item.seats);
				}
			}
		});
		let avg = total.toNumber() / numRows;
		return Number(avg.toFixed(2));
	}

	private handleCount(keyToApplyTo: any, group: Row[]): number {
		// let count: number = 0;
		// group.forEach((item) => {
		// 	if (item instanceof Section) {
		// 		if (keyToApplyTo === "uuid") {
		// 			if (item.uuid > maxSoFar) {
		// 				maxSoFar = item.year;
		// 			}
		// 		} else if (keyToApplyTo === "avg") {
		// 			if (item.avg > maxSoFar) {
		// 				maxSoFar = item.avg;
		// 			}
		// 		} else if (keyToApplyTo === "pass") {
		// 			if (item.pass > maxSoFar) {
		// 				maxSoFar = item.pass;
		// 			}
		// 		} else if (keyToApplyTo === "fail") {
		// 			if (item.fail > maxSoFar) {
		// 				maxSoFar = item.fail;
		// 			}
		// 		} else {
		// 			if (item.audit > maxSoFar) {
		// 				maxSoFar = item.audit;
		// 			}
		// 		}
		// 	} else if (item instanceof Room) {
		// 		if (keyToApplyTo === "lat") {
		// 			if (item.lat > maxSoFar) {
		// 				maxSoFar = item.lat;
		// 			}
		// 		} else if (keyToApplyTo === "lon") {
		// 			if (item.lon > maxSoFar) {
		// 				maxSoFar = item.lon;
		// 			}
		// 		} else if (keyToApplyTo === "seats") {
		// 			if (item.seats > maxSoFar) {
		// 				maxSoFar = item.seats;
		// 			}
		// 		}
		// 	}
		// });
		return 0;
	}

	private handleSum(keyToApplyTo: any, group: Row[]): number {
		return 0;
	}

}
