import {InsightDatasetKind} from "./IInsightFacade";
export abstract class Row {
	public readonly rowType: string;
	constructor(rowType: string) {
		this.rowType = rowType;
	}
}
export class Section extends Row {
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
	) {
		super("section");
	}
}

export class Room extends Row{

	public readonly name: string;
	constructor(
		public readonly fullname: string,
		public readonly shortname: string,
		public readonly number: string,
		// public readonly name: string, // should be shortname + "_" + number
		public readonly address: string,
		public readonly lat: number,
		public readonly lon: number,
		public readonly seats: number,
		public readonly type: string,
		public readonly furniture: string,
		public readonly href: string

	) {
		super("room");
		this.name = this.shortname + "_" + this.number;
	}
}

export class DataSet {
	private readonly id: string;
	private readonly kind: InsightDatasetKind;
	private numRows: number = 0;

	private readonly rows: Array<Section | Room>;

	constructor(id: string, kind: InsightDatasetKind) {
		this.rows = [];
		this.id = id;
		this.kind = kind;
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

	public addRow(row: Section | Room) {
		this.rows.push(row);
		this.numRows++;
	};

	public getRows(): Array<Section | Room> {
		return this.rows;
	}
}
