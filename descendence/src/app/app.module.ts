import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { HttpClientModule } from '@angular/common/http';
import { MasterComponent } from './master/master.component';
import { LoginComponent } from './login/login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ChatComponent } from './components/chat/chat.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { FailComponent } from './fail/fail.component';
import { SearchComponent } from './components/search/search.component';
import { SocketIoConfig, SocketIoModule } from 'ngx-socket-io';

const config: SocketIoConfig = { url: 'http://localhost:3000', options: { transports: ['websocket']} };
// const config: SocketIoConfig = { url: 'http://nestjs:3000', options: {} };

@NgModule({
	declarations: [
		AppComponent,
		HomeComponent,
		MasterComponent,
        SearchComponent,
        ChatComponent,
		LoginComponent,
		FailComponent
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		HttpClientModule,
		ReactiveFormsModule,
		BrowserAnimationsModule,
        MatInputModule,
        MatListModule,
		SocketIoModule.forRoot(config)
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule { }
