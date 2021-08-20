import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FailComponent } from './fail/fail.component';
import { HomeComponent } from './home/home.component';
import { LoginGuard } from './login.guard';
import { LoginComponent } from './login/login.component';
import { MasterComponent } from './master/master.component';
import { UserComponent } from './user/user.component';

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
			}
		]
	},
	//login page
	{
		path: 'home',
		component: HomeComponent
	},
	//redirect to '' if nothing is matched
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
