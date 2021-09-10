import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from "@angular/router";
import { Injectable } from "@angular/core";

@Injectable()
export class chatGuardService implements CanActivate {

	constructor(private router: Router) {}
//TODO: add a check for if the chat is valid and if the user has access to the chat (aka redirect to password?)
	canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
		return true
		// if ()
		// if (history.state) {
			// console.log('valid chat');
			// return true;
		// }
		// console.log('not ok')
		// this.router.navigate(['home', {outlets: {chat: "search"}}], {skipLocationChange: true});
		// return false
	}
}