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
}

export class StringNode extends Node {
	private sfield: string;
	private inputString: string;
	private negated: boolean;
	constructor(sfield: string, inputString: string, dataid: string) {
		super();
		this.inputString = inputString;
		this.sfield = sfield;
		this.negated = false;
		this.setDataID(dataid);
	}
	public setNegated() {
		this.negated = !this.negated;
	}

	public nodeMessage(): string {
		let s: string = "\ndataid: " + this.getdataID();
		return "______\nSTRING NODE WITH inputString: " + this.inputString + "\nsfield: " + this.sfield + s;
	}
}
export class InvalidNode extends Node {
	constructor() {
		super();
	}

	public nodeMessage(): string {
		return "Invalid node bruh";
	}
}
