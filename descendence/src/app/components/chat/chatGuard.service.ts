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
//TODO: add a check for if the chat is valid and if the user has access to the chat (aka redirect to password?)
	canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> {
		console.log("can activate");
		console.log(next.params);
		const id: string = next.params['id'];
		return this.searchService.canAccessChat(id).pipe(map((response)=>{
			return true;
		},
		(error: any) => {
		return false;
		}),
		catchError((err: HttpErrorResponse, caught: Observable<boolean>) => {
			if (err.status === 403) {
				this.router.navigate(['/home', {outlets: {chat: ['pass-chat', id]}}])
			}
			return of(false);
		}));
	}
}