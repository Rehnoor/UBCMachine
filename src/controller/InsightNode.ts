export abstract class Node {
	private children: Node[];
	constructor() {
		this.children = [];
	}

	public abstract nodeMessage(): string;

	public addChild(child: Node) {
		this.children.push(child);
	}
	public getChildren(): Node[] {
		return this.children;
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
	private dataid: string;
	private num: number;
	constructor(type: string, mfield: string, num: number, dataid: string) {
		super();
		this.num = num;
		this.mfield = mfield;
		this.type = type;
		this.dataid = dataid;
	}
	public nodeMessage(): string {
		let s: string = "\ndataid: " + this.dataid;
		return "______\nMATH NODE WITH TYPE: " + this.type + "\nmfield: " + this.mfield + "\nnumber: " + this.num + s;
	}
}

export class StringNode extends Node {
	private sfield: string;
	private dataid: string;
	private inputString: string;
	private negated: boolean;
	constructor(sfield: string, inputString: string, dataid: string) {
		super();
		this.inputString = inputString;
		this.sfield = sfield;
		this.negated = false;
		this.dataid = dataid;
	}
	public setNegated() {
		this.negated = !this.negated;
	}

	public nodeMessage(): string {
		let s: string = "\ndataid: " + this.dataid;
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
