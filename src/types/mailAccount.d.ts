export {}

declare global{
    interface MailAccount{
        id: number
        hostLoginAddress:string,
        disableMail?: boolean // deprecated
        name: string,
        accountType: string
    }
}