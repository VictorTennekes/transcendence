import { Component, OnInit } from '@angular/core';
import { UserEntity, UserService } from '../user.service';
import { ActivatedRoute } from '@angular/router';
import { secondsToDhms } from '../game/post/post.component';

@Component({
	selector: 'app-profile',
	templateUrl: './profile.component.html',
	styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
	
	constructor(
		private userService: UserService,
		private route: ActivatedRoute,
	) { }
	
	id: string | null = "";
	displayName: string = "";
	avatarUrl: string = "";
	loginId: string ="";
	user: any;
	
	
	get avatar() {
		let style = "background-image: ";
		
		if (this.avatarUrl) {
			style += `url(cdn/assets/${this.avatarUrl});`
		}
		else {
			style += 'linear-gradient(135.2deg, #C4377B -6.4%, #6839B5 49.35%, #0D6EFF 104.83%, #0D6EFF 104.84%, #0D6EFF 104.85%);'
		}
		return style;
	}
	
	ngOnInit(): void {
		this.route.data.subscribe((data: any) => {
			this.displayName = data.user.display_name;
			this.loginId = data.user.intra_name;
			this.avatarUrl = data.user.avatar_url;
		});
	}
}
