export {}

declare global{
    interface MailBody{

        mailBodyId:number,
        mailBodyParay: Array<string>
        mailObjectId:number,
        mailBodyPayload?:any,
        mailBodyType?:string

    }
}