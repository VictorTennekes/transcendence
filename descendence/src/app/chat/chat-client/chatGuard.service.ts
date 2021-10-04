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
		console.log("can activate");
		console.log(next.params);
		const id: string = next.params['id'];
		return this.searchService.canAccessChat(id).pipe(map((response)=>{
			console.log("doing stuf, response:")
			console.log(response);
			return response;
		},
		// (error: any) => {
		// return false;
		// }
		),
		catchError((err: HttpErrorResponse, caught: Observable<boolean>) => {
			console.log("caught error in guard")
			if (err.status === 403) {
				this.router.navigate(['', {outlets: {chat: ['pass-chat', id]}}])
				return of(false);
			}
			console.log(err);
			this.router.navigate(['', {outlets: {chat: ['search', err.error.message]}}])
			// throw err;
			return of(false);
			//TODO: prevent error message on console
		}));
	}
}
