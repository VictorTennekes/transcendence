import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class ImageService {
	
	constructor(
		private readonly http: HttpClient
	) { }
	
	upload(file: File) {
		const formData = new FormData();
		formData.append('avatar', file);

		return this.http.post('api/user/image_upload', formData);
	}

	delete() {
		return this.http.get('api/user/image_delete');
	}
}
