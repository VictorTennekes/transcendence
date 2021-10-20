import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from "@angular/router";
import { Injectable } from "@angular/core";
import { SearchService } from "../search/search.service";
import { catchError, map } from "rxjs/operators";
import { Observable, of } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";

@Injectable()
export class chatGuardService implements CanActivate {

	constructor(private router: Router,
		private searchService: SearchService) {}

	canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> {
		const id: string = next.params['id'];
		return this.searchService.canAccessChat(id).pipe(map((response)=>{
			return response;
		},
		// (error: any) => {
		// return false;
		// }
		),
		catchError((err: HttpErrorResponse, caught: Observable<boolean>) => {
			if (err.status === 403) {
				this.router.navigate(['', {outlets: {chat: ['pass-chat', id]}}])
				return of(false);
			}
			this.router.navigate(['', {outlets: {chat: ['search', err.error.message]}}])
			// throw err;
			return of(false);
			//TODO: prevent error message on console
		}));
	}
}
