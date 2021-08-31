import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from "@angular/router";
import { Injectable } from "@angular/core";

@Injectable()
export class chatGuardService implements CanActivate {

	constructor(private router: Router) {}

	canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
		if (history.state) {
			return true;
		}
		this.router.navigate(["/search"]);
		return false
	}
}