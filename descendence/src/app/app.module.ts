import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { HttpClientModule } from '@angular/common/http';
import { MasterComponent } from './master/master.component';
import { LoginComponent } from './login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FailComponent } from './fail/fail.component';
import { CookieModule } from 'ngx-cookie';
import { LoginGuard } from './login.guard';
import { UserComponent } from './user/user.component';
import { UserService } from './user.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { UserSettingsComponent } from './user-settings/user-settings.component';
import { ImageService } from './services/image-service.service';

@NgModule({
	declarations: [
		AppComponent,
		HomeComponent,
		MasterComponent,
		LoginComponent,
		FailComponent,
		UserComponent,
		UserSettingsComponent,
	],
	imports: [
		CookieModule.forRoot(),
		BrowserModule,
		AppRoutingModule,
		HttpClientModule,
		ReactiveFormsModule,
		FormsModule,
		FontAwesomeModule
	],
	providers: [ UserService, ImageService ],
	bootstrap: [AppComponent]
})
export class AppModule { }
