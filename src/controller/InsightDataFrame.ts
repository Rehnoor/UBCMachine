import {InsightDatasetKind} from "./IInsightFacade";

export class Section {
	constructor(
		public readonly uuid: string,
		public readonly id: string,
		public readonly title: string,
		public readonly instructor: string,
		public readonly dept: string,
		public readonly year: number,
		public readonly avg: number,
		public readonly pass: number,
		public readonly fail: number,
		public readonly audit: number
	) {}
}

export class DataFrame {
	private readonly id: string;
	private numRows: number = 0;
	private readonly kind: InsightDatasetKind;
	private sections: Section[] = [];
	constructor(id: string, kind: InsightDatasetKind) {
		this.id = id;
		this.kind = kind;
	}
	public addSection(section: Section) {
		this.sections.push(section);
		this.numRows++;
	}
	public getNumRows(): number {
		return this.numRows;
	}
	public getID(): string {
		return this.id;
	}
	public getKind(): InsightDatasetKind {
		return this.kind;
	}
}
