import {InsightDatasetKind} from "./IInsightFacade";


export class Section {
	constructor(private readonly uuid: string, private readonly id: string, private readonly title: string,
				private readonly instructor: string, private readonly dept: string, private readonly year: number,
				private readonly avg: number, private readonly pass: number,
				private readonly fail: number, private readonly audit: number) {}

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
