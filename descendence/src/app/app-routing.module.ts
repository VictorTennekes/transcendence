import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FailComponent } from './fail/fail.component';
import { HomeComponent } from './home/home.component';
import { LoginGuard } from './login.guard';
import { MasterComponent } from './master/master.component';
import { TwoFactorGuard } from './two-factor.guard';
import { TwoFactorComponent } from './two-factor/two-factor.component';
import { UserSettingsComponent } from './user-settings/user-settings.component';
import { UserComponent } from './user/user.component';
import { ViewComponent } from './game/view/view.component';
import { MatchComponent } from './match/match.component';
import { ChatComponent } from './chat/chat-client/chat.component';
import { SearchComponent } from './chat/search/search.component';
import { chatGuardService } from './chat/chat-client/chatGuard.service';
import { CreateChatComponent } from './chat/create-chat/create-chat.component';
import { ChatPassComponent } from './chat/chat-pass/chat-pass.component';
import { SearchService } from './chat/search/search.service';
import { SettingsComponent } from './chat/settings/settings.component';
import { chatAdminGuard } from './chat/chat-client/chatAdminGuard.service';
import { GameGuard } from './game.guard';
import { PostComponent } from './game/post/post.component';
import { PostGameGuard } from './post-game.guard';
import { ProfileComponent } from './profile/profile.component';
import { StatsComponent } from './profile/stats/stats.component';
import { HistoryComponent } from './profile/history/history.component';
import { HistoryResolver } from './profile/history.resolver';
import { ProfileGuard } from './profile/profile.guard';
import { PostgameResolver } from './postgame.resolver';
import { AcceptComponent } from './accept/accept.component';
import { LoadcircleComponent } from './accept/loadcircle/loadcircle.component';
import { SetupGuard } from './setup.guard';
import { AccountSetupComponent } from './account-setup/account-setup.component';
import { ProfileResolver } from './profile/profile.resolver';
import { StatsResolver } from './profile/stats.resolver';
import { FriendResolver } from './profile/friend.resolver';
import { CurrentUserResolver } from './profile/current-user.resolver';
import { OnlineResolver } from './profile/online.resolver';
import { IngameResolver } from './ingame.resolver';

const routes: Routes = [
	//guard the main page by LoginGuard
	{
		component: AccountSetupComponent,
		path: 'setup',
	},
	{
		canActivate: [LoginGuard, SetupGuard],
		path: '',
		component: MasterComponent,
		children: [
			{
				canActivate: [PostGameGuard],
				path: 'post/:id',
				component: PostComponent,
				resolve: { data: PostgameResolver},
			},
			{
				path: 'play/:intra_name',
				resolve: {
					currentGame: IngameResolver
				},
				component: MatchComponent
			},
			{
				path: 'profile/:id',
				canActivate: [ ProfileGuard ],
				resolve: {
					user: ProfileResolver,
					friend: FriendResolver,
					currentUser: CurrentUserResolver,
					online: OnlineResolver
				},
				runGuardsAndResolvers: "always",
				component: ProfileComponent,
				children: [
					{
						path: 'stats',
						resolve: { stats: StatsResolver },
						component: StatsComponent
					},
					{
						path: 'history',
						resolve: {
							history: HistoryResolver,
						},
						component: HistoryComponent
					},
					{
						path: '',
						redirectTo: 'stats',
						pathMatch: 'full'
					}
				]
			},
			{
				path: 'pass-chat/:id',
				component: ChatPassComponent,
				outlet: "chat"
			},
			{
				canActivate: [GameGuard],
				path: 'game/:id',
				component: ViewComponent
			},
			{
				path: 'users',
				component: UserComponent
			},
			{
				path: 'settings',
				resolve: { user: CurrentUserResolver },
				component: UserSettingsComponent
			},
			{
				path: 'search/:error',
				component: SearchComponent,
				outlet: "chat"
			},
			{
				path: 'new-chat',
				component: CreateChatComponent,
				outlet: "chat"
			},
			{
				canActivate: [chatGuardService],
				path: 'get-chat/:id',
				component: ChatComponent,
				outlet: "chat"
			},
			{
				canActivate: [chatAdminGuard],
				path: 'settings/:id',
				component: SettingsComponent,
				outlet: "chat"
			},
			{
				path: '',
				redirectTo: 'play/',
				pathMatch: 'full'
			}
		]
	},
	//login page
	{
		path: 'auth',
		component: HomeComponent
	},
	//2fa page
	{
		canActivate: [TwoFactorGuard],
		path: '2fa',
		component: TwoFactorComponent
	},
	{
		path: '',
		redirectTo: 'home',
		pathMatch: 'full'
	},
	{
		path: '**',
		redirectTo: ''
	}
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
	providers: [
		LoginGuard,
		GameGuard,
		PostGameGuard,
		chatGuardService,
		SearchService,
		chatAdminGuard,
		HistoryResolver,
		ProfileGuard,
		PostgameResolver,
		ProfileResolver,
		StatsResolver,
		FriendResolver,
		CurrentUserResolver,
		OnlineResolver,
		IngameResolver,
	]
})
export class AppRoutingModule { }
