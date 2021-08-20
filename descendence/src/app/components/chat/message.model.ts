
export interface userModel {
    intra_name: string;
    display_name: string;
}

export interface newMsg {
    chat: string;
    message: string;
}

export interface retMessage {
    chat: string;
    id: string;
    time: Date;
    owner: userModel;
    message: string;
}

export interface chatModel {
    id: string,
    name: string,
    user: string
}

export interface createChatModel {
    name: string,
    user: string
}