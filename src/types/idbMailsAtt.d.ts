export {}

declare global{

    interface IdbMailAttachment{
        attId:number,
        attName:string,
        attType:string,
        attExt:string,
        attLink: string,
        objectId:number
    }

}