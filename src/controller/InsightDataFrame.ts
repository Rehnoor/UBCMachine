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
		this.name = this.shortname + "_" + this.number;
	}
}

export abstract class DataSet {
	private readonly id: string;
	private readonly kind: InsightDatasetKind;
	protected numRows: number = 0;

	constructor(id: string, kind: InsightDatasetKind) {
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

	public abstract addRow(row: Section | Room): boolean;

	public abstract getRows(): Array<Section | Room>;
}

export class SectionDataSet extends DataSet{
	private readonly rows: Section[] = [];

	public addRow(row: Section | Room): boolean {
		if (row instanceof Section) {
			this.rows.push(row);
			this.numRows++;
			return true;
		}
		return false;
	}

	public getRows(): Section[] {
		return this.rows;
	}
}

export class RoomDataSet extends DataSet {

	private readonly rows: Room[] = [];
	public addRow(row: Section | Room): boolean {
		if (row instanceof Room) {
			this.rows.push(row);
			this.numRows++;
			return true;
		}
		return false;
	}

	public getRows(): Room[] {
		return this.rows;
	}

}
