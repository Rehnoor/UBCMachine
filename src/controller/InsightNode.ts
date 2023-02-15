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
	private num: number;
	constructor(type: string, mfield: string, num: number) {
		super();
		this.num = num;
		this.mfield = mfield;
		this.type = type;
	}
	public nodeMessage(): string {
		return "______\nMATH NODE WITH TYPE: " + this.type + "\nmfield: " + this.mfield + "\nnumber: " + this.num;
	}
}

export class StringNode extends Node {
	private sfield: string;
	private inputString: string;
	private negated: boolean;
	constructor(sfield: string, inputString: string) {
		super();
		this.inputString = inputString;
		this.sfield = sfield;
		this.negated = false;
	}
	public setNegated() {
		this.negated = !this.negated;
	}

	public nodeMessage(): string {
		return "______\nSTRING NODE WITH inputString: " + this.inputString + "\nsfield: " + this.sfield + this.negated;
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
