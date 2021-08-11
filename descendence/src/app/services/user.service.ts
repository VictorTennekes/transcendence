import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
	providedIn: 'root'
})
export class UserService {
	private SERVER_URL = "/api/user/home";
	constructor( private http: HttpClient) { }

	handleError(error: HttpErrorResponse)
	{
		let errorMessage = 'Unknown error!';

		if (error.error instanceof ErrorEvent) {
			errorMessage = `Error: ${error.error.message}`;
		}
		else {
			errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
		}
		window.alert(errorMessage);
		return throwError(errorMessage);
	}
	
	public get() {
		return this.http.get(this.SERVER_URL).pipe(catchError(this.handleError));
	}
}
