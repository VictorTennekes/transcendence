export class newMsg {
    constructor(public message: string) {}
}

export class retMessage {
    constructor(public id: string,
                public time: Date,
                public owner: string,
                public message: string) {}
}
