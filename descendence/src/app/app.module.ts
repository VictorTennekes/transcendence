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
import { TwoFactorComponent } from './two-factor/two-factor.component';
// import { ChatComponent } from './components/chat/chat.component';
import { ChatComponent } from './chat/chat-client/chat.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
// import { SearchComponent } from './components/search/search.component';
import { SearchComponent } from './chat/search/search.component';
import { SocketIoConfig, SocketIoModule } from 'ngx-socket-io';
// import { chatGuardService } from './components/chat/chatGuard.service';
import { chatGuardService } from './chat/chat-client/chatGuard.service';
// import { CreateChatComponent } from './create-chat/create-chat.component';
import { CreateChatComponent } from './chat/create-chat/create-chat.component';
import { MatRadioModule } from '@angular/material/radio';
// import { ChatPassComponent } from './chat-pass/chat-pass.component';
import { ChatPassComponent } from './chat/chat-pass/chat-pass.component';
import { CommonModule } from '@angular/common';
import { MATERIAL_SANITY_CHECKS } from '@angular/material/core';
// import { ChatContainerComponent } from './chat-container/chat-container.component';
import { ChatContainerComponent } from './chat/chat-container/chat-container.component';
import { SettingsComponent } from './chat/settings.component';

const config: SocketIoConfig = { url: 'http://localhost:3000', options: { transports: ['websocket']} };

@NgModule({
	declarations: [
		AppComponent,
		HomeComponent,
		MasterComponent,
		SearchComponent,
		ChatComponent,
		LoginComponent,
		FailComponent,
		CreateChatComponent,
		ChatPassComponent,
		UserComponent,
		UserSettingsComponent,
		FocusOverlayComponent,
		QrCodeDirective,
		OnlyNumber,
		TwoFactorComponent,
  ChatContainerComponent,
  SettingsComponent
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
		NgxKjuaModule,
		BrowserAnimationsModule,
        MatInputModule,
        MatListModule,
		MatIconModule,
		MatButtonModule,
		MatRadioModule,
		SocketIoModule.forRoot(config),
		CommonModule
	],
	entryComponents: [ FocusOverlayComponent],
	providers: [
		UserService,
		ImageService,
		FocusOverlayService,
		SharedValidatorService,
		chatGuardService,
		{
		provide: MATERIAL_SANITY_CHECKS,//am i really doing this?
		useValue: false
		}
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
