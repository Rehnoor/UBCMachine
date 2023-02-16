import {LogicNode, MathNode, NegationNode, Node, StringNode} from "./InsightNode";
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
	private handleLogicComparison(query: any, key: any): Node{
		let lNode: Node = new LogicNode(key);
		let filterList: any = Object.values(query)[0];
		if (filterList.length === 0) {
			throw new InsightError("Logic filter was given empty filter list, must contain at least one filter");
		}
		console.log(lNode.nodeMessage());
		for (let filter in filterList) {
			lNode.addChild(this.buildWhereTree(filterList[filter]));
		}
		return lNode;
	}
	private handleMathComparison(query: any, key: any): Node{
		let val: any = Object.values(query)[0]; // set as any so u can get keys and vals
		if (Object.keys(val).length !== 1) {
			throw new InsightError("Too few or too many arguments for Math Filter");
		}
		let mkey: string = Object.keys(val)[0];
		let mfield: string = mkey.split("_", 2)[1];
		let dataid: string = mkey.split("_", 2)[0];
		if (dataid === "") {
			throw new InsightError("dataid can not be null");
		}
		let n: any = Object.values(val)[0];
		let num: number = n;
		let mNode: Node = new MathNode(key, mfield, num, dataid);
		console.log(mNode.nodeMessage());
		if (this.validateMField(mfield)) {
			return mNode;
		} else {
			throw new InsightError("Invalid mfield");
		}
	}
	private validateWildcard(inputString: string): boolean {
		if (inputString.includes("*")) {
			if (inputString.split("*").length > 3) {
				return false;
			}
			if (inputString[0] === "*" && inputString[inputString.length - 1] === "*") { // contains
				return true;
			} else if (inputString[0] !== "*" && inputString[inputString.length - 1] === "*") { // starts
				return true;
			} else if (inputString[0] === "*" && inputString[inputString.length - 1] !== "*"){ // ends with
				return true;
			} else {
				return false;
			}
		}
		return true;
	}
	private handleStringComparison(query: any, key: any): Node{
		let val: any = Object.values(query)[0];
		if (Object.keys(val).length !== 1) {
			throw new InsightError("Too few or too many arguments for String Filter");
		}
		let skey: string = Object.keys(val)[0];
		if (!skey.includes("_")) {
			throw new InsightError("Invalid skay, a valid skey requires an underscore");
		}
		let sfield: string = skey.split("_", 2)[1];
		let dataid: string = skey.split("_", 2)[0];
		if (dataid === "") {
			throw new InsightError("dataid can not be null");
		}
		let s: any = Object.values(val)[0];
		let inputString: string = s;
		if (!this.validateWildcard(inputString)) { // TODO
			throw new InsightError("Invalid input string, (*) only be the first or last characters of input strings");
		}
		let sNode: Node = new StringNode(sfield, inputString, dataid);
		console.log(sNode.nodeMessage());
		if (this.validateSField(sfield)) {
			return sNode;
		} else {
			throw new InsightError("Invalid sfield");
		}
	}
	private handleNegation(query: any, key: any): Node{
		if (Object.values(query).length !== 1) {
			throw new InsightError("Negation filter can only have one internal filter");
		}
		let internalFilter: any = Object.values(query)[0];
		let nNodeChild = this.buildWhereTree(internalFilter);
		let nNode: Node = new NegationNode(nNodeChild);
		console.log(nNode.nodeMessage());
		return nNode;
	}
	public buildWhereTree(query: any): Node {
		let key = Object.keys(query)[0];
		if (this.isLogicComparison(key)) {
			return this.handleLogicComparison(query, key);
		} else if (this.isMathComparison(key)) {
			return this.handleMathComparison(query, key);
		} else if (this.isStringComparison(key)) {
			return this,this.handleStringComparison(query, key);
		} else if (this.isNegation(key)) {
			return this.handleNegation(query, key);
		} else {
			throw new InsightError("Invalid key for filter");
		}
	}
}
