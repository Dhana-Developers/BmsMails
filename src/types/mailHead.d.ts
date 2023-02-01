export {}

declare global{

    interface MailHead{

        mailObjectId:number,
        mailSubject:string,
        mailCc:Array<string>,
        mailBcc:Array<string>,
        mailReceipients:Array<string>,
        mailAttachments: Array<MailAttachment>,
        sender:string,
        mailFlagId:number
        reply_to:string,
        spam:boolean,
        trashed: boolean,
        archived: boolean,
        creationTime?: Date,
        mailServerId?:string,
        mailHeadId?:number,

    }

}