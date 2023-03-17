import {InsightError, InsightResult} from "./IInsightFacade";
import {Room, Section} from "./InsightDataFrame";

export class QueryResult {
	public getInsightResult(insightArray: InsightResult[], transformations: object): InsightResult[] {
		return [];
	}

	public updateGroupList(data: Room | Section, list: Room[][] | Section[][], groups: any): Room[][] | Section[][]{
		// if (data instanceof Room) {
		// 	let retval: Room[][] = [];
		// 	if (list.length === 0) {
		// 		let innerList: Room[] = [data];
		// 		retval.push(innerList);
		// 		return retval;
		// 	} else {
		// 		for (const item of list) {
		// 			for (const g of groups) {
		// 				if (this.matching(item[0], g as string, data)) {
		// 				}
		// 			}
		// 		}
		// 	}
		// }
		return [];
	}

	private matching(item: Room | Section, group: string, data: Room | Section): boolean {
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
}
