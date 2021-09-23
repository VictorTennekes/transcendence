import { Identifiers } from "@angular/compiler";

export interface userModel {
	intra_name: string;
	display_name: string;
	avatar_url: string;
}

export interface retMessage {
	chat: chatModel;
	id: string;
	time: Date;
	owner: userModel;
	message: string;
}

export interface newMessage {
	chat: string;
	message: string;
}

export interface chatModel {
	id: string,
	name: string,
	users: userModel[],
	admins: userModel[],
	messages: retMessage[],
	visibility: string;
}

export interface createChatModel {
	name: string,
	users: string[],
	admins: string[],
	visibility: string;
	password: string;
}

export interface editChatModel {
	id: string,
	admin: string,
	mutedUser: string,
	mutedTime: Date,
	bannedUser: string,
	bannedTime: Date,
	visibility: string,
	password: string
}