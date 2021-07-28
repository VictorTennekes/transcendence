import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { MasterComponent } from './master/master.component';

const routes: Routes = [
	{
		path: '',
		component: HomeComponent
	},
	{
		path: 'home',
		component: MasterComponent
	},
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule { }
