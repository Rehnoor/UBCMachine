import * as zip from "jszip";
import * as fs from "fs-extra";

import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
} from "./IInsightFacade";
import {LogicNode, MathNode, Node, StringNode} from "./InsightNode";
import {QueryEngine} from "./QueryEngine";
import {QueryValidator} from "./QueryValidator";
import DataProcessor from "./DataProcessor";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	private dataProcessor: DataProcessor;
	private readonly queryEngine: QueryEngine;
	private readonly queryValidator: QueryValidator;
	constructor() {
		this.queryEngine = new QueryEngine();
		this.dataProcessor = new DataProcessor();
		this.queryValidator = new QueryValidator();
	}

	public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		return this.dataProcessor.addDataset(id, content, kind);
	}

	public removeDataset(id: string): Promise<string> {
		return this.dataProcessor.removeDataset(id);
	}

	private getTreeID(tree: Node): string {
		if (tree.getChildren().length === 0) {
			return tree.getdataID();
		} else {
			return this.getTreeID(tree.getChildren()[0]);
		}
	}

	private frameIDMatch(treeID: string): boolean {
		for (let x in this.dataProcessor.dataSets) {
			if (this.dataProcessor.dataSets[x].getID() === treeID) {
				return true;
			}
		}
		return false;
	}

	private dataIDConsistencyCheck(tree: Node, treeID: string): boolean {
		if (tree.getChildren().length === 0) {
			return tree.getdataID() === treeID;
		} else {
			let check: boolean = true;
			for (let x in tree.getChildren()) {
				check = check && this.dataIDConsistencyCheck(tree.getChildren()[x], treeID);
			}
			return check;
		}
	}

	private dataIDisValid(tree: Node): boolean {
		let treeID: string = this.getTreeID(tree);
		if (!this.frameIDMatch(treeID)) {
			throw new InsightError("The dataid referenced in the query does not match any dataset currently added");
		} else {
			if (this.dataIDConsistencyCheck(tree, treeID)) {
				return true;
			} else {
				throw new InsightError("The dataID in this query is not the same for all leaf nodes");
			}
		}
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		if (query === null) {
			return Promise.reject(new InsightError("Query can not be null"));
		} else if (typeof query === "object") {
			let invalidBlocks: boolean = Object.keys(query).length !== 2;
			if (Object.keys(query).includes("WHERE") && Object.keys(query).includes("OPTIONS") && !invalidBlocks) {
				let whereBlockIndex = Object.keys(query).indexOf("WHERE");
				let optionsBlockIndex = Object.keys(query).indexOf("OPTIONS");
				let topLevelVals = Object.values(query);
				let optionsVal: any = topLevelVals[optionsBlockIndex];
				// NO COLUMNS BLOCK
				if (!Object.keys(optionsVal).includes("COLUMNS")) {
					return Promise.reject(new InsightError("Valid query must include COLUMNS portion"));
				}
				let columnsIndex: number = Object.keys(optionsVal).indexOf("COLUMNS");
				let columnsVal: any = Object.values(optionsVal)[columnsIndex];
				// COLUMNS IS EMPTY
				if (Object.values(columnsVal).length === 0) {
					return Promise.reject(new InsightError("COLUMNS section must have at least one key"));
				}
				let columnList: string[] = Object.values(columnsVal);
				// ***********TRANSFORMATIONS STUFF***********
				let transformationsBlockVals: any = topLevelVals[Object.keys(query).indexOf("TRANSFORMATIONS")];
				// ***********OPTIONS STUFF***********
				let orderIndex: number = Object.keys(optionsVal).indexOf("ORDER");
				let orderVal: any = Object.values(optionsVal)[orderIndex];
				try {
					this.validateColumnsAndOrder(optionsVal, columnList, orderVal);
				} catch (e) {
					return Promise.reject(e);
				}
				// ***********************************
				// ************WHERE STUFF***********
				let whereVal: any = topLevelVals[whereBlockIndex];
				try {
					let queryTree: Node = this.queryEngine.buildWhereTree(whereVal, columnList);
					if (!this.dataIDisValid(queryTree)) {
						return Promise.reject(new InsightError("Entered dataid is not valid"));
					}
					let dataIDForQuery: string = this.queryEngine.getDataID(queryTree);
					for (let dataFrame of this.dataProcessor.dataSets) {
						if (dataFrame.getID() === dataIDForQuery) {
							// perform query on dataframe
							// return the result
							let result = this.queryEngine.runQuery(dataFrame, queryTree, columnList, orderVal,
								transformationsBlockVals);
							return Promise.resolve(result);
						}
					}
				}  catch (e) {
					return Promise.reject(e);
				}
			} else {
				return Promise.reject(new InsightError("Query must have only WHERE and OPTIONS block"));
			}
		}
		return Promise.reject(new InsightError("query must be of type object"));
	}

	// THROWS: InsightError
	private validateColumnsAndOrder(optionsVal: object, columnList: string[], orderVal: any) {
		if (Object.keys(optionsVal).includes("ORDER")) {
			// it is ordered
			if(!this.queryEngine.isValidColumnsWOrder(columnList, this.dataProcessor.dataSets, orderVal)) {
				throw new InsightError("Column or order arguments are invalid");
			}
		} else { // no order
			if (!this.queryEngine.isValidColumns(columnList, this.dataProcessor.dataSets)) {
				throw new InsightError("Column arguments are invalid");
			}
		}
	}

	public listDatasets(): Promise<InsightDataset[]> {
		return this.dataProcessor.listDatasets();
	}
}
