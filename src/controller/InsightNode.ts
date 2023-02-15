export class Node {
	private children: Node[];
	constructor() {
		this.children = [];
	}
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
}

export class SMH {
	private str: string;
	constructor() {
		this.str = "hi";
	}
	public isLogicComparison(key: any): boolean {
		return key === "AND" || key === "OR";
	}
	public isMathComparison(key: any): boolean {
		return key === "LT" || key === "GT" || key === "EQ";
	}
	public isStringComparison(key: any): boolean {
		return key === "IS";
	}
	public isNegation(key: any): boolean {
		return key === "NOT";
	}
	private handleNegation(filter: any) {
		let key = Object.keys(filter)[0];
		if (this.isLogicComparison(key)) {
			if (key === "AND") {
				let lNode: Node = new LogicNode("OR");
			} else {
				let lNode: Node = new LogicNode("AND");
			}
		} else if (this.isMathComparison(key)) {
			if (key === "LT") {
				let val: any = Object.values(filter)[0]; // set as object so u can get keys and vals
				let mkey: string = Object.keys(val)[0];
				let mfield: string = mkey.split("_", 2)[1];
				let n: any = Object.values(val)[0];
				let num: number = n;
				let mNode: Node = new MathNode("GT", mfield, num);
			} else if (key === "GT") {
				let val: any = Object.values(filter)[0]; // set as object so u can get keys and vals
				let mkey: string = Object.keys(val)[0];
				let mfield: string = mkey.split("_", 2)[1];
				let n: any = Object.values(val)[0];
				let num: number = n;
				let mNode: Node = new MathNode("LT", mfield, num);
			} else {
				let val: any = Object.values(filter)[0]; // set as object so u can get keys and vals
				let mkey: string = Object.keys(val)[0];
				let mfield: string = mkey.split("_", 2)[1];
				let n: any = Object.values(val)[0];
				let num: number = n;
				let mNode: Node = new MathNode("NEQ", mfield, num);
			}
		} else if (this.isStringComparison(key)) {
			let val: any = Object.values(filter)[0];
			let skey: string = Object.keys(val)[0];
			console.log(skey);
			let sfield: string = skey.split("_", 2)[1];
			console.log(sfield);
			let s: any = Object.values(val)[0];
			let inputString: string = s;
			console.log(inputString);
			let sNode: StringNode = new StringNode(sfield, inputString);
			sNode.setNegated();
		} else if (this.isNegation(key)) {
			let notNot = Object.values(filter)[0];
			console.log(notNot);
			this.buildWhereTree(notNot);
		}
	}
	public buildWhereTree(query: any) {
		let key = Object.keys(query)[0];
		if (this.isLogicComparison(key)) {
			let lNode: Node = new LogicNode(key);
			let filterList: any = Object.values(query)[0];
			for (let filter in filterList) {
				// lNode.addChild(this.buildWhereTree(filterList[filter]));
			}
			// return lNode;
		} else if (this.isMathComparison(key)) {
			let val: any = Object.values(query)[0]; // set as object so u can get keys and vals
			let mkey: string = Object.keys(val)[0];
			let mfield: string = mkey.split("_", 2)[1];
			let n: any = Object.values(val)[0];
			let num: number = n;
			let mNode: Node = new MathNode(key, mfield, num);
		} else if (this.isStringComparison(key)) {
			let val: any = Object.values(query)[0];
			let skey: string = Object.keys(val)[0];
			console.log(skey);
			let sfield: string = skey.split("_", 2)[1];
			console.log(sfield);
			let s: any = Object.values(val)[0];
			let inputString: string = s;
			console.log(inputString);
			let sNode: Node = new StringNode(sfield, inputString);
		} else if (this.isNegation(key)) {
			let negFilter = Object.values(query)[0];
			console.log(negFilter);
			this.handleNegation(negFilter);
		}
	}
}
