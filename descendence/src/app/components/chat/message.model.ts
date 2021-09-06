export interface userModel {
	intra_name: string;
	display_name: string;
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
	messages: retMessage[]
}

export interface createChatModel {
	name: string,
	user: string
}
