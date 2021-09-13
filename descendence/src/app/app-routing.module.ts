import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FailComponent } from './fail/fail.component';
import { HomeComponent } from './home/home.component';
import { LoginGuard } from './login.guard';
import { LoginComponent } from './login/login.component';
import { MasterComponent } from './master/master.component';
import { TwoFactorGuard } from './two-factor.guard';
import { TwoFactorComponent } from './two-factor/two-factor.component';
import { UserSettingsComponent } from './user-settings/user-settings.component';
import { UserComponent } from './user/user.component';
import { ChatComponent } from './components/chat/chat.component';
import { MatInputModule } from '@angular/material/input'
import { SearchComponent } from './components/search/search.component';
import { chatGuardService } from './components/chat/chatGuard.service';
import { CreateChatComponent } from './create-chat/create-chat.component';
import { ChatPassComponent } from './chat-pass/chat-pass.component';
import { ChatContainerComponent } from './chat-container/chat-container.component';
import { SearchService } from './components/search/search.service';

const routes: Routes = [
	//guard the main page by LoginGuard
	{
		canActivate: [LoginGuard],
		path: 'home',
		component: MasterComponent,
		children: [
	
			{
				path: 'pass-chat/:id',
				component: ChatPassComponent,
				outlet: "chat"
			},
			{
				path: 'game',
				component: FailComponent
			},
			{
				path: 'users',
				component: UserComponent
			},
			{
				path: 'settings',
				component: UserSettingsComponent
			},
			{
				path: 'search',
				component: SearchComponent,
				outlet: "chat"
			},
			{
				path: 'new-chat',
				component: CreateChatComponent,
				outlet: "chat"
			},
			{
				path: 'get-chat/:id',
				component: ChatComponent,
				canActivate: [chatGuardService],
				outlet: "chat"
			},
		
			{
				path: '',
				// component: SearchComponent,
				redirectTo: 'game',
				pathMatch: 'full'
				// outlet: "chat"
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
		path: 'login',
		component: LoginComponent
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
	providers: [ LoginGuard, chatGuardService, SearchService ]
})
export class AppRoutingModule { }
