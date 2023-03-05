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

export class Room {
	constructor(
		public readonly fullname: string,
		public readonly shortname: string,
		public readonly number: string,
		public readonly name: string, // should be shortname + "_" + number
		public readonly address: string,
		public readonly lat: number,
		public readonly lon: number,
		public readonly seats: number,
		public readonly type: string,
		public readonly furniture: string,
		public readonly href: string

	) {}
}

export class DataFrame {
	private readonly id: string;
	private numRows: number = 0;
	private readonly kind: InsightDatasetKind;
	private readonly sections: Section[] = [];
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

	public getSections(): Section[] {
		return this.sections;
	}
}
