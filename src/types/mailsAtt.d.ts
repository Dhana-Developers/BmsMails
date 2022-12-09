export {}

declare global{

    interface MailAttachment{
        attId:number,
        attName:string,
        attType:string,
        attExt:string,
        attLink?: URL,
        objectId:number
    }

}