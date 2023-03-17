import {Room, Section} from "./InsightDataFrame";

export abstract class Node {
	private children: Node[];
	private dataid: string;
	constructor() {
		this.children = [];
		this.dataid = "";
	}

	public setDataID(dataid: string) {
		this.dataid = dataid;
	}

	public abstract nodeMessage(): string;

	// TODO: sorry my bad had to change signature for linter, gonna need some instanceof checks?
	public abstract validateData(section: Section | Room): boolean;

	public addChild(child: Node) {
		this.children.push(child);
	}

	public getChildren(): Node[] {
		return this.children;
	}

	public getdataID(): string {
		return this.dataid;
	}
}

export class LogicNode extends Node {
	private type: string;
	constructor(type: string) {
		super();
		this.type = type;
	}

	public getType(): string {
		return this.type;
	}

	public nodeMessage(): string {
		return "______\nLOGIC NODE WITH TYPE: " + this.type + "\nChildren: ";
	}

	public validateData(section: Section): boolean {
		if (this.type === "AND") {
			for (let c in this.getChildren()) {
				if (!this.getChildren()[c].validateData(section)) {
					return false;
				}
			}
			return true;
		} else {
			for (let c in this.getChildren()) {
				if (this.getChildren()[c].validateData(section)) {
					return true;
				}
			}
			return false;
		}
	}
}

export class MathNode extends Node {
	private type: string;
	private mfield: string;
	private num: number;
	constructor(type: string, mfield: string, num: number, dataid: string) {
		super();
		this.num = num;
		this.mfield = mfield;
		this.type = type;
		this.setDataID(dataid);
	}

	public nodeMessage(): string {
		let s: string = "\ndataid: " + this.getdataID();
		return "______\nMATH NODE WITH TYPE: " + this.type + "\nmfield: " + this.mfield + "\nnumber: " + this.num + s;
	}

	private getMfieldVal(x: Section | Room): number {
		if (x instanceof Section) {
			if (this.mfield === "avg") {
				return x.avg;
			} else if (this.mfield === "pass") {
				return x.pass;
			} else if (this.mfield === "fail") {
				return x.fail;
			} else if (this.mfield === "audit") {
				return x.audit;
			} else { // this can only be "year" as inputs have been validated from before
				return x.year;
			}
		} else {
			if (this.mfield === "lat") {
				return x.lat;
			} else if (this.mfield === "lon") {
				return x.lon;
			} else {
				return x.seats;
			}
		}
	}

	public validateData(section: Section): boolean {
		let sectionVal: number = this.getMfieldVal(section);
		if (this.type === "LT") {
			return (sectionVal < this.num);
		} else if (this.type === "GT") {
			return (sectionVal > this.num);
		} else { // only other possible case can be ===
			return (sectionVal === this.num);
		}
	}
}

export class StringNode extends Node {
	private sfield: string;
	private inputString: string;
	constructor(sfield: string, inputString: string, dataid: string) {
		super();
		this.inputString = inputString;
		this.sfield = sfield;
		this.setDataID(dataid);
	}

	public nodeMessage(): string {
		let s: string = "\ndataid: " + this.getdataID();
		return "______\nSTRING NODE WITH inputString: " + this.inputString + "\nsfield: " + this.sfield + s;
	}

	private getSfield(x: Section | Room): string {
		if (x instanceof Section) {
			if (this.sfield === "dept") {
				return x.dept;
			} else if (this.sfield === "id") {
				return x.id;
			} else if (this.sfield === "instructor") {
				return x.instructor;
			} else if (this.sfield === "title") {
				return x.title;
			} else { // this can only be "uuid" as inputs have been validated from before
				return x.uuid;
			}
		} else {
			if (this.sfield === "fullname") {
				return x.fullname;
			} else if (this.sfield === "shortname") {
				return x.shortname;
			} else if (this.sfield === "number") {
				return x.number;
			} else if (this.sfield === "name") {
				return x.name;
			} else if (this.sfield === "address") {
				return x.address;
			} else if (this.sfield === "type") {
				return x.type;
			} else if (this.sfield === "furniture") {
				return x.furniture;
			} else {
				return x.href;
			}
		}
	}

	public validateData(section: Section): boolean {
		let sectionVal: string = this.getSfield(section);
		if (this.inputString.includes("*")) {
			if (this.inputString[0] === "*" && this.inputString[this.inputString.length - 1] === "*") { // contains
				return sectionVal.includes(this.inputString.replaceAll("*", ""));
			} else if (this.inputString[0] !== "*" && this.inputString[this.inputString.length - 1] === "*") { // starts
				//                                                                                                with
				return sectionVal.startsWith(this.inputString.replace("*", ""));
			} else { // ends with
				return sectionVal.endsWith(this.inputString.replace("*", ""));
			}
		} else { // if the inputString does not contain any * AKA exact match
			return (this.inputString === sectionVal);
		}
	}
}

export class NegationNode extends Node {
	constructor(child: Node) {
		super();
		this.addChild(child);
	}

	public nodeMessage(): string {
		return "______\nNEGATION NODE WITH PREVIOUS NODE BEING INTERNAL FILTER";
	}

	public validateData(section: Section): boolean {
		return !this.getChildren()[0].validateData(section);
	}
}

export class EmptyNode extends Node {
	// TODO: this is a really terrible implementation and requires columnList to be valid + non-empty
	// 		(assumes that first idstring in columnList will reference a valid dataset)
	constructor(columnList: string[]) {
		super();
		this.setDataID(columnList[0].split("_", 2)[0]);
		// console.log("new Empty node with id:" + this.getdataID());
	}

	public nodeMessage(): string {
		return "";
	}

	public validateData(section: Section): boolean {
		return true;
	}
}
