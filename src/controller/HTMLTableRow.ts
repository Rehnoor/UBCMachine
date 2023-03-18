
export class BuildingTableRow {

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
		if (tableNode.attrs === undefined) {
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
		return (this.image !== undefined && this.code !== undefined && this.fullname !== undefined
			&& this.address !== undefined && this.nothing !== undefined);
	}

}

export class RoomTableRow {

	public roomNumber: string | undefined = undefined;
	public roomNumberLink: string | undefined = undefined;
	public capacity: number | undefined = undefined;
	public furniture: string | undefined = undefined;
	public roomType: string | undefined = undefined;
	public nothingLink: string | undefined = undefined;

	private getTDTextContent(tableNode: any): string {
		return tableNode.childNodes[0].value.trim();
	}

	private getTDHrefLink(tableNode: any): string {
		return tableNode.childNodes[1].attrs[0].value;
	}

	private getTDHrefTitle(tableNode: any): string {
		return tableNode.childNodes[1].childNodes[0].value;
	}

	public handleTD(tableNode: any) {
		if (tableNode === undefined || tableNode.nodeName === undefined || tableNode.nodeName !== "td") {
			return;
		}
		if (tableNode.attrs === undefined) {
			return;
		}
		for (let attribute of tableNode.attrs) {
			if (attribute.name !== undefined && attribute.name === "class") {
				switch (attribute.value) {
					case "views-field views-field-field-room-number": {
						this.roomNumber = this.getTDHrefTitle(tableNode);
						this.roomNumberLink = this.getTDHrefLink(tableNode);
						break;
					}
					case "views-field views-field-field-room-capacity": {
						this.capacity = Number(this.getTDTextContent(tableNode));
						break;
					}
					case "views-field views-field-field-room-furniture": {
						this.furniture = this.getTDTextContent(tableNode);
						break;
					}
					case "views-field views-field-field-room-type": {
						this.roomType = this.getTDTextContent(tableNode);
						break;
					}
					case "views-field views-field-nothing": {
						this.nothingLink = this.getTDHrefLink(tableNode);
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
		return (this.roomNumber !== undefined && this.roomNumberLink !== undefined && this.capacity !== undefined
			&& this.furniture !== undefined && this.roomType !== undefined && this.nothingLink !== undefined);
	}
}
