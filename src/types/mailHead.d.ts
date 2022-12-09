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
        reply_to:string,
        creationTime?: Date,
        mailServerId?:string,
        mailHeadId?:number

    }

}