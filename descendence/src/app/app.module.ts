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
import { FocusOverlayComponent } from './focus-overlay/focus-overlay.component';
import { FullscreenOverlayContainer, OverlayContainer, OverlayModule } from '@angular/cdk/overlay';
import { FocusOverlayService } from './focus-overlay/focus-overlay.service';
import { NgxKjuaModule } from 'ngx-kjua';
import { QrCodeDirective } from './focus-overlay/qrcode.directive';
import { OnlyNumber } from './focus-overlay/only-numbers.directive';
import { SharedValidatorService } from './focus-overlay/shared-validator.service';

@NgModule({
	declarations: [
		AppComponent,
		HomeComponent,
		MasterComponent,
		LoginComponent,
		FailComponent,
		UserComponent,
		UserSettingsComponent,
		FocusOverlayComponent,
		QrCodeDirective,
		OnlyNumber
	],
	imports: [
		CookieModule.forRoot(),
		BrowserModule,
		AppRoutingModule,
		HttpClientModule,
		ReactiveFormsModule,
		FormsModule,
		FontAwesomeModule,
		OverlayModule,
		NgxKjuaModule
	],
	entryComponents: [ FocusOverlayComponent],
	providers: [
		UserService,
		ImageService,
		FocusOverlayService,
		SharedValidatorService
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
