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
import { MatIconModule } from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import { FailComponent } from './fail/fail.component';
import { SearchComponent } from './components/search/search.component';
import { SocketIoConfig, SocketIoModule } from 'ngx-socket-io';
import { chatGuardService } from './components/chat/chatGuard.service';
import { CreateChatComponent } from './create-chat/create-chat.component';
import {MatRadioModule} from '@angular/material/radio';

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
		CreateChatComponent
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		HttpClientModule,
		ReactiveFormsModule,
		BrowserAnimationsModule,
        MatInputModule,
        MatListModule,
		MatIconModule,
		MatButtonModule,
		MatRadioModule,
		SocketIoModule.forRoot(config)
	],
	providers: [chatGuardService],
	bootstrap: [AppComponent]
})
export class AppModule { }
