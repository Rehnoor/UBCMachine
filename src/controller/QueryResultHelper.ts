import {Room, Row, Section} from "./InsightDataFrame";
import Decimal from "decimal.js";
import {InsightError} from "./IInsightFacade";

export class QueryResultHelper {
	public handleMax(keyToApplyTo: any, group: Row[]): number {
		let maxSoFar: number = -1;
		for (let item of group) {
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
				} else if (keyToApplyTo === "audit") {
					if (item.audit > maxSoFar) {
						maxSoFar = item.audit;
					}
				} else {
					throw new InsightError("Invalid key for MAX");
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
				} else {
					throw new InsightError("Invalid key for MAX");
				}
			}
		}
		return maxSoFar;
	}

	public handleMin(keyToApplyTo: any, group: Row[]): number {
		let minSoFar: number = Number.MAX_VALUE;
		for (let item of group) {
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
				} else if (keyToApplyTo === "audit") {
					if (item.audit < minSoFar) {
						minSoFar = item.audit;
					}
				} else {
					throw new InsightError("Invalid key for MIN");
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
				} else {
					throw new InsightError("Invalid key for MAX");
				}
			}
		}
		return minSoFar;
	}

	public handleAvg(keyToApplyTo: any, group: Row[]): number {
		let numRows: number = group.length;
		let total: Decimal = new Decimal(0);
		for (let item of group) {
			if (item instanceof Section) {
				if (keyToApplyTo === "year") {
					total = total.add(new Decimal(item.year));
				} else if (keyToApplyTo === "avg") {
					total = total.add(new Decimal(item.avg));
				} else if (keyToApplyTo === "pass") {
					total = total.add(new Decimal(item.pass));
				} else if (keyToApplyTo === "fail") {
					total = total.add(new Decimal(item.fail));
				} else if (keyToApplyTo === "audit") {
					total = total.add(new Decimal(item.audit));
				} else {
					throw new InsightError("Invalid key for AVG");
				}
			} else if (item instanceof Room) {
				if (keyToApplyTo === "lat") {
					total = total.add(new Decimal(item.lat));
				} else if (keyToApplyTo === "lon") {
					total = total.add(new Decimal(item.lon));
				} else if (keyToApplyTo === "seats") {
					total = total.add(new Decimal(item.seats));
				} else {
					throw new InsightError("Invalid key for AVG");
				}
			}
		}
		let avg = total.toNumber() / numRows;
		return Number(avg.toFixed(2));
	}

	private sectionNumberUnique(keyToApplyTo: any, seenSoFar: any[], item: Section): boolean {
		if (keyToApplyTo === "year") {
			return seenSoFar.includes(item.year);
		} else if (keyToApplyTo === "avg") {
			return seenSoFar.includes(item.avg);
		} else if (keyToApplyTo === "pass") {
			return seenSoFar.includes(item.pass);
		} else if (keyToApplyTo === "fail") {
			return seenSoFar.includes(item.fail);
		} else {
			return seenSoFar.includes(item.audit);
		}
	}

	private sectionStringUnique(keyToApplyTo: any, seenSoFar: any[], item: Section): boolean {
		if (keyToApplyTo === "uuid") {
			return seenSoFar.includes(item.uuid);
		} else if (keyToApplyTo === "id") {
			return seenSoFar.includes(item.id);
		} else if (keyToApplyTo === " title") {
			return seenSoFar.includes(item.title);
		} else if (keyToApplyTo === " instructor") {
			return seenSoFar.includes(item.instructor);
		} else {
			return seenSoFar.includes(item.dept);
		}
	}

	private roomNumberUnique(keyToApplyTo: any, seenSoFar: any[], item: Room): boolean {
		if (keyToApplyTo === "lat") {
			return seenSoFar.includes(item.lat);
		} else if (keyToApplyTo === "lon") {
			return seenSoFar.includes(item.lon);
		} else {
			return seenSoFar.includes(item.seats);
		}
	}

	private roomStringUnique(keyToApplyTo: any, seenSoFar: any[], item: Room): boolean {
		if (keyToApplyTo === "name") {
			return seenSoFar.includes(item.name);
		} else if (keyToApplyTo === "fullname") {
			return seenSoFar.includes(item.fullname);
		} else if (keyToApplyTo === "shortname") {
			return seenSoFar.includes(item.shortname);
		} else if (keyToApplyTo === "number") {
			return seenSoFar.includes(item.number);
		} else if (keyToApplyTo === "address") {
			return seenSoFar.includes(item.address);
		} else if (keyToApplyTo === "type") {
			return seenSoFar.includes(item.type);
		} else if (keyToApplyTo === "furniture") {
			return seenSoFar.includes(item.furniture);
		} else {
			return seenSoFar.includes(item.href);
		}
	}

	public handleCount(keyToApplyTo: any, group: Row[]): number {
		let count: number = 0;
		let seenSoFar: any[] = [];
		for (let item of group) {
			if (item instanceof Section) {
				if (this.sectionNumberUnique(keyToApplyTo, seenSoFar, item) ||
					this.sectionStringUnique(keyToApplyTo, seenSoFar, item)) {
					count++;
					seenSoFar.push(item);
				}
			} else if (item instanceof Room) {
				if (this.roomNumberUnique(keyToApplyTo, seenSoFar, item) ||
					this.roomStringUnique(keyToApplyTo, seenSoFar, item)) {
					count++;
					seenSoFar.push(item);
				}
			}
		}
		return 0;
	}

	public handleSum(keyToApplyTo: any, group: Row[]): number {
		let total: number = 0;
		for (let item of group) {
			if (item instanceof Section) {
				if (keyToApplyTo === "year") {
					total += item.year;
				} else if (keyToApplyTo === "avg") {
					total += item.avg;
				} else if (keyToApplyTo === "pass") {
					total += item.pass;
				} else if (keyToApplyTo === "fail") {
					total += item.fail;
				} else if (keyToApplyTo === "audit") {
					total += item.audit;
				} else {
					throw new InsightError("Invalid key for SUM");
				}
			} else if (item instanceof Room) {
				if (keyToApplyTo === "lat") {
					total += item.lat;
				} else if (keyToApplyTo === "lon") {
					total += item.lon;
				} else if (keyToApplyTo === "seats") {
					total += item.seats;
				} else {
					throw new InsightError("Invalid key for SUM");
				}
			}
		}
		return Number(total.toFixed(2));
	}
}
