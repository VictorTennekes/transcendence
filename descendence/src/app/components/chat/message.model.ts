export class newMsg {
    constructor(
        public chat: string,
        public message: string) {}
}

export class retMessage {
    constructor(
                public chat: string,
                public id: string,
                public time: Date,
                public owner: string,
                public message: string) {}
}

export class chatModel {
    constructor(
        public id: string,
        public name: string,
        public user: string
    ) {}
}

export class createChatModel {
    constructor(
        public name: string,
        public user: string
    ) {}
}