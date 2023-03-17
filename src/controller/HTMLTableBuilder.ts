import {Room} from "./InsightDataFrame";
import JSZip from "jszip";
import {parse} from "parse5";
import {BuildingTableRow, RoomTableRow} from "./HTMLTableRow";
import GeoFetcher from "./GeoLocator";


export default class HTMLTableBuilder {

	private geoFetcher = new GeoFetcher();

	private isValidBuildingTable(htmlNode: any): boolean {
		if (htmlNode === undefined || htmlNode.nodeName === undefined || htmlNode.nodeName !== "tr" ||
			htmlNode.childNodes === undefined) {
			return false;
		}
		// htmlNode is a <tr>
		let buildingTableRow = new BuildingTableRow();
		for (let tableData of htmlNode.childNodes) {
			buildingTableRow.handleTD(tableData);
		}
		for (let val of Object.values(buildingTableRow)) {
			if (val === undefined) {
				return false;
			}
		}
		return true;
	}

	private isValidRoomTable(htmlNode: any): boolean {
		if (htmlNode === undefined || htmlNode.nodeName === undefined || htmlNode.nodeName !== "tr" ||
			htmlNode.childNodes === undefined) {
			return false;
		}
		let roomTableRow = new RoomTableRow();
		for (let tableData of htmlNode.childNodes) {
			roomTableRow.handleTD(tableData);
		}
		for (let val of Object.values(roomTableRow)) {
			if (val === undefined) {
				return false;
			}
		}
		return true;
	}

	// RETURNS: undefined if <tbody> is not found
	public getTableBody(tableNode: any): any {
		if (tableNode === undefined || tableNode.nodeName === undefined || tableNode.nodeName !== "table" ||
			tableNode.childNodes === undefined) {
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
	public parseBuildingTable(tableNode: any): BuildingTableRow[] {
		const tbody = this.getTableBody(tableNode);
		if (tbody === undefined || tbody.childNodes === undefined) {
			return [];
		}
		let buildings: BuildingTableRow[] = [];
		for (let rowData of tbody.childNodes) {
			if (rowData.nodeName !== undefined && rowData.nodeName === "tr" && rowData.childNodes !== undefined) {
				// we have a <tr>
				let building = new BuildingTableRow();
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

	// pass in a "#document" node to get the "html" node if it exists
	private getHtmlDocument(document: any): any {
		let htmlTree;
		if (document && document.nodeName && document.nodeName === "#document" && document.childNodes) {
			for (let htmlNode of document.childNodes) {
				if (htmlNode.nodeName === "html") {
					htmlTree = htmlNode;
					break;
				}
			}
		}
		return htmlTree;
	}

	// REQUIRES: htmlNode is a <table>
	private getFirstTableRow(htmlNode: any): any {
		const tbody = this.getTableBody(htmlNode);
		if (tbody === undefined || tbody.childNodes === undefined) {
			return false;
		}
		let rowData = tbody.childNodes; // array of htmlNode: we are looking for tr
		let tableRow;
		for (let rowVal of rowData) {
			if (rowVal.nodeName !== undefined && rowVal.nodeName === "tr") {
				tableRow = rowVal;
				break;
			}
		}
		return tableRow;
	}

	// pass in a <table> html node
	private validateBuildingTable(htmlNode: any): boolean {
		let tableRow = this.getFirstTableRow(htmlNode);
		if (tableRow === undefined || tableRow.childNodes === undefined) {
			return false;
		}
		return this.isValidBuildingTable(tableRow);
	}

	// pass in <table> html node
	private validateRoomTable(htmlNode: any): boolean {
		if (htmlNode === undefined || htmlNode.nodeName === undefined || htmlNode.nodeName !== "table") {
			return false;
		}
		let tableRow = this.getFirstTableRow(htmlNode);
		if (tableRow === undefined || tableRow.childNodes === undefined) {
			return false;
		}
		return this.isValidRoomTable(tableRow);
	}

	// Recursive function to find a valid table from htmlNode
	// Returns undefined if no valid tables exist, if found returns tbody
	// tableType is one of: "building" | "room"
	public findValidTable(htmlNode: any, tableType: string): any {
		if (htmlNode === undefined || htmlNode.nodeName === undefined) {
			return undefined;
		}
		if (htmlNode.nodeName === "table") {
			if (tableType === "building") {
				if (this.validateBuildingTable(htmlNode)) {
					return htmlNode;
				}
			}
			if (tableType === "room") {
				if (this.validateRoomTable(htmlNode)) {
					return htmlNode;
				}
			}
			return undefined;
		}
		// check for child nodes
		if (htmlNode.childNodes !== undefined) {
			for (let child of htmlNode.childNodes) {
				const childResult = this.findValidTable(child, tableType);
				if (childResult !== undefined) {
					return childResult;
				}
			}
		}
	}

	// roomDoc should be an html file
	// lat and lon are type = any just to get linter to stop complaining
	private getRoomsFromBuilding(building: BuildingTableRow, roomDoc: any, lat: any, lon: any): Room[] {
		const htmlTree = this.getHtmlDocument(roomDoc);
		const tableNode = this.findValidTable(htmlTree, "room");
		let roomsInThisBuilding: Room[] = [];
		if (this.validateRoomTable(tableNode)) {
			const tableBody = this.getTableBody(tableNode);
			for (let rowData of tableBody.childNodes) {
				if (rowData.nodeName !== undefined && rowData.nodeName === "tr" && rowData.childNodes !== undefined) {
					// we have a <tr>
					let roomTableRow = new RoomTableRow();
					for (let td of rowData.childNodes) {
						roomTableRow.handleTD(td);
					}
					if (roomTableRow.hasAllFields()) {
						// create a room out of this
						// had to do all this casting because theres no way to tell linter that
						// roomTableRow.hasAllFields() has already checked that nothing is undefined
						let room = new Room(String(building.fullname), String(building.code),
							String(roomTableRow.roomNumber), String(building.address), Number(lat),
							Number(lon), Number(roomTableRow.capacity), String(roomTableRow.roomType),
							String(roomTableRow.furniture), String(roomTableRow.nothingLink));
						roomsInThisBuilding.push(room);
					}
				}
			}
		}
		return roomsInThisBuilding;
	}

	public parseRoomFiles(buildings: BuildingTableRow[], fileData: JSZip): Promise<Room[][]> {
		let roomPromises: Array<Promise<Room[]>> = [];
		for (let building of buildings) {
			let roomsFromBuilding;
			let roomDoc: any;
			if (building.fullNameLink) {
				const roomFile = fileData.file(building.fullNameLink);
				if (roomFile) {
					roomsFromBuilding = roomFile.async("string").then((roomText) => {
						roomDoc = parse(roomText);
					}).then(() => {
						if (building.address) { // this is just for eslint, all buildingRows MUST have a string address
							return this.geoFetcher.getCoordinates(building.address);
						}
					}).then((buildingCoordinates) => {
						if (!buildingCoordinates || buildingCoordinates.error) {
							console.error("error retrieving building coordinates");
							return [];
						}
						const latitude = buildingCoordinates.lat;
						const longitude = buildingCoordinates.lon;
						return this.getRoomsFromBuilding(building, roomDoc, latitude, longitude);
					}); // add a catch block
				}
				if (roomsFromBuilding) {
					roomPromises.push(roomsFromBuilding);
				}
			}
		}
		return Promise.all(roomPromises);
	}
}
