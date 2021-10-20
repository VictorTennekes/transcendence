import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from "@angular/router";
import { Injectable } from "@angular/core";
import { SearchService } from "../search/search.service";
import { catchError, map } from "rxjs/operators";
import { Observable, of } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";

@Injectable()
export class chatAdminGuard implements CanActivate {

	constructor(private router: Router,
		private searchService: SearchService) {}

	canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> {
		const id: string = next.params['id'];
		return this.searchService.userIsAdmin(id).pipe(map((response)=>{
			return response;
		}));
	}
}