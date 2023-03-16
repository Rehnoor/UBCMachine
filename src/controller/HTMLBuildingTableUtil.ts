import {Room} from "./InsightDataFrame";
import JSZip from "jszip";
import {InsightError} from "./IInsightFacade";
import {parse} from "parse5";

export class Building {

	// should change building to have constructor taking a valid <tr> as argument
	public image: string | undefined = undefined; // also a link to more info on internet
	public code: string | undefined = undefined;
	public fullname: string | undefined = undefined;
	public fullNameLink: string | undefined = undefined; // link to rooms page in zip file
	public address: string | undefined = undefined;
	public nothing: string | undefined = undefined; // link to more info on internet, html class is "nothing"

	// WARNING: I've assumed here that all html tables will be structured the same (very hard-coded)
	// Piazza @1063, but still quite unclear so may need to change later to allow for more general table structures
	private getTDTextContent(tableNode: any): string {
		return tableNode.childNodes[0].value.trim();
	}

	private getTDHrefLink(tableNode: any): string {
		return tableNode.childNodes[1].attrs[0].value.slice(2); // slice is to remove the "./"
	}

	private getTDHrefTitle(tableNode: any): string {
		return tableNode.childNodes[1].childNodes[0].value;
	}

	public handleTD(tableNode: any) {
		if (tableNode === undefined || tableNode.nodeName === undefined || tableNode.nodeName !== "td") {
			return;
		}
		if (!tableNode.attrs) {
			return;
		}
		for (let attribute of tableNode.attrs) {
			if (attribute.name !== undefined && attribute.name === "class") {
				switch (attribute.value) {
					case "views-field views-field-field-building-image": {
						this.image = this.getTDHrefLink(tableNode);
						break;
					}
					case "views-field views-field-field-building-code": {
						this.code = this.getTDTextContent(tableNode);
						break;
					}
					case "views-field views-field-title": {
						this.fullname = this.getTDHrefTitle(tableNode);
						this.fullNameLink = this.getTDHrefLink(tableNode);
						break;
					}
					case "views-field views-field-field-building-address": {
						this.address = this.getTDTextContent(tableNode);
						break;
					}
					case "views-field views-field-nothing": {
						this.nothing = this.getTDHrefLink(tableNode);
						break;
					}
					default: {
						break;
					}
				}
			}
		}
	}

	// Checks whether all fields have been instantiated
	public hasAllFields(): boolean {
		return !!(this.image && this.code && this.fullname && this.address && this.nothing);
	}


}

// For buildings table but should extend to parse rooms table as well

export default class HTMLBuildingTableUtil {

	public isValidBuildingTable(htmlNode: any): boolean {
		if (htmlNode.nodeName === undefined || htmlNode.nodeName !== "tr" || htmlNode.childNodes === undefined) {
			return false;
		}
		const requiredBuildingColumns = {image: 0, code: 0, title: 0, address: 0, nothing: 0};
		for (let tableData of htmlNode.childNodes) {
			if (tableData.nodeName !== undefined && tableData.nodeName === "td") {
				const attributes = tableData.attrs;
				if (attributes === undefined) {
					return false;
				}
				for (let attribute of attributes) {
					if (attribute.name !== undefined && attribute.name === "class") {
						if (attribute.value !== undefined) {
							switch (attribute.value) {
								case "views-field views-field-field-building-image": {
									requiredBuildingColumns.image = 1;
									break;
								}
								case "views-field views-field-field-building-code": {
									requiredBuildingColumns.code = 1;
									break;
								}
								case "views-field views-field-title": {
									requiredBuildingColumns.title = 1;
									break;
								}
								case "views-field views-field-field-building-address": {
									requiredBuildingColumns.address = 1;
									break;
								}
								case "views-field views-field-nothing": {
									requiredBuildingColumns.nothing = 1;
									break;
								}
								default: {
									break;
								}
							}
						}
					}
				}
			}
		}
		const columnStatus = Object.values(requiredBuildingColumns);
		return columnStatus.reduce((sum, x) => sum + x) === columnStatus.length;
	}

	// RETURNS: undefined if <tbody> is not found
	public getTableBody(tableNode: any): any {
		if (tableNode.nodeName === undefined || tableNode.nodeName !== "table" || tableNode.childNodes === undefined) {
			console.error("did not pass a tableNode to getTableBody");
			return undefined;
		}
		let tbody;
		for (let child of tableNode.childNodes) {
			if (child.nodeName !== undefined && child.nodeName === "tbody") {
				tbody = child;
				break;
			}
		}
		return tbody;
	}


	// REQUIRES: <table> has already been validated to have all required query columns
	public parseBuildingTable(tableNode: any): Building[] {
		const tbody = this.getTableBody(tableNode);
		if (tbody === undefined || tbody.childNodes === undefined) {
			return [];
		}
		console.log("entered parseBuildingTable");
		let buildings: Building[] = [];
		for (let rowData of tbody.childNodes) {
			if (rowData.nodeName !== undefined && rowData.nodeName === "tr" && rowData.childNodes !== undefined) {
				// we have a <tr>
				let building = new Building();
				for (let td of rowData.childNodes) {
					building.handleTD(td);
				}
				if (building.hasAllFields()) {
					buildings.push(building);
				}
			}
		}
		return buildings;
	}

	public parseRoomFiles(buildings: Building[], fileData: JSZip): Room[] {
		console.log("entered parseRoomFiles");
		for (let building of buildings) {
			if (building.fullNameLink) {
				// TODO: need more error checking here
				fileData.file(building.fullNameLink)?.async("string").then((roomText) => {
					if (roomText) {
						const roomDoc = parse(roomText);
						console.log(roomDoc);
					}
				});
			}
		}
		return [];
	}
}
