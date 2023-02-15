import {InvalidNode, LogicNode, MathNode, Node, StringNode} from "./InsightNode";

export class InsightQuery {
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
	private handleLogicComparisonNegation(filter: any): Node {
		let filterList: any = Object.values(filter)[0];
		let key = Object.keys(filter)[0];
		if (key === "AND") {
			let lNode: Node = new LogicNode("OR");
			console.log("We went and -> or");
			console.log(lNode.nodeMessage());
			for (let f in filterList) {
				lNode.addChild(this.buildWhereTree(filterList[f]));
			}
			return lNode;
		} else {
			let lNode: Node = new LogicNode("AND");
			console.log("We went or -> and");
			console.log(lNode.nodeMessage());
			for (let f in filterList) {
				lNode.addChild(this.buildWhereTree(filterList[f]));
			}
			return lNode;
		}
	}
	private handleNegation(filter: any): Node {
		let key = Object.keys(filter)[0];
		let val: any = Object.values(filter)[0]; // set as object so u can get keys and vals
		let okey: string = Object.keys(val)[0];
		let ofield: string = okey.split("_", 2)[1];
		if (this.isLogicComparison(key)) {
			return this.handleLogicComparisonNegation(filter);
		} else if (this.isMathComparison(key)) {
			let n: any = Object.values(val)[0];
			let num: number = n;
			if (key === "LT") {
				let mNode: Node = new MathNode("GT", ofield, num);
				console.log(mNode.nodeMessage());
				return mNode;
			} else if (key === "GT") {
				let mNode: Node = new MathNode("LT", ofield, num);
				console.log(mNode.nodeMessage());
				return mNode;
			} else {
				let mNode: Node = new MathNode("NEQ", ofield, num);
				console.log(mNode.nodeMessage());
				return mNode;
			}
		} else if (this.isStringComparison(key)) {
			console.log(ofield);
			let s: any = Object.values(val)[0];
			let inputString: string = s;
			console.log(inputString);
			let sNode: StringNode = new StringNode(ofield, inputString);
			sNode.setNegated();
			console.log(sNode.nodeMessage());
			return sNode;
		} else if (this.isNegation(key)) {
			let notNot = Object.values(filter)[0];
			console.log(notNot);
			return this.buildWhereTree(notNot);
		} else {
			console.log("Invalid node");
			return new InvalidNode();
		}
	}
	public buildWhereTree(query: any): Node {
		let key = Object.keys(query)[0];
		if (this.isLogicComparison(key)) {
			let lNode: Node = new LogicNode(key);
			let filterList: any = Object.values(query)[0];
			console.log(lNode.nodeMessage());
			for (let filter in filterList) {
				lNode.addChild(this.buildWhereTree(filterList[filter]));
			}
			return lNode;
		} else if (this.isMathComparison(key)) {
			let val: any = Object.values(query)[0]; // set as object so u can get keys and vals
			let mkey: string = Object.keys(val)[0];
			let mfield: string = mkey.split("_", 2)[1];
			let n: any = Object.values(val)[0];
			let num: number = n;
			let mNode: Node = new MathNode(key, mfield, num);
			console.log(mNode.nodeMessage());
			return mNode;
		} else if (this.isStringComparison(key)) {
			let val: any = Object.values(query)[0];
			let skey: string = Object.keys(val)[0];
			let sfield: string = skey.split("_", 2)[1];
			let s: any = Object.values(val)[0];
			let inputString: string = s;
			let sNode: Node = new StringNode(sfield, inputString);
			console.log(sNode.nodeMessage());
			return sNode;
		} else if (this.isNegation(key)) {
			let negFilter = Object.values(query)[0];
			console.log("Theres a negation...the following node will be automatically negated");
			return this.handleNegation(negFilter);
		} else {
			return new InvalidNode();
		}
	}
}
