import {InvalidNode, LogicNode, MathNode, Node, StringNode} from "./InsightNode";
import {InsightError} from "./IInsightFacade";

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
	public validateSField(sfield: string) {
		let bOne: boolean = sfield === "dept" || sfield === "id" || sfield === "instructor";
		let bTwo: boolean = sfield === "title" || sfield === "uuid";
		return bOne || bTwo;
	}
	public validateMField(mfield: string) {
		let bOne: boolean = mfield === "avg" || mfield === "pass" || mfield === "fail";
		let bTwo: boolean = mfield === "audit" || mfield === "year";
		return bOne || bTwo;
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
	private handleStringComparisonNegation(filter: any): Node {
		let val: any = Object.values(filter)[0]; // set as object so u can get keys and vals
		let skey: string = Object.keys(val)[0];
		let sfield: string = skey.split("_", 2)[1];
		let dataid: string = skey.split("_", 2)[1];
		let s: any = Object.values(val)[0];
		let inputString: string = s;
		let sNode: StringNode = new StringNode(sfield, inputString, dataid);
		sNode.setNegated();
		console.log(sNode.nodeMessage());
		return sNode;
	}
	private handleMathComparisonNegation(filter: any): Node {
		let key = Object.keys(filter)[0];
		let val: any = Object.values(filter)[0]; // set as object so u can get keys and vals
		let mkey: string = Object.keys(val)[0];
		let mfield: string = mkey.split("_", 2)[1];
		let dataid: string = mkey.split("_", 2)[0];
		let n: any = Object.values(val)[0];
		let num: number = n;
		if (key === "LT") {
			let mNode: Node = new MathNode("GT", mfield, num, dataid);
			console.log(mNode.nodeMessage());
			return mNode;
		} else if (key === "GT") {
			let mNode: Node = new MathNode("LT", mfield, num, dataid);
			console.log(mNode.nodeMessage());
			return mNode;
		} else {
			let mNode: Node = new MathNode("NEQ", mfield, num, dataid);
			console.log(mNode.nodeMessage());
			return mNode;
		}
	}
	private handleNegation(filter: any): Node {
		let key = Object.keys(filter)[0];
		if (this.isLogicComparison(key)) {
			return this.handleLogicComparisonNegation(filter);
		} else if (this.isMathComparison(key)) {
			return this.handleMathComparisonNegation(filter);
		} else if (this.isStringComparison(key)) {
			return this.handleStringComparisonNegation(filter);
		} else if (this.isNegation(key)) {
			let notNot = Object.values(filter)[0];
			console.log(notNot);
			return this.buildWhereTree(notNot);
		} else {
			throw new InsightError("Invalid key for filter");
		}
	}
	public buildWhereTree(query: any): Node {
		let key = Object.keys(query)[0];
		if (this.isLogicComparison(key)) {
			let lNode: Node = new LogicNode(key);
			let filterList: any = Object.values(query)[0];
			if (filterList.length === 0) {
				throw new InsightError();
			}
			console.log(lNode.nodeMessage());
			for (let filter in filterList) {
				lNode.addChild(this.buildWhereTree(filterList[filter]));
			}
			return lNode;
		} else if (this.isMathComparison(key)) {
			let val: any = Object.values(query)[0]; // set as object so u can get keys and vals
			let mkey: string = Object.keys(val)[0];
			let mfield: string = mkey.split("_", 2)[1];
			let dataid: string = mkey.split("_", 2)[0];
			let n: any = Object.values(val)[0];
			let num: number = n;
			let mNode: Node = new MathNode(key, mfield, num, dataid);
			console.log(mNode.nodeMessage());
			if (this.validateMField(mfield)) {
				return mNode;
			} else {
				throw new InsightError("Invalid mfield");
			}
		} else if (this.isStringComparison(key)) {
			let val: any = Object.values(query)[0];
			let skey: string = Object.keys(val)[0];
			let sfield: string = skey.split("_", 2)[1];
			let dataid: string = skey.split("_", 2)[0];
			let s: any = Object.values(val)[0];
			let inputString: string = s;
			let sNode: Node = new StringNode(sfield, inputString, dataid);
			console.log(sNode.nodeMessage());
			if (this.validateSField(sfield)) {
				return sNode;
			} else {
				throw new InsightError("Invalid sfield");
			}
		} else if (this.isNegation(key)) {
			let negFilter = Object.values(query)[0];
			console.log("Theres a negation...the following node will be automatically negated");
			return this.handleNegation(negFilter);
		} else {
			throw new InsightError("Invalid key for filter");
		}
	}
}
