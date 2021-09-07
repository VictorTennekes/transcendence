import { Injectable } from "@angular/core";

@Injectable()
export class SharedValidatorService {
	private _valid = false;
	constructor() {
	}

	get valid() {
		return this._valid;
	}

	set valid(value: boolean) {
		this._valid = value;
	}
}
