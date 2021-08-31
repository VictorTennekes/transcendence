import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FailComponent } from './fail/fail.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { MasterComponent } from './master/master.component';
import { ChatComponent } from './components/chat/chat.component';
import { MatInputModule } from '@angular/material/input'
import { SearchComponent } from './components/search/search.component';
import { chatGuardService } from './components/chat/chatGuard.service';

const routes: Routes = [
	{
		path: '',
		component: HomeComponent
	},
	{
		path: 'home',
		component: MasterComponent
	},
	{
		path: 'success',
		component: MasterComponent
	},
	{
		path: 'fail',
		component: FailComponent
	},
	{
		path: 'login',
		component: LoginComponent
	},
    {
		path: 'search',
		component: SearchComponent
	},
	{
		path: 'chat',
		component: ChatComponent,
		canActivate: [chatGuardService]
	}
];

@NgModule({
	imports:
        [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule { }
