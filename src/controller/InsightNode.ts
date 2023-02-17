import {DataFrame, Section} from "./InsightDataFrame";

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
	public abstract validateSection(section: Section): boolean;

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

	public validateSection(section: Section): boolean {
		if (this.type === "AND") {
			for (let c in this.getChildren()) {
				if (!this.getChildren()[c].validateSection(section)) {
					return false;
				}
			}
			return true;
		} else {
			for (let c in this.getChildren()) {
				if (this.getChildren()[c].validateSection(section)) {
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
	private getMfieldVal(section: Section): number {
		if (this.mfield === "avg") {
			return section.avg;
		} else if (this.mfield === "pass") {
			return section.pass;
		} else if (this.mfield === "fail") {
			return section.fail;
		} else if (this.mfield === "audit") {
			return section.audit;
		} else { // this can only be "year" as inputs have been validated from before
			return section.year;
		}
	}
	public validateSection(section: Section): boolean {
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
	private getSfield(section: Section): string {
		if (this.sfield === "dept") {
			return section.dept;
		} else if (this.sfield === "id") {
			return section.id;
		} else if (this.sfield === "instructor") {
			return section.instructor;
		} else if (this.sfield === "title") {
			return section.title;
		} else { // this can only be "uuid" as inputs have been validated from before
			return section.uuid;
		}
	}
	public validateSection(section: Section): boolean {
		let sectionVal: string = this.getSfield(section);
		if (this.inputString.includes("*")) {
			if (this.inputString[0] === "*" && this.inputString[this.inputString.length - 1] === "*") { // contains
				return sectionVal.includes(this.inputString);
			} else if (this.inputString[0] !== "*" && this.inputString[this.inputString.length - 1] === "*") { // starts
				//                                                                                                with
				return sectionVal.startsWith(this.inputString);
			} else { // ends with
				return sectionVal.endsWith(this.inputString);
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

	public validateSection(section: Section): boolean {
		return !this.getChildren()[0].validateSection(section);
	}
}
