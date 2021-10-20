import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';

@Injectable({
	providedIn: 'root'
})
export class UrlService {
	private _previousUrl: string | null = null;
	private _currentUrl: string | null = null;
	constructor(
		private readonly router: Router
	) {
		this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event: any) => {
			this._previousUrl = this._currentUrl;
			this._currentUrl = event.url;
		});
	}

	get previousUrl() {
		return this._previousUrl;
	}
}
