export{}

declare global{

    interface IdbMailHead{
        mailObjectId:number,
        mailSubject:string,
        mailCc:Array<string>,
        mailBcc:Array<string>,
        mailReceipients:Array<string>,
        mailAttachments: Array<IdbMailAttachment>,
        sender:string,
        mailFlagId:number
        reply_to:string,
        spam:boolean,
        trashed: boolean,
        archived: boolean,
        creationTime: string,
        mailServerId?:string,
        mailHeadId?:number,
    }

}