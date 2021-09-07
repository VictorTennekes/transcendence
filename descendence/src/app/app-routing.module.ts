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

const routes: Routes = [
	//guard the main page by LoginGuard
	{
		canActivate: [LoginGuard],
		path: '',
		component: MasterComponent,
		children: [
			{
				path: '',
				component: FailComponent
			},
			{
				path: 'users',
				component: UserComponent
			},
			{
				path: 'settings',
				component: UserSettingsComponent
			}
		]
	},
	//login page
	{
		path: 'home',
		component: HomeComponent
	},
	//2fa page
	{
		canActivate: [TwoFactorGuard],
		path: '2fa',
		component: TwoFactorComponent
	},
	//redirect to '' if nothing is matched
	{
		path: 'search',
		component: SearchComponent
	},
	{
		path: 'chat',
		component: ChatComponent,
		canActivate: [chatGuardService]
	},
	{
		path: 'new-chat',
		component: CreateChatComponent
	},
	{
		path: 'chat-pass',
		component: ChatPassComponent
	},
	{
		path: 'login',
		component: LoginComponent
	},
	{
		path: '**',
		redirectTo: ''
	}
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
	providers: [ LoginGuard ]
})
export class AppRoutingModule { }
