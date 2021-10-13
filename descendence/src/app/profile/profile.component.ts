import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { ActivatedRoute } from '@angular/router';
import { secondsToDhms } from '../game/post/post.component';

interface GameDurations {
	total: number,
	shortest: number,
	longest: number
};

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
	durations: GameDurations;

	updateAvatar(url: string | null) {
		let style = "background-image: ";

		if (url)
			style += `url(cdn/assets/${url});`
		else
			style += 'linear-gradient(135.2deg, #C4377B -6.4%, #6839B5 49.35%, #0D6EFF 104.83%, #0D6EFF 104.84%, #0D6EFF 104.85%);'
		return style;
	}

	timeFormattedString(seconds: number) {
		return (secondsToDhms(seconds));
	}

	ngOnInit(): void {
		this.route.params.subscribe(params => {
			this.id = params['id'];
			this.userService.getUserByLogin(this.id!).subscribe((user: any) => {
				this.displayName = user.display_name;
				this.avatarUrl = this.updateAvatar(user.avatar_url);
				this.loginId = user.intra_name;
			})
		})
		this.durations = {
			total: 23401,
			shortest: 324,
			longest: 764,
		};
	}
  

}
